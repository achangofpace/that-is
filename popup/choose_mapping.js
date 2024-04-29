/*** popup script reloads every time the popup reopens */
import {
	RECIPIENT_BACKGROUND,
	BACKGROUND_GET_MAPPINGS,
	BACKGROUND_SAVE_MAPPINGS,
	BACKGROUND_ADD_MAPPING,
	BACKGROUND_EDIT_MAPPING,
	BACKGROUND_DELETE_MAPPING,
	BACKGROUND_APPLY_MAPPINGS_PRIORITY_UPDATE,
	BACKGROUND_GET_SETTINGS,
	BACKGROUND_SAVE_SETTINGS,
	RECIPIENT_CONTENT,
	CONTENT_ANNOTATE,
	CONTENT_REMOVE_ANNOTATIONS
} from "../messaging_protocol.js";

import {
	MAPPINGS,
	SETTINGS,
	SETTINGS_AUTOSAVE
} from '../database.js';

/**
 * Enums for names of Views
 */
const VIEW_NAMES = Object.freeze({
	MAPPING_SELECT_VIEW: "MAPPING_SELECT_VIEW",
	CREATE_MAPPING_VIEW: "CREATE_MAPPING_VIEW",
	EDIT_MAPPING_VIEW: "EDIT_MAPPING_VIEW"
});

/**
 * Global variable holding a reference to the current View.
 * One of
 * - MappingsSelectionView
 * - CreateNewMappingView
 * - EditMappingView
 * - (TODO: SettingsView)
 */
let current_view;

/**
 * WIP
 */
function readMappingsFromFile() {
	const curFiles = this.files;
	if (curFiles.length === 0) {
		const para = document.createElement("p");
		para.textContent = "No files currently selected for upload";
	} else {
		console.log(curFiles[0]);
		// parse JSON
		// add mappings to database
		browser.runtime.sendMessage({
			"command": "",
			"update_object": curFiles[0]
		});
	}
}

/**
 * Send a `CONTENT_ANNOTATE` message (see messaging_protocol.js) to the content
 * script in the active tab to annotate the pages passed in `tabs`.
 * @param {Tab[]} tabs - An array of tabs to be annotated
 * (@see https://developer.mozilla.org/en-US/docs/Mozilla/Add-ons/WebExtensions/API/tabs).
 * @param {Object[]} mappings - An array of mappings (see database.js for
 * mappings typdef).
 * @returns {Promise} A promise representing the success or failure of an
 * attempt to annotate the `tabs`.
 */
function annotate(tabs, mappings) {
	// call content script to annotate
	return browser.tabs.sendMessage(tabs[0].id, {
		intended_recipient: RECIPIENT_CONTENT,
		command: CONTENT_ANNOTATE,
		MAPPINGS: mappings
	});
}

/**
 * Send a `CONTENT_REMOVE_ANNOTATIONS` message (see messaging_protocol.js) to
 * the content script to remove annotations from the pages passed in `tabs`.
 * @param {Tab[]} tabs - An array of tabs to remove annotations from.
 * (@see https://developer.mozilla.org/en-US/docs/Mozilla/Add-ons/WebExtensions/API/tabs)
 * @returns {Promise} A promise representing the success or failure of an
 * attempt to remove all annotations from the `tabs`
 */
function removeAnnotations(tabs) {
	return browser.tabs.sendMessage(tabs[0].id, {
		intended_recipient: RECIPIENT_CONTENT,
		command: CONTENT_REMOVE_ANNOTATIONS
	});
}

/**
 * There was an error executing the script.
 * Display the popup's error message
 */
function reportExecuteScriptError(error) {
	console.error(`Failed to annotate: ${error.message}`);
	new SnackBar({
		status: "error",
		message: "Can't annotate this web page",
		position: "tr"
	});
}

function dragStart(e) {
	this.classList.add('dragging');
}

function dragEnter(e) {
	this.classList.add('over');
}

function dragOver(e) {
	e.preventDefault();
	let list = e.currentTarget.parentElement;
	this.classList.add('over');
	const draggingItem = document.querySelector(".dragging");
	let siblings = [...list.querySelectorAll(".draggable:not(.dragging)")];
	let nextSibling = siblings.find(sibling => {
		return e.clientY <= sibling.offsetTop + sibling.offsetHeight / 2;
	});
	list.insertBefore(draggingItem, nextSibling);
}

function dragLeave(e) {
	this.classList.remove('over');
}

function dragDrop(e) {
	this.classList.remove('over');
}

function dragEnd(e) {
	this.classList.remove('dragging');
	// TODO: autosave once dragging is over (figure out which list got dragged and save it)
}

/**
 * Add 'dragstart', 'dragend', 'dragover', 'drop', 'dragenter', and 'dragleave'
 * event handlers to an row in a draggable list.
 * @param {*} list - A reference to the container that the row is in.
 * @param {*} row - A row in a popup list to add dragging event listeners to.
 */
