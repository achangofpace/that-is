/***
 * the only background script rn
 */

import {
	DEFAULT_MAPPINGS,
	MAPPINGS,
	DEFAULT_SETTINGS,
	SETTINGS,
	SETTINGS_AUTOSAVE
} from './database.js';

import {
	RECIPIENT_BACKGROUND,
	BACKGROUND_GET_MAPPINGS,
	BACKGROUND_SAVE_MAPPINGS,
	BACKGROUND_ADD_MAPPING,
	BACKGROUND_EDIT_MAPPING,
	BACKGROUND_DELETE_MAPPING,
	BACKGROUND_RESTORE_DEFAULT_MAPPINGS,
	BACKGROUND_APPLY_MAPPINGS_PRIORITY_UPDATE,
	BACKGROUND_GET_CONSOLIDATED_MAPPING,
	BACKGROUND_GET_SETTINGS,
	BACKGROUND_SAVE_SETTINGS,
	BACKGROUND_SAVE_STATE,
} from './messaging_protocol.js';

import {
	Smeagol,
	SUPPORTED_BROWSERS
} from './smeagol.js';

export { // for testing
	applyMappingsPriorityUpdates
};

/**
 * Runs when extension is installed the first time by the browser,
 * initialize local storage with the default mappings and settings
 */
chrome.runtime.onInstalled.addListener(() => {
	console.log("installing, saving default_mappings to local storage");
	chrome.storage.local.set({
		[MAPPINGS]: DEFAULT_MAPPINGS,
		[SETTINGS]: DEFAULT_SETTINGS
	})
	.catch((err) => {
		console.error(err);
	});
});

/**
 * Handle all messages received by this background script, called whenever a
 * message is sent by any other endpoint using the sendMessage API
 * @param {*} message - Data object sent by message sender
 * @returns {Promise<Object>} A promise representing an Object sent as a response to the message
 */
function backgroundScriptMessageListener(message) {
	if (message.intended_recipient !== RECIPIENT_BACKGROUND) {
		return Promise.resolve();
	}
	if (message.command === BACKGROUND_GET_MAPPINGS) {
		return getMappings();
	}
	else if (message.command === BACKGROUND_SAVE_MAPPINGS) {
		if (!message.MAPPINGS_TO_SAVE) {
			return Promise.reject(Error("missing `MAPPINGS_TO_SAVE`, bad request"));
		}
		return saveMappings();
	}
	else if (message.command === BACKGROUND_ADD_MAPPING) {
		if (!message.NEW_MAPPING) {
			return Promise.reject(Error("missing `NEW_MAPPING`, bad request"));
		}
		return addNewMapping(message.NEW_MAPPING);
	}
	else if (message.command === BACKGROUND_EDIT_MAPPING) {
		if (!message.MAPPING_NAME) {
			return Promise.reject(Error("missing `MAPPING_NAME`, bad request"));
		}
		if (!message.EDITED_MAPPING) {
			return Promise.reject(Error("missing `EDITED_MAPPING`, bad request"));
		}
		if (!(message.MAPPING_NAME === message.EDITED_MAPPING.mapping_name)) {
			return Promise.reject(Error(`'MAPPING_NAME' (${message.MAPPING_NAME}) does not match 'EDITED_MAPPING' (${message.EDITED_MAPPING.mapping_name}), bad request`));
		}
		return editMapping(message.MAPPING_NAME, message.EDITED_MAPPING);
	}
	else if (message.command === BACKGROUND_DELETE_MAPPING) {
		if (!message.MAPPING_NAME) {
			return Promise.reject(Error("missing `MAPPING_NAME`, bad request"));
		}
		return deleteMapping(message.MAPPING_NAME);
	}
	else if (message.command === BACKGROUND_APPLY_MAPPINGS_PRIORITY_UPDATE) {
		if (!message.MAPPINGS_PRIORITY_UPDATE_OBJECT) {
			return Promise.reject(Error("missing `MAPPINGS_PRIORITY_UPDATE_OBJECT`, bad request"));
		}
		if (!message.MAPPINGS_TO_UPDATE_PRIORITY) {
			return Promise.reject(Error("missing `MAPPINGS_TO_UPDATE_PRIORITY`, bad request"));
		}
		return new Promise((resolve, reject) => {
			let updated_mappings;
			try {
				updated_mappings = applyMappingsPriorityUpdates(
					message.MAPPINGS_PRIORITY_UPDATE_OBJECT,
					message.MAPPINGS_TO_UPDATE_PRIORITY
				);
			} catch (err) {
				return reject(err);
			}
			getSettings()
			.then((settings) => {
				if (settings[SETTINGS_AUTOSAVE]) {
					saveMappings(updated_mappings)
					.then(() => {
						return resolve({
							updated_mappings: updated_mappings,
							autosave_success: true
						});
					})
					.catch((saveMappingsErr) => {
						console.error(saveMappingsErr)
						// user still gets their updated mappings
						return resolve({
							updated_mappings: updated_mappings,
							autosave_success: false
						});
					});
				} else {
					return resolve({
						updated_mappings: updated_mappings
					});
				}
			})
			.catch((err) => {
				console.error(err);
				// user still gets their updated mappings
				resolve({updated_mappings: updated_mappings, autosave_success: false});
			});
		});
	}
	else if (message.command === BACKGROUND_RESTORE_DEFAULT_MAPPINGS) {
		return restoreDefaultMappings();
	}
	else if (message.command === BACKGROUND_GET_CONSOLIDATED_MAPPING) {
		if (!message.MAPPINGS_TO_CONSOLIDATE) {
			return Promise.reject(Error("missing `MAPPINGS_TO_CONSOLIDATE`, bad request"));
		}
		return Promise.resolve(getConsolidatedMapping(message.MAPPINGS_TO_CONSOLIDATE));
	}
	else if (message.command === BACKGROUND_GET_SETTINGS) {
		return getSettings();
	}
	else if (message.command === BACKGROUND_SAVE_SETTINGS) {
		if (!message.SETTINGS_TO_SAVE) {
			return Promise.reject(Error("missing `SETTINGS_TO_SAVE`, bad request"));
		}
		return saveSettings();
	}
	else if (message.command === BACKGROUND_SAVE_STATE) {
		if (!message.MAPPINGS_TO_SAVE) {
			return Promise.reject(Error("missing `MAPPINGS_TO_SAVE`, bad request"));
		}
		if (!message.SETTINGS_TO_SAVE) {
			return Promise.reject(Error("missing `SETTINGS_TO_SAVE`, bad request"));
		}
		return saveState(message.MAPPING_TO_SAVE, message.SETTINGS_TO_SAVE);
	}
	else {
		return Promise.reject(Error(`unrecognized command '${message.command}'`));
	}
}

