/* Copyright 2015, Brad McDermott, All rights reserved. */
'use strict';

if (window.browser == null) {
	window.browser = chrome;
}

const util = {};

util.openTab = function(url, openerId) {
	browser.tabs.create({
		url: browser.extension.getURL(url)
	});
};

util.setBadgeText = function(text) {
	browser.browserAction.setBadgeText({ text: text });
};

util.getSavedVersion = function() {
	return localStorage.version;
};

util.getVersion = function() {
	return browser.runtime.getManifest().version;
};

util.setVersion = function(version) {
	localStorage.version = version;
};

util.sendMessage = function(tab, data) {
	// data is an object that includes 'name' and 'data' fields
	if (tab && tab.id !== null) {
		browser.tabs.sendMessage(tab.id, data);
	} else {
		browser.runtime.sendMessage(data);
	}
};

util.getDictJson = async function() {
	let response = await fetch('dict.json');
	return response.json();
};

util.sendAllMessage = function(name, data) {
	browser.tabs.query({}, function(tabs) {
		var message = { name: name, data: data };
		for (var i=0; i<tabs.length; ++i) {
			util.sendMessage(tabs[i], message);
		}
	});
};

util.messageCallbacks = {};

util.addListener = function (messageName, callback) {
	util.messageCallbacks[messageName] = callback;
};

util.addActionListener = function(callback) {
	browser.browserAction.onClicked.addListener(callback);
};


util.messageListener = function (message, sender) {
	var tab = sender.tab,
	    callback = util.messageCallbacks[message.name];

	if (callback) {
		callback(tab, message.data);
	}
};

util.init = function() {
	browser.runtime.onMessage.addListener(util.messageListener);
};