function addDragEventListeners(row) {
	row.addEventListener('dragstart', dragStart);
	row.addEventListener('dragenter', dragEnter);
	row.addEventListener('dragover', dragOver);
	row.addEventListener('dragleave', dragLeave);
	row.addEventListener('drop', dragDrop);
	row.addEventListener('dragend', dragEnd);
}

/**
 * TODO: decide if I want to use this
 * @param {*} options - An map of strings on to booleans to indicate which
 * icons to use.
 * @returns {Node} A div with the requested icons.
 */
function getRowIcons(options) {
	let icon_container = document.createElement('div');
	icon_container.setAttribute('class', 'row-icon-container');
	if (options["edit"]) {
		let edit_icon = document.createElement('img');
		edit_icon.setAttribute('class', 'edit-icon');
		edit_icon.setAttribute('src', '../icons/edit.svg');
		edit_icon.setAttribute('title', 'Edit');
		icon_container.appendChild(edit_icon);
	}
	if (options["delete"]) {
		let delete_icon = document.createElement('img');
		delete_icon.setAttribute('class', 'delete-icon');
		delete_icon.setAttribute('src', '../icons/delete.svg');
		delete_icon.setAttribute('title', 'Delete');
		icon_container.appendChild(delete_icon);
	}
	if (options["grip"]) {
		let grip_icon = document.createElement('img');
		grip_icon.setAttribute('class', 'grip-icon');
		grip_icon.setAttribute('src', '../icons/grip-horizontal-line-svgrepo-com.svg');
		grip_icon.setAttribute('title', 'grip');
		icon_container.appendChild(grip_icon);
	}
	return icon_container;
}

/**
 * Helper function to call the background script to add a mapping to the
 * database.
 * @param {Object} new_mapping - The mapping object to be added to the database.
 * @returns {Promise} A Promise representing the success or failure of the
 * addition of the new mapping to the database.
 */
function _addMappingToDatabase(new_mapping) {
	return browser.runtime.sendMessage({
		intended_recipient: RECIPIENT_BACKGROUND,
		command: BACKGROUND_ADD_MAPPING,
		NEW_MAPPING: new_mapping
	});
}

/**
 * Helper function to call background script to edit a mapping in the database.
 * @param {String} mapping_name - The name of the mapping to be edited.
 * @param {Object} edited_mapping - A mapping object altered by the user.
 * @returns {Promise} A Promise representing success or failure of the edit
 * attempt.
 */
function _editMappingInDatabase(mapping_name, edited_mapping) {
	return browser.runtime.sendMessage({
		intended_recipient: RECIPIENT_BACKGROUND,
		command: BACKGROUND_EDIT_MAPPING,
		MAPPING_NAME: mapping_name,
		EDITED_MAPPING: edited_mapping
	});
}

/**
 * Helper function to call the background script to delete a mapping from the
 * database.
 * @param {String} mapping_name - The name of the mapping to be deleted.
 * @returns {Promise} A Promise indicating the success or failure of the delete
 * attempt.
 */
function _deleteMappingFromDatabase(mapping_name) {
	return browser.runtime.sendMessage({
		intended_recipient: RECIPIENT_BACKGROUND,
		command: BACKGROUND_DELETE_MAPPING,
		MAPPING_NAME: mapping_name
	});
}

/**
 * Helper function to call the background script to get a copy of the list of
 * mappings in in the database updated to match the state of the list of
 * mappings in the popup set by the user.
 * @param {Object[]} user_update_object - A list of objects containing
 * mappings' names, order, and selection status.
 * @example
 * 	[
 * 		{ "name": "mapping_name_2", "selected": true },
 * 		{ "name":" mapping_name_1", "selected": false },
 * 		{ "name": "mapping_name_3", "selected": true }
 * 	]
 * @param {Object[]} mappings_to_update - A list of mappings objects to be
 * updated with order and selection status of user_update_object.
 * - e.g. @see database.js
 * @returns {Promise} A Promise representing the success or failure of an
 * attempt to create an updated mappings list.
 */
function _applyMappingsPriorityUpdates(user_update_object, mappings_to_update_priority) {
	return browser.runtime.sendMessage({
		intended_recipient: RECIPIENT_BACKGROUND,
		command: BACKGROUND_APPLY_MAPPINGS_PRIORITY_UPDATE,
		MAPPINGS_PRIORITY_UPDATE_OBJECT: user_update_object,
		MAPPINGS_TO_UPDATE_PRIORITY: mappings_to_update_priority
	});
}

/**
 * Helper function to call the background script to get all `MAPPINGS`.
 * @returns {Promise<Object[]>} An array of mapping objects
 * (see database.js for typedef)
 */