/* Attach the above function to handle all messages.
 * All messages sent using the browser API `sendMessage` will be detected.
 */
let smeagol = new Smeagol(SUPPORTED_BROWSERS.chrome);
smeagol.addOnMessageListener(backgroundScriptMessageListener);

/**
 * Load settings from storage, throw err if "SETTINGS" is not found
 * @returns {Promise<Object>} Promise represents settings object (@see database.js)
 */
function getSettings() {
	return new Promise((resolve, reject) => {
		chrome.storage.local.get([SETTINGS])
		.then((storage_get_result) => {
			if (storage_get_result[SETTINGS]) {
				return resolve(storage_get_result[SETTINGS]);
			}
			throw Error('no "settings" found in storage?');
		})
		.catch((storage_get_settings_err) => {
			return reject(storage_get_settings_err);
		});
	});
}

/**
 * Get "MAPPINGS" from storage, throw err if "MAPPINGS" is not found
 * @returns {Promise<Object[]>} Promise represents an array of mapping objects (@see database.js)
 */
function getMappings() {
	return new Promise((resolve, reject) => {
		chrome.storage.local.get(MAPPINGS)
		.then((storage_get_result) => {
			return resolve(storage_get_result[MAPPINGS]);
		})
		.catch((storage_get_mappings_err) => {
			return reject(storage_get_mappings_err);
		});
	});
}

/**
 * Add a new mapping to the database.
 * @param {Object} new_mapping The mapping to add to `MAPPINGS` in the database.
 * @returns {Promise} A promise representing the success or failure of the add attempt.
 */
function addNewMapping(new_mapping) {
	return new Promise((resolve, reject) => {
		getMappings()
		.then((db_mappings) => {
			for (let i=0; i<db_mappings.length; i++) {
				if (db_mappings[i].mapping_name === new_mapping.mapping_name) {
					throw Error(`Invalid mapping name, ${new_mapping.mapping_name} already exists in database`);
				}
			}
			db_mappings.push(new_mapping);
			return saveMappings(db_mappings);
		})
		.then(() => {
			return resolve();
		})
		.catch((err) => {
			return reject(err);
		});
	});
}

/**
 * Edit a mapping in the database.
 * @param {String} mapping_name The name of the mapping to be edited.
 * @param {Object} edited_mapping The mapping to replace the mapping found in the
 * database with the given `mapping_name`.
 * @returns {Promise} A promise representing the success or failure of the edit attempt.
 */
function editMapping(mapping_name, edited_mapping) {
	return new Promise((resolve, reject) => {
		getMappings()
		.then((db_mappings) => {
			for (let i=0; i<db_mappings.length; i++) {
				if (db_mappings[i].mapping_name === mapping_name) {
					db_mappings[i] = edited_mapping;
					return saveMappings(db_mappings);
				}
			}
			throw Error(`Mapping with ${mapping_name} not found in database: ${db_mappings.map(mapping=>mapping.mapping_name)}`);
		})
		.then(() => {
			return resolve();
		})
		.catch((err) => {
			return reject(err);
		});
	});
}

/**
 * Delete a mapping in the database.
 * @param {*} mapping_name The name of the mapping in the database that will be deleted.
 * @returns {Promise} A promise representing the success or failure of the delete attempt.
 */
