// Module to handle keyboard, mouse, touch events.
// Useful for games.

export type GameInputEventType = 'press' | 'release'

export type GameInputEventListener = (name: string) => void

interface GameInputListener {
	type: GameInputEventType, callback: GameInputEventListener
}

const DEVICE_NONE  = 0
const DEVICE_MOUSE = 1
const DEVICE_TOUCH = 2

const isIOS = !!navigator.userAgent.match(/iPhone|iPad|iPod/i)

interface GameInput {
	name: string
	pressed: boolean
	keyCodes: number[]
	elements: GameInputElement[]
	listeners: GameInputListener[]
}

interface GameInputElement {
	element: Element
	pressed: boolean
	device: number
}

const inputs: {[name: string]: GameInput} = Object.create(null)

export const keyStates = new Array<boolean>(256).fill(false)

let keyListenersInitialized = false

/**
 * Add the global key listeners. Required to handle keyboard events.
 */
export function addKeyListeners() {
	if (keyListenersInitialized) {
		console.warn("Key listeners already added.")
		return
	}
	document.addEventListener('keydown', onKeyDown, true)
	document.addEventListener('keyup', onKeyUp, true)
	keyListenersInitialized = true
}

/**
 * Remove the global key listeners
 */
export function removeKeyListeners() {
	if (!keyListenersInitialized) {
		console.warn("Key listeners were not yet added.")
		return
	}
	document.removeEventListener('keydown', onKeyDown, true)
	document.removeEventListener('keyup', onKeyUp, true)
	keyListenersInitialized = false
}

export function listeningKeys() {
	return keyListenersInitialized
}

function onKeyDown (e: KeyboardEvent) {
	const code = e.keyCode
	if (!keyStates[code]) {
		// this key state changed
		keyStates[code] = true
		// See if we need to update state of any inputs
		const inps = findInputsWithKeyCode(code)
		for (let i = 0; i < inps.length; ++i) {
			const input = inps[i]
			if (!input.pressed) {
				input.pressed = true
				const listeners = input.listeners
				for (let j = 0; j < listeners.length; ++j) {
					const l = listeners[j]
					if (l.type === 'press') l.callback(input.name)
				}
			}
		}
	}
}

function onKeyUp (e: KeyboardEvent) {
	const code = e.keyCode
	if (keyStates[code]) {
		// this key state changed
		keyStates[code] = false
		// See if we need to update state of any inputs
		const inps = findInputsWithKeyCode(code)
		for (let i = 0; i < inps.length; ++i) {
			const input = inps[i]
			if (input.pressed) {
				// Check if any other keys are down
				if (inputKeyState(input.name)) return
				// Check if any elements are pressed
				if (inputElementState(input.name)) return
				// No - so this input is truly released
				input.pressed = false
				const listeners = input.listeners
				for (let j = 0; j < listeners.length; ++j) {
					const l = listeners[j]
					if (l.type === 'release') l.callback(input.name)
				}
			}
		}
	}
}

/** Find a listener for the given input of the given type */
function findInputListener (
	input: GameInput, type: GameInputEventType
): GameInputListener | void {
	for (let i = 0; i < input.listeners.length; ++i) {
		const l = input.listeners[i]
		if (l.type === type) {
			return l
		}
	}
}

/** Find input(s) with a key code */
function findInputsWithKeyCode (code: number): GameInput[] {
	const inps: GameInput[] = []
	const names = Object.keys(inputs)
	for (let i = 0; i < names.length; ++i) {
		const input = inputs[names[i]]
		const kcs = input.keyCodes
		for (let j = 0; j < kcs.length; ++j) {
			if (kcs[j] === code) {
				inps.push(input)
			}
		}
	}
	return inps
}

/** Find if a key associated with this input is pressed */
function inputKeyState (name: string) {
	const input = inputs[name]
	if (!input) {
		console.warn("Unrecognized input name:", name)
		return
	}
	const kcs = input.keyCodes
	for (let i = 0; i < kcs.length; ++i) {
		if (keyStates[kcs[i]]) return true
	}
	return false
}

/** Find if an element associated with this input is pressed */
function inputElementState (name: string) {
	const input = inputs[name]
	if (!input) {
		console.warn("Unrecognized input name:", name)
		return
	}
	const els = input.elements
	for (let i = 0, n = els.length; i < n; ++i) {
		if (els[i].pressed) return true
	}
	return false
}

