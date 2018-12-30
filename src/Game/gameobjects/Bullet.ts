import * as THREE from 'three'
import Collider from '../Collider'
import GameObject, {GameObjectInfo} from '../GameObject'

export interface BulletInfo extends GameObjectInfo {
	absVel: number
}

export default class Bullet extends GameObject {
	duration: number
	velocity: THREE.Vector3

	constructor (info: BulletInfo) {
		super(info)
		this.duration = info.duration || 1000
		const r = this.rotation.z
		this.velocity = new THREE.Vector3(info.absVel * Math.cos(r), info.absVel * Math.sin(r), 0)
		this.collider = info.collider || Collider.create(Collider.SPHERE, 0.5)
	}

	update (dt: number) {
		if (!super.update(dt)) return false
		const ft = dt / 1000
		this.position.x += ft * this.velocity.x
		this.position.y += ft * this.velocity.y
		return true
	}
}
