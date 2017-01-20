/*
 * The MIT License (MIT)
 *
 * Copyright (c) 2017 Fabian Mastenbroek
 *
 * Permission is hereby granted, free of charge, to any person obtaining a copy
 * of this software and associated documentation files (the "Software"), to deal
 * in the Software without restriction, including without limitation the rights
 * to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
 * copies of the Software, and to permit persons to whom the Software is
 * furnished to do so, subject to the following conditions:
 */

import { resolve, isPrimitive } from './vdom';

 /*
  * A string renderer for the vdom.js library.
  */

/**
 * Render the given vnode (and its children) into a string containing the
 * html.
 *
 * @param {object} node The vnode to render into a string.
 * @return {string} The string containing the rendered html.
 */
export function render(node) {
	return irender(resolve(node));
}
	
/**
 * Render the given vnode (and its children) into a string containing the
 * html, without resolving components in the tree.
 *
 * @param {object} node The vnode to render into a string.
 * @return {string} The string containing the rendered html.
 */
 export function irender(node) {
	if (isPrimitive(node)) {
		// If the node is primitive, return the primitive value.
		return node.valueOf();
	}

	// Render the vdom tree otherwise
	let res = '', html;

	if (node.props) {
		for (let [key, value] of Object.entries(node.props || {})) {
			if (key === 'children') {
				continue;
			} else if (key === 'key' || key === 'ref') {
				// Ignore internal attributes
				continue;
			}

			if (key === 'className') {
				if (node.props['class']) 
					continue;
				key = 'class';
			}

			if (key === 'class' && value && typeof value ==='object') {
				value = Object.entries(value)
					.map(([key, value]) => value ? key : "")
					.join(" ");
			} else if (key === 'style' && value && typeof value ==='object') {
				value = Object.entries(value)
					.map(([key, value]) => key + ':' + value)
					.join(';');
				
			}

			if (key === 'dangerouslySetInnerHTML') {
				html = value && value.__html;
			} else if ((value || value === 0 || value === '') 
					&& typeof value !== 'function') {

				if (value === true || value === '') {
					// Allow boolean attributes
					res += ' ' + key;
					continue;
				}

				// Encode the attribute
				res += ` ${key}="${encode(value)}"`;
			}
		}
	}

	// Account for multiline attribute
	let sub = res.replace(/^\n\s*/, ' ');
	if (sub !== res && !res.indexOf('\n')) { 
		res = sub;
	} else if (~res.indexOf('\n')) { 
		res += '\n';
	}

	res = `<${node.type}${res}>`;

	if (html) {
		res += html;
	} else if (node.children) {
		res += node.children
			.map(irender)
			.join("\n");
	}

	if (!VOID_ELEMENTS.includes(node.type)) {
		// Write closing tag
		res += `</${node.type}>`;
	}

	return res;
 }


/**
 * Elements that do not require closing tags.
 */
const VOID_ELEMENTS = [
	'area',
	'base',
	'br',
	'col',
	'embed',
	'hr',
	'img',
	'input',
	'link',
	'meta',
	'param',
	'source',
	'track',
	'wbr'
];

/**
 * Characters that should be escaped.
 */
const ESC = {
	'<': '&lt;',
	'>': '&gt;',
	'"': '&quot;',
	'&': '&amp;'
};

/**
 * Encode the given string for HTML.
 *
 * @param {string} str The string to encode.
 * @return {string} The encoded string.
 */
function encode(str) { 
	return String(str).replace(/[<>"&]/g, c => ESC[c] || c);
}
