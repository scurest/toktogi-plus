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
		browser.addListener("updateIsOn", toggleOnOff);
		browser.addListener("showOptions", showOptions);
		browser.addListener("addToList", addToList);

		browser.init();
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

	function toggleOnOff(tab, data) {
		isOn = data.isOn;

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
