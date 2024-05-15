/* This file is responsible for performing the logic of wrapping
 * all occurrences of each mapped word into a <ruby> tag with its
 * mapped string counterpart.
 */

// TODO: figure out how to export these functions for testing
// export {
// 	createRegexMap,
// 	isInsideRubyTag,
// 	rubyWrap,
// 	rubyUnwrap
// };

// TODO: figure out how to import into this content script

// import {
// 	RECIPIENT_BACKGROUND,
// 	BACKGROUND_GET_CONSOLIDATED_MAPPING,
// 	RECIPIENT_CONTENT,
// 	CONTENT_ANNOTATE,
// 	CONTENT_REMOVE_ANNOTATIONS,
// } from "../messaging_protocol.js";

// import {
// 	Smeagol,
// 	SUPPORTED_BROWSERS,
// } from "../smeagol.js";

/**
 * Enums for browsers
 */
const SUPPORTED_BROWSERS = Object.freeze({
	firefox: 'FIREFOX',
	chrome: 'CHROME'
});

/**
 * A class to handle the differences between browsers' APIs.
 */
class Smeagol {
	constructor(selected_browser) {
		this.browser_api;
		if (SUPPORTED_BROWSERS.firefox === selected_browser) {
			this.browser_api = browser;
		} else if (SUPPORTED_BROWSERS.chrome === selected_browser) {
			this.browser_api = chrome;
		} else {
			throw new Error('Smeagol does not support ', selected_browser);
		}
	}

	/**
	 * Send a message to a content script and get its response.
	 * Firefox - https://developer.mozilla.org/en-US/docs/Mozilla/Add-ons/WebExtensions/API/tabs/sendMessage
	 * Chrome - https://developer.chrome.com/docs/extensions/reference/api/tabs#method-sendMessage
	 * @param {Number} tabId - Integer ID of the tab to send a message to.
	 * @param {*} message - Any serializable object to send to a content script.
	 * @returns {Promise} A Promise that resolves with the response from the
	 * content script or rejects with an error.
	 */
	sendMessageToTab(tabId, message) {
		return new Promise((resolve, reject) => {
			this.browser_api.tabs.sendMessage(tabId, message)
			.then((res) => {
				res = new MessageResponse({ payload: res.response });
				if (res.hasError()) {
					reject(res.getError());
				}
				resolve(res.getResponse());
			}).catch(err => {
				console.error(err);
			});
		});
	}

	/**
	 * Send a message to a component of the extension and get its response.
	 * Firefox - https://developer.mozilla.org/en-US/docs/Mozilla/Add-ons/WebExtensions/API/runtime/sendMessage
	 * Chrome - https://developer.chrome.com/docs/extensions/reference/api/runtime#method-sendMessage
	 * @param {*} message - Any serializable object to send to a content script.
	 * @returns {Promise} A Promise that resolves with a response from the recipient or rejects with an error.
	 */
	sendMessage(message) {
		return new Promise((resolve, reject) => {
			this.browser_api.runtime.sendMessage(message)
			.then((res) => {
				res = new MessageResponse({ payload: res.response });
				if (res.hasError()) {
					reject(res.getError());
				}
				resolve(res.getResponse());
			}).catch(err => {
				console.error(err);
			});
		});
	}

	/**
	 * A function that a script will use to respond to messages it recieves.
	 * @callback MessageHandler
	 * @param {*} message - Any serializable object to send from one script to another.
	 * @returns {Promise} A Promise that resolves with a response from the recipient or rejects with an error.
	 */

	/**
	 * Designate a MessageHandler for a script using the appropriate API for
	 * the browser the extension is installed on.
	 * See the following browser API documentation
	 * Firefox - https://developer.mozilla.org/en-US/docs/Mozilla/Add-ons/WebExtensions/API/runtime/onMessage#addlistener_syntax
	 * Chrome - https://developer.chrome.com/docs/extensions/reference/api/runtime#event-onMessage
	 * @param {MessageHandler} messageHandler - A function to handle mesages for
	 * the script that calls this method.
	 */
	addOnMessageListener(messageHandler) {
		/**
		 * Rather than using the MessageHandler function passed in
		 * (i.e. `messageHandler`) with the browser API directly, wrap it so
		 * that its response can be processed.
		 * @param {*} recvMessage - A message sent to the script.
		 * @param {*} _ - (unused)
		 * @param {*} sendResponse - A callback function that takes any
		 * serializable object as a response to the message and sends it back
		 * to the sender.
		 */
		function wrappedListener(recvMessage, _, sendResponse) {
			// pass the message to the designated MessageHandler
			// (which will return a Promise)
			messageHandler(recvMessage)
			.then((res) => {
				sendResponse(new MessageResponse({
					error_occurred: false,
					error_details: undefined,
					payload: res
				}));
			}).catch(err => {
				sendResponse(new MessageResponse({
					error_occurred: true,
					error_details: err,
					payload: undefined
				}));
			});
			return true;
		}
		this.browser_api.runtime.onMessage.addListener(wrappedListener);
	}
}

