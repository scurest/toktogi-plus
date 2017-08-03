/* Copyright 2015, Brad McDermott, All rights reserved. */

;(function (root, browser) {
	root.browser = browser;

	// Generic

	browser.messageCallbacks = {};

	browser.addListener = function (messageName, callback) {
		browser.messageCallbacks[messageName] = callback;
	}

	browser.sendMessage = function (data, callback) {
		browser.runtime.sendMessage(data, callback);
	}

	browser.messageListener = function (message) {
		var callback = browser.messageCallbacks[message.name];

		callback && callback(message.data);
	}


	// Inject.js

	browser.getRange = function (pageX, pageY) {
		return document.caretPositionFromPoint(pageX, pageY);
	}

	browser.getOffset = function (range) {
		return range.offset;
	}

	browser.getStartNode = function (range) {
		return range.offsetNode;
	}

	browser.initInject = function () {
		browser.runtime.onMessage.addListener(browser.messageListener);

		browser.sendMessage({ name: "injectedLoaded" });
	}

	browser.getImageUrl = function (filename) {
		return browser.extension.getURL("images/" + filename);
	}

	// Popup.js

	browser.initPanel = function () {
		browser.runtime.onMessage.addListener(browser.messageListener);

		browser.sendMessage({ name: "popupLoaded" });
	}

})(window, browser);