function _getMappings() {
	return browser.runtime.sendMessage({
		intended_recipient: RECIPIENT_BACKGROUND,
		command: BACKGROUND_GET_MAPPINGS
	});
}

/**
 * Helper function to call the background script to get all `SETTINGS`.
 * @returns {Promise<Object>} A settings object (see database.js for typedef)
 */
function _getSettings() {
	return browser.runtime.sendMessage({
		intended_recipient: RECIPIENT_BACKGROUND,
		command: BACKGROUND_GET_SETTINGS
	});
}

/**
 * A map of `VIEW_NAMES` (the different types of UI views) onto generators for
 * them (i.e. calls to to their constructors).
 */
const view_generators = {
	[VIEW_NAMES.MAPPING_SELECT_VIEW]: (payload, transitionFunction) => new MappingsSelectionView(payload, transitionFunction),
	[VIEW_NAMES.CREATE_NEW_MAPPING_VIEW]: (payload, transitionFunction) => new CreateNewMappingView(payload, transitionFunction),
	[VIEW_NAMES.EDIT_MAPPING_VIEW]: (payload, transitionFunction) => new EditMappingView(payload, transitionFunction)
};

/**
 * @callback TransitionFunction
 * @param {*} transitionTo - An enum to indicate which view will be transitioned
 * into from the current view.
 * @param {*} payload - Data required to create the view that is being
 * transitioned to. For example, an edit view needs to know which mapping is
 * being edited.
 */

/**
 * Implements TransistionFunction. Checks which view will be transitioned to,
 * destroys the current view, and generates the new view.
 * @param {*} target_view - An enum that represents which view will be created
 * and transitioned into.
 * @param {*} payload - Data required to create the new view.
 */
function transitionViews(target_view, payload={}) {
	current_view.destroy();
	current_view = view_generators[target_view](payload, transitionViews);
}

/**
 * Class representing the list in a Mappings Selection View
 *  Contains:
 * - an ordered list (<ol>) containing
 *   - list items (<li>) containing
 *     - a checkbox input field to track selection status
 *     - a label for the input to indicate which mapping is selected
 *     - icon to click to edit the mapping
 *     - icon to click to delete the mapping from the list (and from the database)
 *     - grip icon to indicate that the list item is draggable
 * @property {HTMLElement} select_mapping_list_element - A reference to
 * the <ol> this class creates and manages.
 */
class SelectMappingsListComponent {
	/**
	 * Create a draggable list of mappings by creating rows for each mapping,
	 * inserting them into the list, and then adding event handlers for dragging
	 * behaviors.
	 * @param {Object[]} mappings_list - A list of mappings (see database.js for
	 * mappings typedef)
	 * @param {transitionFunction} transition_function - A function supplied by
	 * the containing view that handles transitioning to another view.
	 */
	constructor(mappings_list, transition_function) {
		this.select_mapping_list_element = document.createElement('ol');
		this.select_mapping_list_element.setAttribute('class', "mapping-selection-list draggable-list");
		mappings_list
		.forEach((mapping) => {
			let mapping_row = this.createRowInMappingsSelectionViewList(mapping, transition_function);
			this.select_mapping_list_element.appendChild(mapping_row);
			addDragEventListeners(mapping_row);
		});
	}

	/**
	 * Create a row for a draggable list of mappings for a select-mapping-view.
	 * @param {Object} mapping - A mapping to create a row item for
	 * (see database.js for a mapping typedef).
	 * @param {transitionFunction} transition_function - A function used to
	 * transition from the the view containing this list to the edit mapping
	 * view.
	 * @returns {HTMLElement} A reference to the newly created row in the list
	 * so it can be appended to the list.
	 */
	createRowInMappingsSelectionViewList(mapping, transition_function) {
		let list_row_element = document.createElement('li');
		list_row_element.setAttribute("id", `${mapping.mapping_name}`);
		list_row_element.setAttribute('class', 'draggable');
		list_row_element.setAttribute('draggable', 'true');

		list_row_element.innerHTML = `
			<div class="mapping-row-content">
				<div class="row-left-side-content">
					<label class="mapping-name">
						<input class="mapping-toggle" type="checkbox"></input>
						${mapping.mapping_name}
					</label>
				</div>
				<div class="row-icon-container">
					<img class="edit-icon"   src="../icons/edit.svg"                             title="Edit this mapping"></img>
					<img class="delete-icon" src="../icons/delete.svg"                           title="Delete this mapping"></img>
					<img class="grip-icon"   src="../icons/grip-horizontal-line-svgrepo-com.svg" title="This row is draggable!"></img>
				</div>
			</div>
		`;

		list_row_element.querySelector(".edit-icon").onclick = () => {
			transition_function(
				VIEW_NAMES.EDIT_MAPPING_VIEW,
				{mapping_to_edit: mapping}
			);
		};

		list_row_element.querySelector(".delete-icon").onclick = () => {
			_deleteMappingFromDatabase(mapping.mapping_name)
			.then(() => {
				list_row_element.remove();
				new SnackBar({
					status: "success",
					message: "Mapping removed successfully",
					position: "tr",
					actions: [] // TODO: add an undo option here and increase timer
				});
			})
			.catch((err) => {
				console.error(err);
				new SnackBar({
					status: "error",
					message: "Error occurred while trying to remove mapping",
					position: "tr"
				});
			});
		};

		if (mapping.selected) {
			list_row_element.querySelector('.mapping-toggle').checked = true;
		}
		return list_row_element;
	}

