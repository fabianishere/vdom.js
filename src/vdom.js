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

import { diff } from './dom';

/*
 * A basic lightweight virtual DOM library, written in ES6, with no regard 
 * for compatibility.
 */

/**
 * This class represents a user-interface component and is the 
 * base class of all components.
 *
 * @author Fabian Mastenbroek
 * @author Christian Slothouber
 */
export class Component {
	/**
	 * Construct a {@link Component} object.
	 *
	 * @param props The properties received from parent element/component.
	 * @param context The component's context.
	 */
	constructor(props = {}, context = {}) {
		this.props = props;
		this.context = context;
		this.state = this.state || {};

		/** @private */
		this._dirty = false;
	}

	/**
	 * Render the component as a (virtual) DOM tree.
	 *
	 * @param {object} props The properties received from parent element/component.
	 * @param {object} state The component's current state.
	 * @param {object} ctx The component's context.
	 * @return {object} The (virtual) DOM node.
	 */
	render() {}

	/**
	 * Update component state by copying properties from `state` to `this.state`.
	 *
	 * @param {object} state The new state to set.
	 */
	setState(state) {
		this.prevState = Object.assign(this.state);
		if (typeof state === 'function') 
			state = state(this.state, this.props);
		this.state = Object.assign(this.state, state);
		this._dirty = true;
		this.forceUpdate();
	}

	/**
	 * Determine whether the component should re-render when receiving the given `props` and `state`.
	 *
	 * @param {object} nextProps The next properties the component will receive.
	 * @param {object} nextState The next state the component will receive.
	 * @param {object} nextContext The next context the component will receive.
	 * @return {boolean} <code>true</code> if the component should re-render, <code>false</code> otherwise.
	 */
	shouldComponentUpdate() {
		return true;
	}

	/**
	 * This method is invoked immediately before mounting occurs. 
	 * It is called before `render()`, therefore setting state in this method 
	 * will not trigger a re-rendering. 
	 * Avoid introducing any side-effects or subscriptions in this method.
	 *
	 * This is the only lifecycle hook called on server rendering. 
	 * Generally, we recommend using the `constructor()` instead.
	 */
	componentWillMount() {}

	/**
	 * This method is invoked immediately after a component is mounted. 
	 * Initialization that requires DOM nodes should go here. 
	 * 
	 * If you need to load data from a remote endpoint, this is a good place 
	 * to instantiate the network request. Setting state in this method will 
	 * trigger a re-rendering.
	 */
	componentDidMount() {}

	/**
	 * This method is invoked immediately before a component is unmounted and 
	 * destroyed. 
	 *
	 * Perform any necessary cleanup in this method, such as invalidating 
	 * timers, canceling network requests, or cleaning up any DOM elements that 
	 * were created in `componentDidMount`.
	 */
	componentWillUnmount() {}

	/**
	 * This method is invoked before a mounted component receives new props. 
	 * If you need to update the state in response to prop changes 
	 * (for example, to reset it), you may compare `this.props` and `nextProps`
	 *  and perform state transitions using `this.setState()` in this method.
	 *
	 * This method is not invoked if you just call `this.setState()`.
	 *
	 * @param {object} nextProps The next properties that the component will
	 * receive.
	 */
	componentWillReceiveProps() {}

	/**
	 * This method is invoked immediately before rendering when new props or 
	 * state are being received. 
	 * Use this as an opportunity to perform preparation before an update 
	 * occurs. 
	 *
	 * This method is not called for the initial render.
	 * 
	 * Note that you cannot call `this.setState()` here. 
	 * If you need to update state in response to a prop change, use 
	 * `componentWillReceiveProps()` instead.
	 *
	 * @param {object} nextProps The next properties that the component will
	 * receive.
	 * @param {object} nextState The next state that the component will receive.
	 */
	componentWillUpdate(nextProps, nextState) {}

	/**
	 * This method is invoked immediately after updating occurs. 
	 * This method is not called for the initial render.
	 * 
	 * Use this as an opportunity to operate on the DOM when the component has 
	 * been updated. 
	 * This is also a good place to do network requests as long as you compare 
	 * the current props to previous props (e.g. a network request may not be 
	 * necessary if the props have not changed).
	 *
	 * @param {object} prevProps The previous properties of the component.
	 * @param {object} prevState The previous state of the component.
	 */
	componentDidUpdate(prevProps, prevState) {}

	/**
	 * Immediately force the component to synchronously re-render.
	 */
	forceUpdate() {
		diff(this._node._base, this._original, this._node);
	}
}

/**
 * Create a virtual DOM element.
 *
 * @param {string|object} type The type of this element.
 * @param {object} props The properties of this element.
 * @param {array} args The child elements of this element.
 * @return {object} The virtual DOM element
 */
export function h(type, props, ...args) {
	let children = [].concat(...args);
	props = props || {};
	return { type, props , children };
}

/**
 * Determine whether the given virtual dom node is a primitive
 * node.
 * 
 * @param node The virtual dom node to test.
 * @return <code>true</code> if the node is a primitive node, 
 * <code>false</code> otherwise.
 */
export function isPrimitive(node = {}) {
	return typeof node === 'string' 
		|| typeof node === 'number' 
		|| typeof node === 'boolean' 
		|| node === null
		|| node instanceof String 
		|| node instanceof Date;
}

/**
 * Determine whether the given virtual dom node is a {@link Component}.
 *
 * @param node The virtual dom node to test.
 * @return <code>true</code> if the node is a component, <code>false</code>
 * otherwise.
 */
export function isComponent(node = {}) {
	return node && typeof node.type === 'function' && node.type.prototype.render;
}

/**
 * Determine whether the given virtual dom node is a stateless function
 * component.
 *
 * @param node The virtual dom node to test.
 * @return <code>true</code> if the node is a stateless function component,
 * <code>false</code> otherwise.
 */
