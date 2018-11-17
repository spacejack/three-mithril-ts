import * as THREE from 'three'
import Collider from '../Collider'
import GameObject from '../GameObject'

export interface MonkeyActions {
	die(position: THREE.Vector3): void
}

export default class Monkey extends GameObject {
	velocity: THREE.Vector3
	actions: MonkeyActions

	constructor (
		visual: THREE.Object3D, pos: THREE.Vector3, rot: THREE.Euler,
		actions: MonkeyActions
	) {
		super(visual, pos, rot)
		const r = this.rotation.z
		this.velocity = new THREE.Vector3()
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