	/**
	 * When transitioning to another view, call this to destroy this list component
	 */
	destroy() {
		this.select_mapping_list_element.remove(); // remove the list from the DOM
	}
}

/**
 * A class representing a Mappings Selection View.
 * Contains:
 * - A SelectMappingsListComponent
 * - an "Apply Selected Mappings" button
 * - a "Remove Annotations" button
 * - a "Create New Mapping" button
 * - a "Save" button that appears when the autosave setting is turned off
 * @property {HTMLElement} view_container_element - A reference to the <div> the view
 * is built inside of.
 * @property {SelectMappingsListComponent} mappings_list_component - A reference
 * to the class representing the list of mappings this view has.
 * @property {HTMLElement} button_container_element - A reference to the <div> containing the
 * buttons that trigger functionalities in this view.
 */
class MappingsSelectionView {
	/**
	 * Creates a MappingsSelectionView. Gets `MAPPINGS` and `SETTINGS` from the
	 * db, takes the latter into consideration when creating the view.
	 * @param {*} payload - unused
	 * @param {TransitionFunction} transition_function - A function used to
	 * transition to other views. Takes an enum and any data needed to create
	 * the next view.
	 */
	constructor(payload, transition_function) {
		this.view_container_element = document.createElement("div");
		this.view_container_element.setAttribute("id", "mapping-select-view");

		this.view_header_element = document.createElement("div");
		this.view_header_element.setAttribute("class", "view-header");
		this.view_header_element.innerText = "Select Mappings";
		this.view_container_element.appendChild(this.view_header_element);

		this.view_body_element = document.createElement("div");
		this.view_body_element.setAttribute("class", "view-body");
		this.view_container_element.appendChild(this.view_body_element);

		Promise.all([
			_getMappings(),
			_getSettings()
		])
		.then(([mappingsList, settings]) => {
			this.mappings_list_component = new SelectMappingsListComponent(mappingsList, transition_function);
			this.view_body_element.appendChild(this.mappings_list_component.select_mapping_list_element);

			this.button_container_element = document.createElement("div");
			this.button_container_element.setAttribute("class", "button-area");
			this.button_container_element.setAttribute("id", "select-mapping-view-buttons-area");

			this.button_container_element.innerHTML = `
				<button id="select-mapping-view-annotate-page-button" type="button">Apply Selected Mappings (Annotate Page)</button>
				<button id="select-mapping-view-remove-annotations-button" type="button">Remove Annotations</button>
				<button id="select-mapping-view-create-new-mapping-button" type="button">Create New Mapping</button>
				<button id="select-mapping-view-save-mapping-priority-button" type="button">Save</button>
			`;

			this.button_container_element.querySelector("#select-mapping-view-annotate-page-button").onclick = () => {
				let user_update_object = this.getUserMappingsPriorityUpdates();
				let tabs = browser.tabs.query({ active: true, currentWindow: true });
				_getMappings()
				.then((mappings) => {
					return _applyMappingsPriorityUpdates(user_update_object, mappings);
				})
				.then((BACKGROUND_APPLY_MAPPINGS_PRIORITY_UPDATE_response) => {
					// if result says we autosaved
					if (BACKGROUND_APPLY_MAPPINGS_PRIORITY_UPDATE_response.hasOwnProperty("autosave_success")) {
						if (BACKGROUND_APPLY_MAPPINGS_PRIORITY_UPDATE_response.autosave_success) {
							// display autosave success
							new SnackBar({
								status: "success",
								message: "Mappings selections saved",
								position: "tr"
							});
						} else {
							// display failure to autosave but still continue chain
							new SnackBar({
								status: "error",
								message: "Mappings selections not saved :(",
								position: "tr"
							});
						}
					}
					return Promise.all([
						Promise.resolve(BACKGROUND_APPLY_MAPPINGS_PRIORITY_UPDATE_response.updated_mappings),
						tabs
					]);
				})
				.then(([mappings, tabs]) => {
					return annotate(tabs, mappings);
				})
				.then(() => {
					new SnackBar({
						status: "success",
						message: "Annotated successfully",
						position: "tr"
					});
					console.log("successful annotation");
				})
				.catch((err) => {
					console.error("err in annotate stack");
					console.error(err);
					new SnackBar({
						status: "error",
						message: "Failed to annotate",
						position: "tr"
					});
					// TODO: disambiguate error
				});
			};

			this.button_container_element.querySelector("#select-mapping-view-remove-annotations-button").onclick = () => {
				browser.tabs.query({ active: true, currentWindow: true })
				.then(removeAnnotations)
				.then(() => {
					new SnackBar({
						status: "success",
						message: "Annotations removed successfully",
						position: "tr"
					});
				})
				.catch((remove_annotations_content_err) => {
					console.log("error while removing annotations");
					console.error(remove_annotations_content_err)
					new SnackBar({
						status: "error",
						message: "Error occurred while trying to remove annotations",
						position: "tr"
					});
					return remove_annotations_content_err;
				});
			};

			this.button_container_element.querySelector("#select-mapping-view-create-new-mapping-button").onclick = () => {
				transition_function(VIEW_NAMES.CREATE_NEW_MAPPING_VIEW, {});
			};

			this.button_container_element.querySelector("#select-mapping-view-save-mapping-priority-button").onclick = () => {
				this.saveMappingsPriority();
			};

			this.view_body_element.appendChild(this.button_container_element);

			// hide save button if doing autosaves
			if (settings[SETTINGS_AUTOSAVE]) {
				this
				.view_container_element
				.querySelector("#select-mapping-view-save-mapping-priority-button")
				.classList
				.add("hidden");
			}
			document.body.querySelector(".view-container").appendChild(this.view_container_element);
		})
		.catch((err) => {
			console.error(err);
			new SnackBar({
				status: "error",
				message: "Big error occurred, try reinstalling. Send a bug report.",
				position: "tc"
			});
		});
	}

