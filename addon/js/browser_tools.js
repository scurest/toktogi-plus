/* Copyright 2015, Brad McDermott, All rights reserved. */

;(function (root) {
	var browser = root.browser = root.browser || {};

	// Generic

	browser.messageCallbacks = {};

	browser.addListener = function (messageName, callback) {
		browser.messageCallbacks[messageName] = callback;
	}

	browser.sendMessage = function (data, callback) {
		chrome.runtime.sendMessage(data, callback);
	}

	browser.messageListener = function (message) {
		var callback = browser.messageCallbacks[message.name];

		callback && callback(message.data);
	}


	// Inject.js

	browser.getRange = function (pageX, pageY) {
		return document.caretRangeFromPoint(pageX, pageY);
	}

	browser.getOffset = function (range) {
		return range.startOffset;
	}

	browser.getStartNode = function (range) {
		return range.startContainer;
	}

	browser.initInject = function () {
		chrome.runtime.onMessage.addListener(browser.messageListener);

		browser.sendMessage({ name: "injectedLoaded" });
	}

	browser.getImageUrl = function (filename) {
		return chrome.extension.getURL("images/" + filename);
	}

	// Popup.js

	browser.initPanel = function () {
		chrome.runtime.onMessage.addListener(browser.messageListener);

		browser.sendMessage({ name: "popupLoaded" });
	}

})(window);
