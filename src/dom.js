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

import { resolve, isPrimitive, different } from './vdom';

/*
 * A basic DOM renderer for the vdom.js library.
 */


/**
 * Render a vnode (JSX) into the given DOM `Element`.
 *
 * @param {object} node The virtual DOM node to render into the given element.
 * @param {Element} parent The DOM element to render into.
 * @param {Element} merge Attempt to re-use a DOM element.
 * @return The DOM element that has been rendered into the parent.
 */
export function render(node = '', parent, merge) {
	const element = diff(merge, node, {});
	
	// If the result of the diff is not part of the parent, append it to the 
	// parent.
	if (parent && element.parentNode !== parent) {
		parent.appendChild(element);
	}

	return element;
}

/**
 * Apply differences in a vnode (and its children) to a real DOM node.
 * 
 * @param {Element} [dom=null] A DOM node to mutate into the shape of the `vnode`.
 * @param {object} node The vnode representing the desired DOM structure.
 * @param {object} prev The vnode representing the previous DOM structure.
 * @return {Element} The created or mutated DOM node. 
 */
export function diff(dom = null, node, prev = {}) {
	return idiff(dom, dom.parentNode, resolve(node, prev), prev);
}

/**
 * Apply differences in a vnode (and its children) to a real DOM node.
 * 
 * @param {Element} [dom=null] A DOM node to mutate into the shape of the `vnode`.
 * @param {Element} parent The parent DOM node.
 * @param {object} node The vnode representing the desired DOM structure.
 * @param {object} prev The vnode representing the previous DOM structure.
 * @return {Element} The created or mutated DOM node. 
 */
export function idiff(dom = null, parent, node, prev = {}) {
	if (!prev || !dom && node) {
		// If there is no previous vnode or DOM node, create a new DOM node
    	return parent.appendChild(domify(node));
	} else if (!node) {
		// If there is no new vnode, delete the corresponding DOM node.
		return parent.removeChild(dom);
	} else if (different(node, prev)) {
		// If the previous and the new vnodes are of different type,
		// replace the old DOM node with the new one.
		const replacement = domify(node);
		parent.replaceChild(replacement, dom);
		return replacement;
	}

	// If the virtual dom node is a primitive node, just change the value of
	// the DOM text node
	if (isPrimitive(node) && node !== prev) {
		dom.nodeValue = node;
		return dom;
	} 

	// Diff the props of the virtual dom node
	diffProps(dom, node.props, prev.props);

	// Copy the current childNodes of the dom element
	const childNodes = [...dom.childNodes];

	// Get the children of the vnodes
	const currChildren = node && node.children || [];
	const prevChildren = prev && prev.children || []
	const bound = Math.max(currChildren.length, prevChildren.length);

	// Diff the children of the vnodes
	for (let i = 0; i < bound; i++) {
		idiff(childNodes[i], dom, currChildren[i], prevChildren[i]);
	}

	return dom;
}

/**
 * Convert the given virtual DOM node into
 * a real DOM element.
 *
 * @param {object} node The virtual DOM node to convert.
 * @return {Element} The virtual DOM element
 * converted into a real DOM element.
 */
function domify(node) {
	if (isPrimitive(node) || !(node && node.type)) {
		// If the vnode is primitive, create a text node containing the value
		return document.createTextNode(node);
	}

	// Create a new element with the given type
	const element = document.createElement(String(node.type));

	// Set the base of the vnode
	node._base = element;

	// Apply attributes to dom element
	diffProps(element, node.props);	
	
	// Create element for each child and append it to this
	// DOM element
	node.children
		.map(domify)
		.forEach(element.appendChild.bind(element));
		
	// If this node has components, inform them that they are mounted
	// in reverse order
	if (node._components) {
		for (let i = node._components.length - 1; i >= 0; i--) {
			node._components[i].componentDidMount();
		}
	} 

	return element;
}

/**
 * Apply differences in props to the given DOM node.
 *
 * @param {Element} dom The DOM node to apply the differences to.
 * @param {object} props The new properties to add to this node.
 * @param {object} prev The previous properties of this node.
 */
function diffProps(dom, props = {}, prev = {}) {
	const matcher = /^on/;
	const keys = Object.keys(prev).concat(Object.keys(props));
	for (let key of keys) {
		setAttribute(dom, key, props[key], prev[key]);
	}
}

/** 
 * Set a named attribute on the given Node, with special behavior for some names and event handlers.
 * If `value` is `null`, the attribute/handler will be removed.
 *
 *	@param {Element} dom A DOM element to mutate
 *	@param {string} name The name/key to set, such as an event or attribute name
 *	@param {any} value An attribute value, such as a function to be used as an event handler
 *	@param {any} prev The last value that was set for this name/node pair
 *	@private
 */
function setAttribute(dom, name, value, prev) {
	// Handle the class attribute
	if (name === 'className') {
		// React compatibility
		name = 'class';
	} else if (name === 'class' && value && typeof value === 'object') {
		value = Object.keys(value).map(key => value[key] ? key : "").join(" ");
	} 
	
	const matcher = /^on/;
	
	if (name === 'key') {
		// ignore
	} else if (name === 'class') {
		dom.className = value || '';
	} else if (name === 'style') {
		if (!value || typeof value === 'string' || typeof prev === 'string') {
			dom.style.cssText = value || '';
		} else if (value && typeof value === 'object') {
			if (typeof prev !== 'string') {
				Object.keys(prev).filter(key => !(key in value)).forEach(key => dom.style[key] = '');
			}
			
			Object.keys(value).forEach(key => dom.style[key] = value[key]);
		}
	} else if (name === 'dangerouslySetInnerHTML') {
		// React compatibility
		dom.innerHTML = value && value.__html || '';
	} else if (matcher.test(name)) {
		// If the prop is an event listener, add/remove the event listener 
		// to/from the DOM node
		const type = name.substring(2).toLowerCase();
		
		// Remove the old event listener and replace it with the new one.
		dom.removeEventListener(type, prev);
		dom.addEventListener(type, value);
	} else if (name !== 'list' && name in dom) {
		try {
			dom.setAttribute(name, value);
			dom[name] = value == null ? '' : value;
		} catch (e) {}
		if (value == null || value === false)  {
			dom.removeAttribute(name);
		}
	}
}