	/**
	 * Read the SelectMappingsListComponent for the new order and selection
	 * status of mappings in its list.
	 * @returns {Object[]} List of objects representing mappings' ids and
	 * selection status.
	 * @example
	 * 	[
	 * 		{ "name": "Mapping Name 2", "selected": true },
	 * 		{ "name":" Mapping Name 1", "selected": false },
	 * 		{ "name": "Mapping Name 3", "selected": true }
	 * 	]
	 */
	getUserMappingsPriorityUpdates() {
		let rows = this.mappings_list_component
			.select_mapping_list_element
			.querySelectorAll('.mapping-name');
		let updated_mappings_list = [];
		rows.forEach((row) => {
			updated_mappings_list.push(
				{
					"name": row.innerText.trim(),
					"selected": row.querySelector(".mapping-toggle").checked
				}
			);
		});
		return updated_mappings_list;
	}

	/**
	 * Called only by the save button.
	 */
	saveMappingsPriority() {
		let user_update_object = this.getUserMappingsPriorityUpdates();
		_getMappings()
		.then((mappings) => {
			// update priority (background will decide whether to save or not)
			return _applyMappingsPriorityUpdates(user_update_object, mappings);
		})
		.then((BACKGROUND_APPLY_MAPPINGS_PRIORITY_UPDATE_response) => {
			// if result says we autosaved
			if (BACKGROUND_APPLY_MAPPINGS_PRIORITY_UPDATE_response.hasOwnProperty("autosave_success")
				&& BACKGROUND_APPLY_MAPPINGS_PRIORITY_UPDATE_response.autosave_success
			) {
				// display autosave success
				new SnackBar({
					status: "success",
					message: "Mappings selections saved",
					position: "tr"
				});
				resolve();
			} else {
				return resolve(
					browser.runtime.sendMessage({
						intended_recipient: RECIPIENT_BACKGROUND,
						command: BACKGROUND_SAVE_MAPPINGS,
						MAPPINGS_TO_SAVE: BACKGROUND_APPLY_MAPPINGS_PRIORITY_UPDATE_response.updated_mappings
					})
				);
			}
		})
		.catch((err) => {
			reject(err);
		});
	}

	/**
	 * Called by the transition function
	 */
	destroy() {
		// call the destroy methods of the components
		this.mappings_list_component.destroy();
		// destroy the rest of the view
		this.view_container_element.remove();
	}
}

/**
 * Class representing the list of key/annotation pairs in a
 * Create New Mapping View or Edit Mapping View.
 * Contains:
 * - an ordered list (<ol>) containing
 *   - list items (<li>) containing
 *     - a text input field for a key
 *     - a text input field for an annotation
 *     - icon for deleting the list item
 *     - grip icon to indicate that the list item is draggable
 * @property {HTMLElement} key_annotation_pairs_draggable_list_element - A
 * reference to the <ol> DOM element this class creates.
 */
