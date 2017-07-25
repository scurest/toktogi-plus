/* Copyright 2015, Brad McDermott, All rights reserved. */

(function () {
	var isOn,
		$on = $("#on");

	function togglePopup () {
		isOn = !isOn;
		browser.sendMessage({ name: "updateIsOn", data: { isOn: isOn } });
		updateOnButton();
	}

	function updateOnButton() {
		if (isOn) {
			$on.text("Disable Toktogi");
		} else {
			$on.text("Enable Toktogi");
		}
	}

	// Kick off panel when response arrives from bg page
	function loadData(data) {
		isOn = data.isOn;

		updateOnButton();

		$on.click(togglePopup);
	}

	browser.addListener("popupData", loadData);

	browser.initPanel();
})();
