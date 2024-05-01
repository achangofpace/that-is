// import {
// 	createRegexMap,
// 	isInsideRubyTag,
// 	rubyWrap,
// 	rubyUnwrap
// } from "../content_scripts/content_annotation_handler.js";

function createRegexMap(map) {
	let regexsMap = new Map();
	for (let key of Object.keys(map)) {
		// We want a global, case-insensitive replacement.
		// @see https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/RegExp
		regexsMap.set(key, new RegExp(key, 'gi'));
	}
	return regexsMap;
}

function rubyWrap(node, regexs, consolidatedMapping) {
	// Setting textContent on a node removes all of its children and replaces
	// them with a single text node. Since we don't want to alter the DOM aside
	// from annotating text, we only annotate on single text nodes.
	// @see https://developer.mozilla.org/en-US/docs/Web/API/Node/textContent
	if (node.nodeType === Node.TEXT_NODE) {
		console.log("parentNode: "+node.parentNode.tagName);
		console.log(`curr Node: textNode of ${node.parentNode.tagName} contains ${node.textContent}`);
		// This node only contains text.
		// @see https://developer.mozilla.org/en-US/docs/Web/API/Node/nodeType.

		// Skip textarea nodes due to the potential for accidental annotation
		// where none was intended.
		if (node.parentNode && node.parentNode.nodeName === 'TEXTAREA') {
			return;
		}

		// Because DOM manipulation is slow, we don't want to keep setting
		// textContent after every replacement. Instead, manipulate a copy of
		// this string outside of the DOM and then perform the manipulation
		// once, at the end.
		let content = node.textContent;
		let match_found = false;

		// Annotate every occurrence of 'key' in 'content' with its mapped value.
		for (const [key, annotation] of Object.entries(consolidatedMapping)) {
			// Grab the search regex for this key.
			const regex = regexs.get(key);

			// Actually do the wrapping.
			// Note: if 'key' does not appear in 'content', nothing happens.
			let key_match = [...content.matchAll(regex)][0];
			if (key_match) {
				match_found = true;
				console.log("textContent: " + content);
				let alreadyWrapped = isInsideRubyTag(content, key_match);
				if (!alreadyWrapped) {
					let annotation_tag = {
						key: key,
						annotation: annotation
					};
					content = content.replace(
						regex,
						`<ruby data-ie-annotated='${JSON.stringify(annotation_tag)}' style="font-size: 1.5em;">${key}<rp>(</rp><rt style="font-size: 1em">${annotation}&nbsp;</rt><rp>)</rp></ruby>`
					);
				}
			}
		}
		// Now that all the replacements are done, perform the DOM manipulation.
		if (match_found) {
			console.log(`match found, replacing '${node.parentNode.innerHTML}' with ${content}`);
			// create new node from content string
			let placeholder = document.createElement("div");
			placeholder.innerHTML = content;
			console.log(placeholder);
			// delete the textNode where this was found and replace with the new ruby node
			while (placeholder.childNodes.length) {
				node.parentNode.insertBefore(placeholder.childNodes[0], node);
			}
			console.log("node after insertBefore: ");
			console.log(node.parentNode);
			node.parentNode.removeChild(node);
			console.log("parentNode after removing text node: ");
			console.log(node.parentNode);
			match_found = false;
		}
	}
	else {
		// This node contains more than just text, call rubyWrap() on each
		// of its children.
		console.log(`not a text node: ${node.tagName}, a ${convertNodeType(node.nodeType)}`);
		for (let i = 0; i < node.childNodes.length; i++) {
			console.log(`child of ${node.tagName} - ${node.id}: ${i+1}/${node.childNodes.length}`);
			if (node.childNodes[i].nodeType === Node.TEXT_NODE) {
				console.log(`text node containing: ${node.childNodes[i].textContent}`);
			} else {
				console.log(`${node.childNodes[i].tagName}, a ${convertNodeType(node.childNodes[i].nodeType)}`);
			}
		}
		for (let i = 0; i < node.childNodes.length; i++) {
			console.log(`iterating children of ${node.tagName} - ${node.id}: ${i+1}/${node.childNodes.length}`);
			if (node.childNodes[i]?.dataset?.ieAnnotated) {
				continue;
			}
			rubyWrap(node.childNodes[i], regexs, consolidatedMapping);
		}
		console.log(`done with children of ${node.tagName}, a ${convertNodeType(node.nodeType)}`);
	}
}

function isInsideRubyTag(content, key_match) {
	// find complete ruby tags
	const completeRubyTags = content.matchAll(/<ruby.*?>.*?<\/ruby>/gi);
	let keyStartIndex = key_match.index;
	let keyEndIndex = key_match.index + key_match[0].length;
	for (const completeRubyTag of completeRubyTags) {
		const startIndex = completeRubyTag.index;
		const endIndex = startIndex + completeRubyTag[0].length;
		// Check if the key is found inside a complete ruby tag
		if (startIndex <= keyStartIndex && endIndex >= keyEndIndex) {
			return true;
		}
	}
	return false;
}

function convertNodeType(nodeType) {
	switch (nodeType) {
		case 1:
			return "element node";
		case 2:
			return "attribute node";
		case 3:
			return "text node";
		case 4:
			return "'cdata section' node (like <!CDATA[[...]]>)";
		case 7:
			return "processing instruction node (like <?xml-stylesheet ...>)";
		case 8:
			return "comment node";
		case 9:
			return "document node";
		case 10:
			return "document type node (like <!DOCTYPE html>)";
		case 11:
			return "DocumentFragment node";
		default:
			return `unrecognized type ${nodeType}`;
	}
}

/**
 * Remove existing annotations created by this extension.
 * @param {*} node Which node to unwrap within
 * @param {*} regexs 
 * @param {*} consolidated_mapping 
 * @param {*} options 
 */
function rubyUnwrap(node, regexs, consolidated_mapping, options) {
	/* get list of ruby tags added by extension */
	let custom_annotations_list = node.querySelectorAll('ruby[data-ie-annotated]');
	/*  */
	for (let i=0; i<custom_annotations_list.length; i++) {
		let rubyTag = custom_annotations_list[i];
		console.log(rubyTag);
		let plain_key = JSON.parse(rubyTag.dataset.ieAnnotated).key;
		let to_replace = document.createTextNode(plain_key);
		rubyTag.replaceWith(to_replace);
	}
}

let consolidated_mapping = {
	'テ': 'て',
	'ラ': 'ら',
	'プ': 'ぷ',
	'ἀ': 'alpha with psili',
	'έ': 'epsiolon with tonos',
	'ρ': 'rho',
	'ο': 'omicron',  'Ο': "big omicron",
	'ς': 'sigma (final)'
};

let regexMapTest = createRegexMap(consolidated_mapping);
let testNode = document.body;

let annotate_button = document.createElement("button");
annotate_button.innerHTML = "Annotate!";
annotate_button.onclick = () => {
	rubyWrap(testNode, regexMapTest, consolidated_mapping);
};

let remove_annotation_button = document.createElement("button");
remove_annotation_button.innerHTML = "Remove Annotation";
remove_annotation_button.onclick = () => {
	rubyUnwrap(document.body);
};

document.body.appendChild(annotate_button);
document.body.appendChild(remove_annotation_button);