class KeyAnnotationPairsListComponent {
	/**
	 * Create a draggable list of a mapping's key annotation pairs by creating
	 * rows for each pair, inserting them into the list, and then adding event
	 * handlers for dragging behaviors.
	 * @param {Object[]} mapping A `MAPPING` object's `mapping` (see database.js
	 * for typedef). May be empty if this list is part of a Create New Mapping
	 * View.
	 */
	constructor(mapping={}) {
		this.key_annotation_pairs_draggable_list_element = document.createElement('ol');
		this.key_annotation_pairs_draggable_list_element.setAttribute('class', "draggable-list");
		let key_annotation_list_row_guide_element = document.createElement("li");
		key_annotation_list_row_guide_element.setAttribute("class", "key-annotation-row-guide");
		key_annotation_list_row_guide_element.draggable = false;
		key_annotation_list_row_guide_element.innerHTML = `
			<div class="key-input-guide">Key</div>
			<div class="annotation-input-guide">Annotation</div>
		`;
		this.key_annotation_pairs_draggable_list_element.appendChild(key_annotation_list_row_guide_element);
		for (const [key, annotation] of Object.entries(mapping)) {
			let row = this.createRowInKeyAnnotationPairsList(key, annotation);
			this.key_annotation_pairs_draggable_list_element.appendChild(row);
			addDragEventListeners(row);
		}
	}

	/**
	 * Create a row for a draggable list of key/annotation pairs with text input
	 * fields for keys and annotations either empty for a new mapping being
	 * created or filled out from a mapping being edited.
	 * @param {String} key - Optional key to populate the new row's key input
	 * field
	 * @param {String} annotation - Optional annotation to populate the new
	 * row's annotation input field
	 * @returns A reference to the newly created row in the list so it can be
	 * appended to the list.
	 */
	createRowInKeyAnnotationPairsList(key="", annotation="") {
		let list_row_element = document.createElement('li');
		list_row_element.setAttribute('class', 'key-annotation-pair-list-row draggable');
		list_row_element.setAttribute('draggable', 'true');
		list_row_element.innerHTML = `
			<div class="mapping-row-content">
				<div class="key-annotation-row-left-side-content">
					<input class="mapping-key-input" type="text"></input>
					<input class="mapping-annotation-input" type="text"></input>
				</div>
				<div class="row-icon-container">
					<img class="delete-icon" src="../icons/delete.svg"                           title="Delete this row"></img>
					<img class="grip-icon"   src="../icons/grip-horizontal-line-svgrepo-com.svg" title="Drag to reorder"></img>
				</div>
			</div>
		`;
		list_row_element.querySelector(".mapping-key-input").value = key;
		list_row_element.querySelector(".mapping-annotation-input").value = annotation;
		// let icon_container = getRowIcons({"delete": true, "grip": true});
		// list_row_element.querySelector(".mapping-row-content").appendChild(icon_container);
		list_row_element.querySelector(".delete-icon").onclick = (e) => {
			list_row_element.remove();
		}
		return list_row_element;
	}

	addNewRowInKeyAnnotationPairsList() {
		let new_empty_row = this.createRowInKeyAnnotationPairsList();
		this.key_annotation_pairs_draggable_list_element.appendChild(new_empty_row);
		addDragEventListeners(new_empty_row);
	}

	buildMappingFromKeyAnnotationPairsList() {
		let key_annotation_map = {};
		for (let list_row_element of this.key_annotation_pairs_draggable_list_element.querySelectorAll(".key-annotation-row-left-side-content")) {
			let key = list_row_element.querySelector(".mapping-key-input").value;
			let annotation = list_row_element.querySelector(".mapping-annotation-input").value;
			// ignore empty rows
			if (!(key === "" || annotation === "")) {
				Object.assign(key_annotation_map, {[key]: annotation});
			}
		}
		return key_annotation_map;
	}

	/**
	 * When transitioning to another view, called to destroy this list component
	 */
	destroy() {
		this.key_annotation_pairs_draggable_list_element.remove();
	}
}

/**
 * A class representing a Create New Mapping View which contains
 * - two text input fields for the new mapping's name and description
 * - a list of key/annotation pairs that is initially empty
 * - an "Add Row" button
 * - a "Save" button
 * - a "Cancel" button
 * - a "Toggle JSON" button (TODO)
 * - a JSON input field (TODO)
 * @property {HTMLElement} view_container_element - A reference to the <div> the view
 * is built inside of.
 * @property {KeyAnnotationPairsListComponent} mappings_list_component - A
 * reference to the class representing the list of key/annotation pairs this
 * view has.
 * @property {HTMLElement} button_container_element - A reference to the <div> containing the
 * buttons that trigger functionalities in this view.
 */
