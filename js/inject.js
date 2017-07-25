/* Copyright 2015, Brad McDermott, All rights reserved. */

;(function () {
	var range,
		currentNode,
		currentOffset,
		isOn,
		// Box state and variables
		lookupTimeout,
		isShowing,
		isLocked,
		selectionTop,
		selectionRight,
		selectionLeft,
		boxRight,
		boxTop,
		boxBottom,
		currentDefs,
		currentContext,
		// box jquery object
		$dict,
		$lock,
		$notification;

	browser.addListener("injectedData", loadData);
	browser.addListener("found", displayDef);
	browser.addListener("startListeners", turnOn);
	browser.addListener("stopListeners", stopListeners);

	// TODO refactor this
	function displayDef (defArray) {
		var display = "",
			i,
			j,
			// Finds longest word in array of results for highlighting
			longestMatch = defArray[defArray.length - 1].word;

		// TODO make sure the user hasn't moved the mouse since request
		if (currentNode && currentNode.length > 1) {
			// grab all text for context
			// TODO wait to grab this when they actually add the word to vocab list
			currentContext = currentNode.wholeText;
			// makes the node as long as the longest match, selects it
			currentNode = currentNode.splitText(currentOffset);
			currentNode.splitText(longestMatch.length);
			var wordRange = document.createRange();
			var selection = window.getSelection();
			wordRange.selectNodeContents(currentNode);
			selection.removeAllRanges();
			selection.addRange(wordRange);

			// Save highlighted word coordinates
			var rect = wordRange.getBoundingClientRect();

			selectionLeft = rect.left + $(window).scrollLeft();
			selectionRight = rect.right + $(window).scrollLeft();
			selectionTop = rect.top + $(window).scrollTop();
			selectionBottom = rect.bottom + $(window).scrollTop();

			currentNode.parentNode.normalize();

			currentDefs = defArray;

			// Clear dict box, fill with results, longest word on top
			$dictInner.empty();
			for (i = defArray.length - 1; i >= 0; i--) {
				if(i !== defArray.length - 1) {
					$dictInner.append($("<div>", { class: 'divider' }));
				}

				var word = defArray[i].word;

				if (defArray[i].root) {
					word = word + " (" + defArray[i].root + ")";
				}

				$dictInner.append(
					$("<span>", { class: 'dict-word' }).text(word)
				);
				// TODO turn this back on when vocab list is working
				// var $plus = $("<img>", { class: 'toktogi-plus toktogi-icon', "data-index": i, src: browser.getImageUrl('plus.png') });
				// $plus.click(addToList);
				// $dictInner.append($plus);

				for (j = 0; j < defArray[i].defs.length; j++) {
					$dictInner.append(
						$("<span>", { class: 'dict-def' }).text( defArray[i].defs[j])
					);
				}
			}

			$dict.css({ top: selectionBottom, left: selectionLeft }).show();

			// Save box coordinates
			boxTop = $dict.offset().top;
			boxRight = $dict.offset().left + $dict.width();
			boxBottom = boxTop + $dict.height();

			isShowing = true;
		}
	}

	function isOutOfBox (x, y) {
		// Area to the right of the word but above the box
		// highlighting the next word must be easy
		return (x > selectionRight - 5 && y < boxTop) ||
			// left of the box/selection with small padding
			x < selectionLeft - 5 ||
			// extra padding on the right
			x > boxRight + 40 ||
			y < selectionTop - 5 ||
			// a little extra padding on the bottom
			y > boxBottom + 10;
	}

	function closeBox () {
		isShowing = false;
		$dict.hide();
	}

	function lookupWord () {
		// Already showing dict
		if (isShowing) {
			return;
		}

		// No text after mouse
		if (!range) {
			return;
		}

		var startNode = browser.getStartNode(range);

		// startNode sometimes null
		if (startNode === null) {
			return;
		}

		// nodeType 3 is text
		if (startNode.nodeType == 3) {
			currentNode = startNode;
			currentOffset = browser.getOffset(range);
			// TODO more efficient searching, check for adjacent nodes
			browser.sendMessage({ name: "text", data: { text: currentNode.data.slice(currentOffset) } });
		}
	}

	function startListeners () {
		$(document).on("mousemove", function (event) {
			clearTimeout(lookupTimeout);

			var pageX = event.clientX,
				pageY = event.clientY;

			if (!isShowing) {
				range = browser.getRange(pageX, pageY);
				lookupTimeout = setTimeout(function () { lookupWord(); }, 50);
				return;
			}

			// if showing, see if mouse has left dict/word area
			if (!isLocked && isOutOfBox(pageX, pageY + $(window).scrollTop())) {
				closeBox();
			}
		});

		$lock.click(function (event) {
			isLocked = !isLocked;
			updateLock();
		});

		isLocked = false;
	}

	function turnOn() {
		$notification.show();
		setTimeout(function () {
			$notification.hide();
		}, 5000);
		startListeners();
	}

	function stopListeners() {
		$(document).off("mousemove");
		$lock.off("click");
	}

	function showUpdateNotification() {
		var $update = $("<div>", { id: 'update-notification' }).appendTo("body"),
			$updateText = $("<span>").text("Toktogi has been "),
			$updateLink = $("<a>").text("updated").appendTo($updateText);

		$update.append($updateText);

		$updateText.on("click a", function (event) {
			event.preventDefault();
			browser.sendMessage({ name: "showOptions" });
			$update.hide();
		});

		setTimeout(function () {
			$update.hide();
		}, 12000);
	}

	function updateLock() {
		if (isLocked) {
			$lock
				.attr("src", browser.getImageUrl("lock.png"));
		} else {
			$lock
				.attr("src", browser.getImageUrl("unlock.png"));
		}
	}

	function addToList(event) {
		var index = $(this).attr('data-index');
		definition = currentDefs[index];
		browser.sendMessage({ name: "addToList", data: {
			definition: definition,
			location: window.location.href,
			context: currentContext

		} });
	}

	// Kick things off when response comes back from bg page
	function loadData(data) {
		isOn = data.isOn;

		if (data.JUST_UPDATED) {
			showUpdateNotification();
		}

		$dict = $("<div>", { id: 'dict' })
			.addClass("card-panel grey lighten-4")
			.appendTo("body");
		$dictInner = $("<div>", { id: 'dict-inner' }).appendTo($dict);
		$lock = $("<img>", { id: 'toktogi-lock', class: 'toktogi-icon' }).appendTo($dict);
		updateLock();
		$notification = $("<div>", { id: 'toktogi-notification' })
			.text("Toktogi is on")
			.addClass("card-panel grey lighten-4")
			.appendTo("body");

		if (isOn) {
			startListeners();
		}
	}

	browser.initInject();
})();
