/* Copyright 2015, Brad McDermott, All rights reserved. */
'use strict';

const dictionary = {};

// TODO Make this more efficient, probably redo the whole process
dictionary.lookupWords = function(str) {
	const dict = dictionary.dict;

	let entryList = [];

	for (let i = 1; i < str.length + 1; i++) {
		const word = str.substring(0, i);
		// An array of definitions
		const info = dict[word];

		if (info) {
			if (info.defs) {
				entryList.push({ word: word, defs: info.defs.split("|") });
			}

			// word is a conjugated verb, add root definition
			if(info.roots) {
				const roots = Object.keys(info.roots);

				roots.forEach(function (root) {
					entryList.push({
						word: word,
						defs: dict[root].defs.split("|"),
						root: root
					});
				});
			}
		}
	}
	return entryList;
}

dictionary.load = async function() {
	dictionary.dict = await util.getDictJson();
}