class CreateNewMappingView {
	/**
	 * Create a CreateNewMappingView.
	 * @param {*} payload - unused.
	 * @param {TransitionFunction} transition_function - A function used to
	 * transition to other views. Takes an enum and any data needed to create
	 * the next view.
	 */
	constructor(payload, transition_function) {
		this.to_destroy_list = [];
		this.view_container_element = document.createElement("div");
		this.view_container_element.setAttribute("id", "create-new-mapping-view");

		this.view_header_element = document.createElement("div");
		this.view_header_element.setAttribute("class", "view-header");
		this.view_header_element.innerText = "Create New Mapping";
		this.view_container_element.appendChild(this.view_header_element);

		this.view_body_element = document.createElement("div");
		this.view_body_element.setAttribute("class", "create-view-body");
		this.view_body_element.innerHTML = `
			<div class="create-mapping-name-field">
				<label>
					New Mapping Name: &nbsp;
					<input class="new-mapping-name-input" type="text" value="enter new name"></input>
				</label>
			</div>
			<div class="new-mapping-description-field">
				<label>
					Description: &nbsp;
					<input class="new-mapping-description-input" type="text" value="enter description">
				</label>
			</div>
		`;
		this.view_container_element.appendChild(this.view_body_element);

		this.key_annotation_pairs_list_component = new KeyAnnotationPairsListComponent({});
		this.view_body_element.appendChild(this.key_annotation_pairs_list_component.key_annotation_pairs_draggable_list_element);
		this.to_destroy_list.push(this.key_annotation_pairs_list_component);

		this.button_container_element = document.createElement("div");
		this.button_container_element.setAttribute("class", "button-area");
		this.button_container_element.innerHTML = `
			<button id="new-mapping-add-key-button" type="button">Add Key</button>
			<button id="create-mapping-view-show-json-button" class="hidden" type="button">Show JSON</button>
			<button id="save-new-mapping-button" type="submit">Save New Mapping</button>
			<button id="cancel-new-mapping-button" type="reset">Abandon New Mapping</button>
		`;

		this.button_container_element.querySelector("#new-mapping-add-key-button").onclick = () => {
			this.key_annotation_pairs_list_component.addNewRowInKeyAnnotationPairsList();
		};

		this.button_container_element.querySelector("#save-new-mapping-button").onclick = () => {
			let new_mapping = {
				mapping_name: this.view_body_element.querySelector(".new-mapping-name-input").value,
				description: this.view_body_element.querySelector(".new-mapping-description-input").value,
				mapping: {},
				selected: false
			};

			if (new_mapping.mapping_name === "") {
				new SnackBar({
					status: "error",
					message: "Invalid mapping name (must be non-empty)",
					position: "tr"
				});
				console.error(Error("Mapping name was empty"));
				return;
			}

			new_mapping.mapping = this.key_annotation_pairs_list_component.buildMappingFromKeyAnnotationPairsList();

			_addMappingToDatabase(new_mapping)
			.then(() => {
				new SnackBar({
					status: "success",
					message: "New mapping saved successfully",
					position: "tr"
				});
				transition_function(VIEW_NAMES.MAPPING_SELECT_VIEW);
			})
			.catch((err) => {
				console.error(err);
				// TODO: figure out how to tell that the issue was a duplicate mapping name and snackbar it
				new SnackBar({
					status: "error",
					message: "Issue occurred while trying to save new mapping",
					position: "tr" // TODO: change this and status string to variable of some kind instead of hardcoded string
				});
			});
		};

		this.button_container_element.querySelector("#cancel-new-mapping-button").onclick = () => {
			transition_function(VIEW_NAMES.MAPPING_SELECT_VIEW);
		};

		this.view_body_element.appendChild(this.button_container_element);

		document.body.querySelector(".view-container").appendChild(this.view_container_element);
	}

	/**
	 * called by a transition function
	 */
	destroy() {
		this.to_destroy_list.forEach((item) => {
			item.destroy();
		});
		this.view_container_element.remove();
	}
}

/**
 * A class representing an Edit Mapping View which contains
 * - an immutable text input field populated with the mapping's name
 * - a mutable text input field populated with the mapping's description
 * - a list of key/annotation pairs that is initially empty
 * - an "Add Row" button
 * - a "Save" button
 * - a "Cancel" button
 * - a "Toggle JSON" button (TODO)
 * - a JSON input field (TODO)
 * @property {HTMLElement} view_container_element - A reference to the <div> the view
 * is built inside of.
 * @property {KeyAnnotationPairsListComponent} mappings_list_component - A
 * reference to the class representing the list of key/annotation pairs this
 * view has.
 * @property {HTMLElement} button_container_element - A reference to the <div> containing the
 * buttons that trigger functionalities in this view.
 */