/**
 * A class representing responses to messages sent between extension components.
 */
class MessageResponse {
	/**
	 * @param {*} response - An object to build a MessageResponse with
	 * @param {*} response.payload
	 * @param {Boolean} response.error_occurred
	 * @param {Error} response.error_details
	 */
	constructor(response) {
		this.response = response.payload;
		this.error_occurred = response.error_occurred;
		if (this.error_occurred && response.error_details === undefined) {
			this.error = new Error("Error details not included");
		} else {
			this.error = response.error_details;
		}
	}

	hasError() {
		return this.error_occurred;
	}

	getError() {
		return this.error;
	}

	getResponse() {
		return this.response;
	}

	toString() {
		return `response: ${JSON.stringify(this.response)}, error: ${this.error_occurred ? JSON.stringify(this.error_details) : "none"}`;
	}
}

/* example of what wrapping could look like in html
 * (minus custom data-attribute to indicate already-annotated text)
	<ruby>
		<ruby>吟游
			<rp>（</rp><rt>yín yóu</rt><rp>）</rp>
		</ruby>
		<rp>（</rp><rt>to wander as minstrel</rt><rp>）</rp>
	</ruby>
	<ruby>
		<ruby>大概
			<rp>（</rp><rt>&nbsp;dà&nbsp;&nbsp;&nbsp;gài&nbsp;</rt><rp>）</rp>
		</ruby>
		<rp>（</rp><rt>roughly</rt><rp>）</rp>
	</ruby>
	<ruby>
		<ruby>某种
			<rp>（</rp><rt>mǒuzhǒng</rt><rp>）</rp>
		</ruby>
		<rp>（</rp><rt>some kind (of)</rt><rp>）</rp>
	</ruby>
	<ruby>
		<ruby>方法
			<rp>（</rp><rt>fāngfǎ</rt><rp>）</rp>
		</ruby>
		<rp>（</rp><rt>method</rt><rp>）</rp>
	</ruby>
*/

/**
 * Annotates text nodes by wrapping them in a <ruby> tag.
 * If the node contains more than just text (ex: it has child nodes),
 * call rubyWrap() on each of its children.
 *
 * @param  {Node} node - The target DOM Node.
 * @param  {Map<String, String>} regexs - Holds the regexes used to search for the keys.
 * @param  {Object} consolidated_mapping - Holds the keys and corresponding annotations to apply.
 * @return {void} - Note: the annotation is done inline.
 */
function rubyWrap(node, regexs, consolidated_mapping) {
	// Setting textContent on a node removes all of its children and replaces
	// them with a single text node. Since we don't want to alter the DOM aside
	// from annotating text, we only annotate on single text nodes.
	// @see https://developer.mozilla.org/en-US/docs/Web/API/Node/textContent
	if (node.nodeType === Node.TEXT_NODE) {
		// This node only contains text.
		// @see https://developer.mozilla.org/en-US/docs/Web/API/Node/nodeType.

		// Skip textarea nodes due to the potential for accidental annotation
		// where none was intended.
		if (node.parentNode && node.parentNode.nodeName === 'TEXTAREA') {
			return;
		}

		// Because DOM manipulation is slow, we don't want to keep setting
		// textContent after every replacement. Instead, manipulate a copy of
		// this string outside of the DOM and then perform the manipulation
		// once, at the end.
		let content = node.textContent;
		let match_found = false;

		// Annotate every occurrence of 'word' in 'content' with its mapped value.
		for (const [key, annotation] of Object.entries(consolidated_mapping)) {
			// Grab the search regex for this word.
			const regex = regexs.get(key);

			// Actually do the wrapping.
			// Note: if 'word' does not appear in 'content', nothing happens.
			let key_match = [...content.matchAll(regex)][0];
			if (key_match) {
				match_found = true;
				let alreadyWrapped = isInsideRubyTag(content, key_match);
				if (!alreadyWrapped) {
					let annotation_tag = {
						key: key,
						annotation: annotation
					};
					content = content.replace(
						regex,
						(match) => {
							return `<ruby data-ie-annotated='${JSON.stringify(annotation_tag)}' style="font-size: 1.5em;">${key}<rp>(</rp><rt style="font-size: 1em">${annotation}&nbsp;</rt><rp>)</rp></ruby>`;
						}
					);
				}
			}
		}
		// Now that all the replacements are done, perform the DOM manipulation.
		if (match_found) {
			// create new node from content string
			let placeholder = document.createElement("div");
			placeholder.innerHTML = content;
			// delete the textNode where this was found and replace with the new ruby node
			while (placeholder.childNodes.length) {
				node.parentNode.insertBefore(placeholder.childNodes[0], node);
			}
			node.parentNode.removeChild(node);
			match_found = false;
		}
	}
	else {
		// This node contains more than just text, call rubyWrap() on each
		// of its children.
		for (let i = 0; i < node.childNodes.length; i++) {
			if (node.childNodes[i]?.dataset?.ieAnnotated) {
				continue; // skip already annotated nodes
			}
			rubyWrap(node.childNodes[i], regexs, consolidated_mapping);
		}
	}
}

