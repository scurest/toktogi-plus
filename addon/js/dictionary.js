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
