import {Object3D, Vector3, Euler} from 'three'
import Collider from '../collider'
import GameObject from '../gameobject'

export interface MonkeyActions {
	die(position: Vector3): void
}

export default class Monkey extends GameObject {
	velocity: Vector3
	actions: MonkeyActions

	constructor (
		visual: Object3D, pos: Vector3, rot: Euler,
		actions: MonkeyActions
	) {
		super(visual, pos, rot)
		const r = this.rotation.z
		this.velocity = new Vector3()
		this.collider = new Collider(Collider.SPHERE, 1.0)
		this.actions = actions
	}

	update (dt: number) {
		if (!super.update(dt)) return false
		const ft = dt / 1000
		this.position.x += ft * this.velocity.x
		this.position.y += ft * this.velocity.y
		this.rotation.z += ft
		return true
	}

	kill() {
		if (!this.isAlive) return
		super.kill()
		this.actions.die(this.position)
	}
}