/**
 * Search within a string for complete ruby tags and figure out if a key is
 * inside of one or not. Used to prevent nested ruby tags.
 * @param {String} content - Text to search within.
 * It's easier for rubyWrap() to use a string than HTML nodes because it builds
 * up a string to only do one DOM change at the end.
 * @param {Iterator} key_match - The result of a call to regex.matchAll() for
 * the regex for a key. "Each value yielded by the iterator is an array with the
 * same shape as a return value from a call to RegExp.prototype.exec()"
 * @param {String} key_match[0] - The text of the key
 * @param {Number} key_match.index - TODO: refactor
 * @returns {Boolean}
 */
function isInsideRubyTag(content, key_match) {
	// find complete ruby tags
	const completeRubyTags = content.matchAll(/<ruby.*?>.*?<\/ruby>/gi);
	let keyStartIndex = key_match.index;
	let keyEndIndex = key_match.index + key_match[0].length;
	for (const completeRubyTag of completeRubyTags) {
		const startIndex = completeRubyTag.index;
		const endIndex = startIndex + completeRubyTag[0].length;
		// Check if the key is found inside a complete ruby tag
		if (startIndex <= keyStartIndex && endIndex >= keyEndIndex) {
			return true;
		}
	}
	return false;
}

/**
 * Remove existing annotations created by this extension (i.e. don't remove
 * original ruby tags).
 * @param {*} node - The node to unwrap all tags within.
 */
function rubyUnwrap(node, regexs, consolidated_mapping, options) {
	/* get list of ruby tags added by extension */
	let custom_annotations_list = node.querySelectorAll('ruby[data-ie-annotated]');
	/* replace contents of the ruby tag with the key it was made with */
	for (let i=0; i<custom_annotations_list.length; i++) {
		let rubyTag = custom_annotations_list[i];
		let plain_key = JSON.parse(rubyTag.dataset.ieAnnotated).key;
		let to_replace = document.createTextNode(plain_key);
		rubyTag.replaceWith(to_replace);
	}
}

// // Now monitor the DOM for additions and annotate new nodes.
// // @see https://developer.mozilla.org/en-US/docs/Web/API/MutationObserver.
// const observer = new MutationObserver((mutations) => {
	// mutations.forEach((mutation) => {
		// if (mutation.addedNodes && mutation.addedNodes.length > 0) {
		// // This DOM change was new nodes being added. Run our substitution
		// // algorithm on each newly added node.
			// for (let i = 0; i < mutation.addedNodes.length; i++) {
				// const newNode = mutation.addedNodes[i];
				// rubyWrap(newNode);
			// }
		// }
	// });
// });

// observer.observe(document.body, {
	// childList: true,
	// subtree: true
// });

/**
 * For efficiency, create a word --> search RegEx Map too.
 * @param {Object} map - An object with every key from each mapping selected for
 * 	annotation and a corresponding annotation
 * @returns {Map<String, RegExp>} A map of the keys from the full mapping onto
 * 	a case-insensitive RegExp for each key
 */
function createRegexMap(map) {
	let regexs = new Map();
	for (let key of Object.keys(map)) {
		// We want a global, case-insensitive replacement.
		// @see https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/RegExp
		regexs.set(key, new RegExp(key, 'gi'));
	}
	return regexs;
}

function messageListener(message) {
	if (message.intended_recipient !== "RECIPIENT_CONTENT") {
		return; // don't send response so intended recipient can still pick up this message
	}
	if (message.command === "CONTENT_ANNOTATE") {
		if (!message.MAPPINGS) {
			return Promise.reject(Error("Bad request (missing `MAPPINGS`)"));
		}
		// TODO: allow for partial annotation
		return new Promise((resolve, reject) => {
			smeagol.sendMessage({
				intended_recipient: "RECIPIENT_BACKGROUND",
				command: "BACKGROUND_GET_CONSOLIDATED_MAPPING",
				MAPPINGS_TO_CONSOLIDATE: message.MAPPINGS
			})
			.then((BACKGROUND_GET_CONSOLIDATED_MAPPING_response) => {
				let regexs = createRegexMap(BACKGROUND_GET_CONSOLIDATED_MAPPING_response);
				rubyWrap(document.body, regexs, BACKGROUND_GET_CONSOLIDATED_MAPPING_response);
				return resolve({});
			})
			.catch((err) => {
				return reject(err);
			});
		})
	}
	else if (message.command === "CONTENT_REMOVE_ANNOTATIONS") {
		try {
			rubyUnwrap(document.body);
			return Promise.resolve()
		}
		catch (err) {
			return Promise.reject(err);
		}
	} else {
		return Promise.reject(Error(`unrecognized command '${message.command}'`));
	}
}

let smeagol = new Smeagol(SUPPORTED_BROWSERS.chrome);
smeagol.addOnMessageListener(messageListener);