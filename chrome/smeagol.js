export {
	Smeagol,
	SUPPORTED_BROWSERS
};

/**
 * Enums for browsers
 */
const SUPPORTED_BROWSERS = {
	firefox: 'FIREFOX',
	chrome: 'CHROME'
};

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