export function isFunctionalComponent(node = {}) {
	return node && typeof node.type === 'function' 
		&& (!node.type.prototype || typeof node.type.prototype.render === 'undefined');
}

/**
 * Determine whether the two given virtual dom nodes are of a different type.
 *
 * @param {object} node The new virtual dom node.
 * @param {object} prev The old virtual dom node to compare to.
 * @returm {bool} <code>true</code> if the two nodes are different,
 * <code>false</code> otherwise.
 */
export function different(node, prev) {
	return typeof node !== typeof prev 
		|| isPrimitive(node) && !isPrimitive(node) 
		|| node.type !== prev.type;
}

/**
 * Resolve all lazy rendered components in a virtual dom tree.
 *
 * @param {object} node The virtual dom node to process.
 * @param {object} prev The previous virtual node tree.
 * @param {int} depth The component depth.
 * @return {object} The virtual dom node that was processed.
 */
export function resolve(node, prev = {}, depth = 0) {
	const component = prev._components && prev._components[depth];

	// If the previous component is different that the current vnode, 
	// unmount that component
	if (component && !(isComponent(node) && component instanceof node.type)) {
		// Unmount that component
		component.componentWillUnmount();
	}

	if (isFunctionalComponent(node)) {
		return resolveFunctionalComponent(node, prev);
	} else if (isPrimitive(node)) {
		return resolvePrimitive(node, prev);
	} else if (isComponent(node)) {
		// If this virtual dom node is a component, resolve that component to an
		// actual virtual dom tree.
		return resolveComponents(node, prev, depth);
	}

	// Get the children of the vnodes
	const prevChildren = prev && prev.children || [];
	const currChildren = node && node.children || [];
	const children = [];
	const bound = Math.max(currChildren.length, prevChildren.length);

	// Resolve the children of the vnodes and store the result
	for (let i = 0; i < bound; i++) {
		children[i] = resolve(currChildren[i], prevChildren[i]);
	}

	// If the virtual dom node exists, set the resolved children as children
	if (node) 
		node.children = children;
	return node;
}

/**
 * Resolve the given functional component.
 *
 * @param {object} node The virtual dom node to resolve.
 * @param {object} prev The previous virtual node tree.
 * @return {object} The virtual dom node that was processed.
 */
function resolveFunctionalComponent(node, prev = {}) {
	// If this virtual dom node is a functional component, wrap it in a
	// PureComponent instance.
	return resolve(h(PureComponent, Object.assign({}, node.props, 
		{ __func: node.type }), node.children), prev);
}

/**
 * This {@link Component} is a component wrapper around a pure function.
 *
 * @author Fabian Mastenbroek
 */
class PureComponent extends Component {
	/**
	 * Render this component with the given props, state and context.
	 *
	 * @param {object} props The properties passed to this component.
	 * @param {object} state The component's state.
	 * @param {object} ctx The context.
	 */
	render(props, _, ctx) {
		return props.__func(props, ctx);
	}
}

/**
 * Resolve the given primitive virtual dom node.
 *
 * @param {object} node The virtual dom node to resolve.
 * @param {object} prev The previous virtual node tree.
 * @return {object} The virtual dom node that was processed.
 */
function resolvePrimitive(node, prev = {}) {
	// Box primitive nodes so we can attach attributes to them
	return node instanceof String ? node : resolve(new String(node), prev);
}

/**
 * Resolve the components in the given virtual dom tree.
 *
 * @param {object} node The virtual dom node to process.
 * @param {object} prev The previous virtual node tree.
 * @param {int} depth The component depth.
 */
function resolveComponents(node, prev = {}, depth = 0) {
	// If the previous tree contains a component, re-use that component
	let component = prev._components && prev._components[depth];
	let mount = true;
	let props = Object.assign({}, node.props, { children: node.children });
	let context = {};
	
	// If the component does not exist in the previous tree or was of a, 
	// different type, construct the new component.
	if (!component) {
		component = new node.type(props, context);
		mount = false;
		component.componentWillMount();
	}

	context = component.context;
	const state = component.state;
	const prevProps = component.props;
	const prevState = component.prevState || state;
	const prevContext = component.prevContext || context;

	let dirty = !mount;
	let ret = prev;

	// If the props of the component changed, the component is dirty
	if (props !== prevProps) {
		component._dirty = true;
		component.componentWillReceiveProps(props);
	}

	// If the component is flagged dirty, determine whether we should update it
	if (component._dirty) {
		// Restore component to old state
		component.props = prevProps;
		component.state = prevState;
		component.context = prevContext;

		// Ask the component whether we should update
		dirty = dirty || component.shouldComponentUpdate(props, state, context);

		// If the component should re-render, inform the component
		if (dirty && !mount) {
			component.componentWillUpdate(props, state, context);
		}

		// Restore component to new state
		component.props = props;
		component.state = state;
		component.context = context;
	}

	// Render the component if we determined the component dirty
	if (dirty) {
		// Set the new properties, state and context
		component.props = props;
		component.state = state;
		component.context = context;

		// Save reference to the original vdom tree
		component._original = node;

		// (Re-)render the dirty component and resolve sub-components in the tree.
		node = component.render(props, state, context);
		node = resolve(node, prev, depth + 1);

		// Keep a history of the component in the tree
		node._components = node._components || [];
		node._components.unshift(component);
		node._base = prev._base;
		component._node = node;

		// Component is cleaned
		component._dirty = false;

		// Inform the component that we updated it
		component.componentDidUpdate(prevProps, prevState, prevContext);
	}

	// Reset the previous state of the component
	component.prevProps = null;
	component.prevState = null;
	component.prevContext = null;

	return node;
}