class EditMappingView {
	/**
	 * Create the edit mapping view.
	 * @param {Object} payload.mapping_to_edit - A mapping (see database.js for
	 * typedef) object that will be edited.
	 * @param {TransitionFunction} transition_function - A function used to
	 * transition to other views. Takes an enum and any data needed to create
	 * the next view.
	 */
	constructor(payload, transition_function) {
		this.to_destroy_list = [];
		this.view_container_element = document.createElement("div");
		this.view_container_element.setAttribute("id", "edit-mapping-view");

		if (!payload || !payload.mapping_to_edit) {
			new SnackBar({
				status: "error",
				message: "Issue occurred while trying to edit mapping",
				position: "tr"
			});
			console.error(
				Error(`Bad payload. payload: ${JSON.stringify(payload)}`)
			);
			return transition_function(VIEW_NAMES.MAPPING_SELECT_VIEW);
		}

		this.view_header_element = document.createElement("div");
		this.view_header_element.setAttribute("class", "view-header");
		this.view_header_element.innerText = `Edit Mapping: ${payload.mapping_to_edit.mapping_name}`;
		this.view_container_element.appendChild(this.view_header_element);

		this.view_body_element = document.createElement("div");
		this.view_body_element.setAttribute("class", "edit-view-body");
		this.view_body_element.innerHTML = `
			<div class="edit-mapping-name-field">
				<label>
					Now Editing: &nbsp;
					<input class="edit-mapping-name-input" type="text" readonly="readonly">
				</label>
			</div>
			<div class="edit-mapping-description-field">
				<label>
					Description: &nbsp
					<input class="edit-mapping-description-input" type="text">
				</label>
			</div>
		`;
		this.view_body_element.querySelector(".edit-mapping-name-input").value = payload.mapping_to_edit.mapping_name;
		this.view_body_element.querySelector(".edit-mapping-description-input").value = payload.mapping_to_edit.description;
		this.view_container_element.appendChild(this.view_body_element);

		this.key_annotation_pairs_list_component = new KeyAnnotationPairsListComponent(payload.mapping_to_edit.mapping);
		this.view_body_element.appendChild(this.key_annotation_pairs_list_component.key_annotation_pairs_draggable_list_element);
		this.to_destroy_list.push(this.key_annotation_pairs_list_component);

		this.button_container_element = document.createElement("div");
		this.button_container_element.setAttribute("class", "button-area");
		this.button_container_element.innerHTML = `
			<button id="edit-mapping-add-key-button" type="button">Add Key</button>
			<button id="edit-mapping-view-show-json-button" type="button">Show JSON</button>
			<button id="save-edit-mapping-button" type="submit">Save Mapping Edits</button>
			<button id="cancel-edit-mapping-button" type="reset">Abandon Mapping Edits</button>
		`;

		this.button_container_element.querySelector("#edit-mapping-add-key-button").onclick = () => {
			this.key_annotation_pairs_list_component.addNewRowInKeyAnnotationPairsList();
		};

		this.button_container_element.querySelector("#save-edit-mapping-button").onclick = () => {
			let edited_mapping = {
				mapping_name: payload.mapping_to_edit.mapping_name,
				description: this.view_body_element.querySelector(".edit-mapping-description-input").value,
				mapping: {},
				selected: false
			};

			edited_mapping.mapping = this.key_annotation_pairs_list_component.buildMappingFromKeyAnnotationPairsList();

			_editMappingInDatabase(payload.mapping_to_edit.mapping_name, edited_mapping)
			.then(() => {
				new SnackBar({
					status: "success",
					message: "Mapping edited successfully",
					position: "tr"
				});
				return transition_function(VIEW_NAMES.MAPPING_SELECT_VIEW);
			})
			.catch((err) => {
				console.error(err);
				new SnackBar({
					status: "error",
					message: "Issue occurred while trying to save edited mapping",
					position: "tr",
					actions: [] // TODO: retry once, then ask for bug report
				});
			});
		};

		this.button_container_element.querySelector("#cancel-edit-mapping-button").onclick = () => {
			transition_function(VIEW_NAMES.MAPPING_SELECT_VIEW);
		};

		this.view_body_element.appendChild(this.button_container_element);

		document.body.querySelector(".view-container").appendChild(this.view_container_element);
	}

	/**
	 * called by a transition function
	 */
	destroy() {
		this.to_destroy_list.forEach((item) => {
			item.destroy();
		});
		this.view_container_element.remove();
	}
}

// Listen for a file being selected through the file picker
const mapping_file_picker = document.getElementById("mapping-file-picker");
mapping_file_picker.style.opacity = 0;
mapping_file_picker.addEventListener("change", readMappingsFromFile, false);

/**
 * When the popup loads, inject a content script into the active tab,
 * and add a click handler.
 * If we couldn't inject the script, handle the error.
 */
let active_tab;
browser.tabs.query({active: true, currentWindow: true})
	.then((activeTab) => {
		active_tab = activeTab[0];
		browser.scripting
			.executeScript({
				target: {tabId: active_tab.id},
				files: ["/content_scripts/content_annotation_handler.js"]
			})
			.catch(reportExecuteScriptError);
	});


/**
 * Create and display a new MappingsSelectionView.
 */
function initializePopup() {
	current_view = new MappingsSelectionView({}, transitionViews);
}

initializePopup();