function deleteMapping(mapping_name) {
	return new Promise((resolve, reject) => {
		getMappings()
		.then((db_mappings) => {
			for (let i=0; i<db_mappings.length; i++) {
				if (db_mappings[i].mapping_name === mapping_name) {
					db_mappings.splice(i, 1);
					return saveMappings(db_mappings);
				}
			}
			throw Error(`Mapping with ${mapping_name} not found in database: ${db_mappings.map(mapping=>mapping.mapping_name)}`);
		})
		.then(() => {
			return resolve();
		})
		.catch((err) => {
			return reject(err);
		})
	});
}

/**
 * Overwrite the mappings in the database with the built-in defaults @see database.js
 * @returns A promise indicating the success or failure of an attempt to rewrite the default mappings to the db
 */
function restoreDefaultMappings() {
	return chrome.storage.local.set({
		[MAPPINGS]: DEFAULT_MAPPINGS
	});
}

/**
 * Apply priority updates to an array of mappings
 * @param {Object[]} modified_mappings_from_popup Array of objects like
 * 	[
 * 		{"name": 'mapping_name_a', "selected": 'true'},
 * 		{"name": 'mapping_name_b', "selected": 'false'}
 * 	]
 * @param {Object[]} mappings_to_update see database#SETTINGS for valid mappings structure
 * @returns {Object[]} Updated mappings
 */
function applyMappingsPriorityUpdates(modified_mappings_from_popup, mappings_to_update) {
	let output = [];
	if (modified_mappings_from_popup.length !== mappings_to_update.length) {
		let larger = modified_mappings_from_popup.length > mappings_to_update.length;
		throw Error(`larger list of mappings found in ${larger ? 'popup' : 'database'} found than in ${larger ? 'database' : 'popup'}`);
	}
	for (const { name: modified_mapping_name, selected: modified_selected } of modified_mappings_from_popup) {
		let mapping_to_update = mappings_to_update.find((mapping) => mapping.mapping_name === modified_mapping_name);
		if (!mapping_to_update) {
			throw Error(`${modified_mapping_name} not found in database list`);
		}
		output.push({
			...mapping_to_update,
			selected: modified_selected
		});
	}
	if (output.length !== mappings_to_update.length) {
		throw Error(`${modified_mapping_name} not found in popup list`);
	}
	return output;
}

/**
 * Overwrite all mappings and settings
 * @param {Object[]} MAPPINGS @see database.js
 * @param {Object} SETTINGS @see database.js
 * @returns {Promise} Promise represents an indication of whether save worked
 */
function saveState(mappings, settings) {
	return chrome.storage.local.set({
		[MAPPINGS]: mappings,
		[SETTINGS]: settings
	});
}

/**
 * Overwrite MAPPINGS
 * @param {Object[]} mappings An array of mappings @see database.js
 * @returns {Promise} Promise represents an indication of whether save worked
 */
function saveMappings(mappings) {
	if (!validateMappingsArray(mappings)) {
		return Promise.reject(Error("invalid mappings array"));
	}
	return chrome.storage.local.set({[MAPPINGS]: mappings});
}

function validateMappingsArray(mappings_array) {
	for (let mapping in mappings_array) {
		if (!validateMapping(mapping)) {
			return false;
		}
	}
	return true;
}

function validateMapping(mapping_object) {
	if (mapping_object.name === "") {
		return false;
	}
	// TODO: fill this out
	return true;
}

/**
 * Overwrite SETTINGS
 * @param {Object} settings A settings object @see database.js
 * @returns {Promise} Promise represents an indication of whether save worked
 */
function saveSettings(settings) {
	return chrome.storage.local.set({[SETTINGS]: settings});
}

/**
 * Consolidates selected mappings into one big mapping.
 * Keys appearing in multiple selected mappings will take on the value
 * of the selected mapping appearing earlier in the array
 * (user should rank the mappings' priorities using the drag and drop).
 * @param {Object[]} mappings array of mapping objects (@see database.js)
 * 	should be in the user-set order to indicate their priority
 * @returns {Object} A single Object containing every key and corresponding
 * annotation from `mappings`
 */
function consolidateSelectedMappings(mappings) {
	let consolidated_mapping = {};
	/*
	 * mappings should be in the user-set order, which indicates their priority
	 * thus selected_mappings will also follow this order
	 *
	 * iterating over them backwards means that lower priority mappings will be
	 * added first to the consolidated_mapping and then overwritten by higher priority mappings
	 */
	let selected_mappings = mappings.filter((mapping) => mapping.selected);
	for (let i=selected_mappings.length-1; i>=0; i--) {
		Object.assign(consolidated_mapping, selected_mappings[i].mapping);
	}
	return consolidated_mapping;
}

/**
 * @param {Object[]} mappings array of mapping objects (@see database.js)
 * 	should be in the user-set order to indicate their priority
 * @returns {Object} A single Object containing every key and corresponding
 * 	annotation from `mappings`
 */
function getConsolidatedMapping(mappings) {
	return consolidateSelectedMappings(mappings);
}