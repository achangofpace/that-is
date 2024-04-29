// // let loadTime = new Date();
// // let manifest = browser.runtime.getManifest();

// // function onInstalledNotification(details) {
// // 	browser.notifications.create('onInstalled', {
// // 		title: `Runtime Examples version: ${manifest.version}`,
// // 		message: `onInstalled has been called, background page loaded at ${loadTime.getHours()}:${loadTime.getMinutes()}`,
// // 		type: 'basic'
// // 	});
// // }

// // browser.runtime.onInstalled.addListener(onInstalledNotification);

// browser.runtime.onSuspend.addListener(() => {
// 	console.log("onSuspend in background.js");
// 	// do the save here
// });