import * as THREE from 'three'
import Collider from '../Collider'
import GameObject from '../GameObject'

export interface BulletActions {
	spark(position: THREE.Vector3): void
}

export default class Bullet extends GameObject {
	lifeSpan: number
	velocity: THREE.Vector3
	actions: BulletActions

	constructor (
		visual: THREE.Object3D, pos: THREE.Vector3, rot: THREE.Euler,
		actions: BulletActions, absVel = 10, lifeSpan = 1000
	) {
		super(visual, pos, rot)
		this.lifeSpan = lifeSpan
		const r = this.rotation.z
		this.velocity = new THREE.Vector3(absVel * Math.cos(r), absVel * Math.sin(r), 0)
		this.collider = new Collider(Collider.SPHERE, 0.5)
		this.actions = actions
	}

	update (dt: number) {
		if (!super.update(dt)) return false
		if (this.lifeT >= this.lifeSpan) {
			this.snuff()
			return false
		}
		const ft = dt / 1000
		this.position.x += ft * this.velocity.x
		this.position.y += ft * this.velocity.y
		return true
	}

	kill() {
		if (!this.isAlive) return
		super.kill()
		this.actions.spark(this.position)
	}
}
