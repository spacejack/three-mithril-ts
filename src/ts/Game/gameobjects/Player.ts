import * as THREE from 'three'
import Collider from '../Collider'
import GameObject from '../GameObject'

const ROT_VEL = Math.PI / 2.0
const FWD_VEL = 8.0
const FIRE_RATE = 333

/** Player inputs */
export interface PlayerInputs {
	forward: boolean
	back: boolean
	left: boolean
	right: boolean
	fire: boolean
}

export function createPlayerInputs(): PlayerInputs {
	return {
		forward: false,
		back: false,
		left: false,
		right: false,
		fire: false
	}
}

export interface PlayerActions {
	shoot(position: THREE.Vector3, rotation: THREE.Euler): void
}

export default class Player extends GameObject {
	inputs: PlayerInputs
	actions: PlayerActions
	/* Remaining shot cooldown time */
	fireT: number

	constructor (visual: THREE.Object3D, pos: THREE.Vector3, rot: THREE.Euler, actions: PlayerActions) {
		super(visual, pos, rot)
		this.collider = new Collider(Collider.SPHERE, 1.5)
		this.inputs = createPlayerInputs()
		this.actions = actions
		this.fireT = 0
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
			this.actions.shoot(_v, this.rotation)
			this.fireT = FIRE_RATE
		}
		return true
	}
}

/** Scratchpad vector */
const _v = new THREE.Vector3()
