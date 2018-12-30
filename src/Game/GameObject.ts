// Simple old-school OOP GameObject base class.
// Going with this style because the game is simple enough
// and other architectures like entity-component get a lot
// more opinionated and require more infrastructure.

import * as THREE from 'three'
import GameEvent from './GameEvent'
import GameEventEmitter from './GameEventEmitter'
import Collider from './Collider'

/** Object creation options */
export interface GameObjectInfo {
	position?: THREE.Vector3
	rotation?: THREE.Euler
	visual?: THREE.Object3D
	collider?: Collider
	/** Lifespan in ms after which it will be snuffed */
	duration?: number
	/** Optional onKill listener */
	onKill?(e: GameEvent): void
	/** Optional onSnuff listener */
	onSnuff?(e: GameEvent): void
}

/** Base class for all game objects */
export default class GameObject extends GameEventEmitter {
	position: THREE.Vector3
	rotation: THREE.Euler
	visual?: THREE.Object3D
	collider?: Collider
	duration?: number

	lifeT: number
	isAlive: boolean

	constructor (info: GameObjectInfo = {}) {
		super()
		this.visual = info.visual
		this.collider = info.collider
		this.position = info.position ? info.position.clone() : new THREE.Vector3()
		this.rotation = info.rotation ? info.rotation.clone() : new THREE.Euler()
		if (this.visual) {
			this.visual.position.copy(this.position)
			this.visual.rotation.copy(this.rotation)
		}
		this.duration = info.duration
		this.lifeT = 0
		this.isAlive = true
		if (info.onSnuff) {
			this.on('snuff', info.onSnuff)
		}
		if (info.onKill) {
			this.on('kill', info.onKill)
		}
	}

	/** Update a list of game objects */
	static updateList (
		objs: GameObject[], dt: number, onRemove?: (obj: GameObject, i: number) => void
	) {
		for (let i = objs.length - 1; i >= 0; --i) {
			if (!objs[i].update(dt)) {
				onRemove && onRemove(objs[i], i)
				objs.splice(i, 1)
			}
		}
	}

	/** Render a list of game objects */
	static renderList (objs: GameObject[]) {
		for (let i = 0; i < objs.length; ++i) {
			objs[i].render()
		}
	}

	/** Test collision between game objects */
	static testHit (a: GameObject, b: GameObject): boolean {
		if (!a.collider || !b.collider) return false
		return Collider.hit(a.collider, a.position, b.collider, b.position)
	}

	/** Test collision between a game object and a list of game objects */
	static testHitList<A extends GameObject, B extends GameObject> (
		a: A, objs: B[],
		onHit?: (obj: B) => boolean | void
	) {
		let hits = 0
		for (let i = objs.length - 1; i >= 0; --i) {
			if (GameObject.testHit(a, objs[i])) {
				hits += 1
				if (onHit && onHit(objs[i])) {
					// Caller wants to bail out of loop
					return hits
				}
			}
		}
		return hits
	}

	/** Test collisions between 2 lists of game objects */
	static testHitLists<A extends GameObject, B extends GameObject> (
		a: A[], b: B[],
		onHit?: (obj1: A, obj2: B) => boolean | void
	) {
		let hits = 0
		for (let i = a.length - 1; i >= 0; --i) {
			for (let j = b.length - 1; j >= 0; --j) {
				if (GameObject.testHit(a[i], b[j])) {
					hits += 1
					if (onHit && onHit(a[i], b[j])) {
						// Caller wants to bail out of inner loop
						break
					}
				}
			}
		}
		return hits
	}

	/**
	 * @param dt Delta time (milliseconds) elapsed since last update
	 * @returns true if still alive, false if dead
	 */
	update (dt: number): boolean {
		if (!this.isAlive) return false
		this.lifeT += dt
		if (this.duration != null && this.lifeT >= this.duration) {
			this.snuff()
			return false
		}
		return true
	}

	/**
	 * Since we have a retained-mode scene managed by three.js, all our render
	 * method does is copy gameobject state to its visual representation.
	 */
	render(): void {
		if (!this.visual) return
		this.visual.position.copy(this.position)
		this.visual.rotation.copy(this.rotation)
	}

	/** End this object's life */
	snuff(): boolean {
		if (!this.isAlive) return false
		this.emit({name: 'snuff', sender: this, position: this.position})
		this.isAlive = false
		return true
	}

	/** Violently end this object's life */
	kill(): boolean {
		if (!this.isAlive) return false
		this.emit({name: 'kill', sender: this, position: this.position})
		this.snuff()
		return true
	}
}
