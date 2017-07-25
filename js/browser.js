/* Copyright 2015, Brad McDermott, All rights reserved. */

exports.openTab = function(url, openerId) {
	chrome.tabs.create({
		url: chrome.extension.getURL(url),
		openerTabId: openerId
	});
};

exports.setBadgeText = function(text) {
	chrome.browserAction.setBadgeText({ text: text });
};

exports.getSavedVersion = function() {
	return localStorage.version;
};

exports.getVersion = function() {
	return chrome.runtime.getManifest().version;
};

exports.setVersion = function(version) {
	localStorage.version = version;
};

exports.sendMessage = function(tab, data) {
	// data is an object that includes 'name' and 'data' fields
	if (tab && tab.id !== null) {
		chrome.tabs.sendMessage(tab.id, data);
	} else {
		chrome.runtime.sendMessage(data);
	}
};

exports.getDictJson = function() {
	var xhr = new XMLHttpRequest();
	xhr.open('GET', 'js/dict.json', false);
	xhr.send(null);
	return JSON.parse(xhr.responseText);
};

exports.sendAllMessage = function(name, data) {
	chrome.tabs.query({}, function(tabs) {
		var message = { name: name, data: data };
		for (var i=0; i<tabs.length; ++i) {
			exports.sendMessage(tabs[i], message);
		}
	});
};

exports.messageCallbacks = {};

exports.addListener = function (messageName, callback) {
	exports.messageCallbacks[messageName] = callback;
};

exports.messageListener = function (message, sender) {
	var tab = sender.tab,
	    callback = exports.messageCallbacks[message.name];

	if (callback) {
		callback(tab, message.data);
	}
};

exports.init = function() {
	chrome.runtime.onMessage.addListener(exports.messageListener);
};
