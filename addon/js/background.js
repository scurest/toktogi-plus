/* Copyright 2015, Brad McDermott, All rights reserved. */
'use strict';

let isOn = false;
let version = util.getVersion();
let NEW_INSTALL = util.getSavedVersion() === undefined;
let JUST_UPDATED = !NEW_INSTALL && version !== util.getSavedVersion();

function init() {
	if (NEW_INSTALL) {
		util.openTab("guide.html");
	}

	util.setBadgeText("");

	// Update version after setting JUST_UPDATED
	util.setVersion(util.getVersion());

	util.addListener("text", handleLookup);
	util.addListener("injectedLoaded", sendScriptData);
	util.addListener("updateIsOn", toggleOnOff);
	util.addListener("showOptions", showOptions);
	util.addListener("addToList", addToList);
	util.init();

	util.addActionListener(toggleOnOff);
}



// Listener callbacks

function handleLookup(tab, data) {
	const found = dictionary.lookupWords(data.text);
	if (found.length > 0) {
		util.sendMessage(tab, { name: "found", data: found });
	}
}

function sendScriptData(tab, data) {
	util.sendMessage(tab, {
		name: "injectedData",
		data: {
			isOn: isOn,
			JUST_UPDATED: JUST_UPDATED
		}
	});
	JUST_UPDATED = false;
}

function showOptions(tab, data) {
	util.openTab("options.html", tab.id);
}

function toggleOnOff(tab) {
	isOn = !isOn;

	if (isOn) {
		dictionary.load();
		util.sendAllMessage("startListeners");
		util.setBadgeText("On");

	} else {
		dictionary.unload();
		util.sendAllMessage("stopListeners");
		util.setBadgeText("");
	}
}

function addToList(tab, data) {
	// ???
	const definition = data.definition;
	console.log("Received definition object:", data);
}

init();
