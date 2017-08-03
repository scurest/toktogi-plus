/* Copyright 2015, Brad McDermott, All rights reserved. */


exports.openTab = function(url, openerId) {
	browser.tabs.create({
		url: browser.extension.getURL(url),
		openerTabId: openerId
	});
};

exports.setBadgeText = function(text) {
	browser.browserAction.setBadgeText({ text: text });
};

exports.getSavedVersion = function() {
	return localStorage.version;
};

exports.getVersion = function() {
	return browser.runtime.getManifest().version;
};

exports.setVersion = function(version) {
	localStorage.version = version;
};

exports.sendMessage = function(tab, data) {
	// data is an object that includes 'name' and 'data' fields
	if (tab && tab.id !== null) {
		browser.tabs.sendMessage(tab.id, data);
	} else {
		browser.runtime.sendMessage(data);
	}
};

exports.getDictJson = function() {
	return dict;
};

exports.sendAllMessage = function(name, data) {
	browser.tabs.query({}, function(tabs) {
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
	browser.runtime.onMessage.addListener(exports.messageListener);
};
