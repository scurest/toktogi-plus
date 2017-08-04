(function e(t,n,r){function s(o,u){if(!n[o]){if(!t[o]){var a=typeof require=="function"&&require;if(!u&&a)return a(o,!0);if(i)return i(o,!0);var f=new Error("Cannot find module '"+o+"'");throw f.code="MODULE_NOT_FOUND",f}var l=n[o]={exports:{}};t[o][0].call(l.exports,function(e){var n=t[o][1][e];return s(n?n:e)},l,l.exports,e,t,n,r)}return n[o].exports}var i=typeof require=="function"&&require;for(var o=0;o<r.length;o++)s(r[o]);return s})({1:[function(require,module,exports){
/* Copyright 2015, Brad McDermott, All rights reserved. */

(function () {
	var browser = require("./browser.js"),
		dictionary = require("./dictionary.js"),
		isOn = false,
		version = browser.getVersion(),
		NEW_INSTALL = browser.getSavedVersion() === undefined,
		JUST_UPDATED = !NEW_INSTALL && version !== browser.getSavedVersion();

	function init() {
		if (NEW_INSTALL) {
			browser.openTab("guide.html");
		}

		browser.setBadgeText("");

		// Update version after setting JUST_UPDATED
		browser.setVersion(browser.getVersion());

		browser.addListener("text", handleLookup);
		browser.addListener("injectedLoaded", sendScriptData);
		browser.addListener("popupLoaded", sendPopupData);
		browser.addListener("showOptions", showOptions);
		browser.addListener("addToList", addToList);
		browser.init();

		browser.addActionListener(toggleOnOff);
	}



	// Listener callbacks

	function handleLookup(tab, data) {
		var found = dictionary.lookupWords(data.text);
		if (found.length > 0) {
			browser.sendMessage(tab, { name: "found", data: found });
		}
	}

	function sendScriptData(tab, data) {
		browser.sendMessage(tab, {
			name: "injectedData",
			data: {
				isOn: isOn,
				JUST_UPDATED: JUST_UPDATED
			}
		});
		JUST_UPDATED = false;
	}

	function sendPopupData(tab, data) {
		browser.sendMessage(null, { name: "popupData", data: { isOn: isOn } });
	}

	function showOptions(tab, data) {
		browser.openTab("options.html", tab.id);
	}

	function toggleOnOff(tab) {
		isOn = !isOn;

		if (isOn) {
			dictionary.load();
			browser.sendAllMessage("startListeners");
			browser.setBadgeText("On");

		} else {
			dictionary.unload();
			browser.sendAllMessage("stopListeners");
			browser.setBadgeText("");
		}
	}

	function addToList(tab, data) {
		var definition = data.definition;
		console.log("Received definition object:", data);
	}

	init();
})();

},{"./browser.js":2,"./dictionary.js":3}],2:[function(require,module,exports){
/* Copyright 2015, Brad McDermott, All rights reserved. */

exports.openTab = function(url, openerId) {
	browser.tabs.create({
		url: browser.extension.getURL(url),
		//openerTabId: openerId
	});
};

exports.setBadgeText = function(text) {
	browser.browserAction.setBadgeText({ text: text });
};

exports.addActionListener = function(fn) {
	browser.browserAction.onClicked.addListener(fn);
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
	var xhr = new XMLHttpRequest();
	xhr.open('GET', 'js/dict.json', false);
	xhr.overrideMimeType('text/json');
	xhr.send(null);
	return JSON.parse(xhr.responseText);
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

},{}],3:[function(require,module,exports){
/* Copyright 2015, Brad McDermott, All rights reserved. */

var browser = require("./browser.js"),
    dictionary;

// TODO Make this more efficient, probably redo the whole process
exports.lookupWords = function(str) {
	var i, j, word, info, roots, root,
	    entryList = [];

	for (i = 1; i < str.length + 1; i++) {
		word = str.substring(0, i);
		// An array of definitions
		info = dictionary[word];

		if (info) {
			if (info.defs) {
				entryList.push({ word: word, defs: info.defs.split("|") });
			}

			// word is a conjugated verb, add root definition
			if(info.roots) {
				roots = Object.keys(info.roots);

				roots.forEach(function (root) {
					entryList.push({
						word: word,
						defs: dictionary[root].defs.split("|"),
						root: root
					});
				});
			}
		}
	}
	return entryList;
};

exports.load = function() {
	dictionary = browser.getDictJson();
};

exports.unload = function() {
	dictionary = null;
};

},{"./browser.js":2}]},{},[1]);
