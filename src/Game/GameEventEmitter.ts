import GameEvent from './GameEvent'

export type GameEventCallback = (event: GameEvent) => void

export default class GameEventEmitter {
	eventCallbacks: Record<string, GameEventCallback[]>

	constructor() {
		this.eventCallbacks = Object.create(null)
	}

	on (name: string, cb: GameEventCallback) {
		if (!name || typeof name !== 'string' || typeof cb !== 'function') {
			throw new Error('Invalid params')
		}
		let cbs = this.eventCallbacks[name]
		if (!cbs) {
			cbs = [cb]
			this.eventCallbacks[name] = cbs
		} else {
			if (cbs.indexOf(cb) < 0) {
				cbs.push(cb)
			}
		}
	}

	off (name: string, cb: GameEventCallback) {
		if (!name || typeof name !== 'string' || typeof cb !== 'function') {
			throw new Error('Invalid params')
		}
		const cbs = this.eventCallbacks[name]
		if (!cbs) {
			return
		}
		const i = cbs.indexOf(cb)
		if (i < 0) {
			return
		}
		if (cbs.length < 2) {
			delete this.eventCallbacks[name]
			return
		}
		cbs.splice(i, 1)
	}

	emit (e: GameEvent) {
		if (!e.name || typeof e.name !== 'string') {
			throw new Error('Invalid GameEvent')
		}
		const cbs = this.eventCallbacks[e.name]
		if (!cbs) {
			return
		}
		for (const cb of this.eventCallbacks[e.name]) {
			cb(e)
		}
	}
}