function addElementListeners (gie: GameInputElement, input: GameInput) {
	const el = gie.element
	el.addEventListener('touchstart', () => {
		pressElement(gie, input, DEVICE_TOUCH)
	})
	el.addEventListener('touchend', () => {
		releaseElement(gie, input, DEVICE_TOUCH)
	})
	el.addEventListener('mousedown', () => {
		pressElement(gie, input, DEVICE_MOUSE)
	})
	el.addEventListener('mouseup', () => {
		releaseElement(gie, input, DEVICE_MOUSE)
	})
	el.addEventListener('touchmove', e => {
		// Prevent dragging of this element
		e.preventDefault()
	})
	if (config.iOSHacks) {
		snuffiOSEvents(el)
	}
}

function pressElement (gie: GameInputElement, input: GameInput, device: number) {
	if (gie.device !== DEVICE_NONE && gie.device !== device) return
	gie.device = device
	gie.pressed = true
	if (input.pressed) return
	input.pressed = true
	const l = findInputListener(input, 'press')
	l && l.callback(input.name)
}

function releaseElement (gie: GameInputElement, input: GameInput, device: number) {
	if (gie.device !== DEVICE_NONE && gie.device !== device) return
	gie.pressed = false
	setTimeout(() => {
		// iOS will fire a delayed mouse event after touchend.
		// Delaying the device reset will ignore that mouse event.
		gie.device = DEVICE_NONE
	}, 500)
	// check keystate - if still pressed, exit - no event.
	if (!input.pressed || inputKeyState(name)) return
	input.pressed = false
	const l = findInputListener(input, 'release')
	l && l.callback(input.name)
}

export const config = {
	iOSHacks: true
}

/**
 * Creates an input object associated with key code(s) and element(s)
 * that can be queried for state and listened to for press/release events.
 */
export function createInput (name: string, keyCodes?: number[], elements?: ArrayLike<Element>) {
	if (!name || typeof name !== 'string') {
		throw new Error("Invalid name for input.")
	}
	if (name in inputs) {
		throw new Error(`Input with name '${name} already exists.`)
	}
	const input: GameInput = {
		name,
		pressed: false,
		keyCodes: [],
		elements: [],
		listeners: []
	}
	if (keyCodes && keyCodes.length > 0) {
		if (!keyListenersInitialized) {
			addKeyListeners()
		}
		for (let i = 0; i < keyCodes.length; ++i) {
			const code = keyCodes[i]
			if (input.keyCodes.indexOf(code) >= 0) {
				console.warn(`Duplicate key code (${code}) specified for input '${name}'`)
			}
			input.keyCodes[i] = code
		}
	} else if (!elements || elements.length < 1) {
		throw new Error("No keycodes or elements supplied to createInput")
	}
	if (elements && elements.length > 0) {
		for (let i = 0; i < elements.length; ++i) {
			const gie = {element: elements[i], pressed: false, device: 0}
			input.elements.push(gie)
			addElementListeners(gie, input)
		}
	}
	inputs[name] = input
}

/**
 * Gets the pressed state of the named input
 */
export function get (name: string) {
	const i = inputs[name]
	return i ? i.pressed : false
}

/**
 * Get pressed states for all keys in the provided object
 */
export function getKeys (obj: object) {
	const keys = Object.keys(obj)
	for (let i = 0; i < keys.length; ++i) {
		const key = keys[i]
		;(obj as any)[key] = get(key)
	}
	return obj
}

/**
 * Attach an input listener callback.
 */
export function addListener (
	name: string, type: GameInputEventType, callback: GameInputEventListener
) {
	if (!name || typeof name !== 'string') {
		throw new Error("Invalid type for name.")
	}
	if (type !== 'press' && type !== 'release') {
		throw new Error("Invalid input event type.")
	}
	const input = inputs[name]
	if (!input) {
		throw new Error(`Input with name '${name}' not found.`)
	}
	const ls = input.listeners
	for (let i = 0; i < ls.length; ++i) {
		const l = ls[i]
		if (l.type === type && l.callback === callback) {
			console.warn("Already added this listener.")
			return
		}
	}
	ls.push({type, callback})
}

/**
 * Detach an input listener callback.
 */
export function removeListener (
	name: string, type: GameInputEventType, callback: GameInputEventListener
) {
	const input = inputs[name]
	if (!input) {
		console.warn(`Input not found with name ${name}`)
	}
	const ls = input.listeners
	for (let i = ls.length - 1; i >= 0; --i) {
		const l = ls[i]
		if (l.type === type && l.callback === callback) {
			ls.splice(i, 1)
			return
		}
	}
	console.warn(`Listener not found for input '${name}' with type ${type}, cannot remove.`)
}

/** iOS troublesome events to prevent */
const IOS_SNUFF_EVENTS = ['dblclick']

/**
 * iOS Hack utility - prevents events on the given element
 */
export function snuffiOSEvents (el: Element) {
	if (!isIOS || !config.iOSHacks) return
	IOS_SNUFF_EVENTS.forEach(name => {
		el.addEventListener(name, e => {e.preventDefault()})
	})
}
