import * as THREE from 'three'
import Collider from '../Collider'
import GameEvent from '../GameEvent'
import GameObject, {GameObjectInfo} from '../GameObject'
import {GameEventCallback} from '../GameEventEmitter'

const ROT_VEL = Math.PI / 2.0
const FWD_VEL = 8.0
const FIRE_RATE = 333

export interface PlayerShootEvent extends GameEvent {
	position: THREE.Vector3
	rotation: THREE.Euler
}

/** Player inputs */
export interface PlayerInputs {
	forward: boolean
	back: boolean
	left: boolean
	right: boolean
	fire: boolean
}

export function PlayerInputs(): PlayerInputs {
	return {
		forward: false,
		back: false,
		left: false,
		right: false,
		fire: false
	}
}

export interface PlayerInfo extends GameObjectInfo {
	onShoot(e: PlayerShootEvent): void
}

export default class Player extends GameObject {
	inputs: PlayerInputs
	/* Remaining shot cooldown time */
	fireT: number

	constructor (info: PlayerInfo) {
		super(info)
		this.collider = info.collider || Collider.create(Collider.SPHERE, 1.5)
		this.inputs = PlayerInputs()
		this.fireT = 0
		this.on('shoot', info.onShoot)
	}

	// Override for refined types
	on (name: 'shoot', cb: (e: PlayerShootEvent) => void): void {
		return super.on(name, cb as GameEventCallback)
	}

	emit (e: PlayerShootEvent) {
		return super.emit(e)
	}

	setInputs (i: PlayerInputs) {
		Object.assign(this.inputs, i)
	}

	update (dt: number) {
		super.update(dt)
		this.fireT = Math.max(this.fireT - dt, 0)
		const ft = dt / 1000.0
		const i = this.inputs
		const vel
			= i.forward ? ft * FWD_VEL
			: i.back ? -0.5 * ft * FWD_VEL
			: 0
		const rvel
			= i.left ? ft * ROT_VEL
			: i.right ? -ft * ROT_VEL
			: 0
		const r = this.rotation.z + rvel
		const p = this.position
		p.x += vel * Math.cos(r)
		p.y += vel * Math.sin(r)
		this.rotation.z += rvel
		if (i.fire && this.fireT <= 0) {
			_v.set(this.position.x, this.position.y, this.position.z - 0.5)
			this.emit({
				name: 'shoot', sender: this, position: _v, rotation: this.rotation
			})
			this.fireT = FIRE_RATE
		}
		return true
	}
}

/** Scratchpad vector */
const _v = new THREE.Vector3() // tslint:disable-line variable-name
