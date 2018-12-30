import * as THREE from 'three'
import Collider from '../Collider'
import GameObject, {GameObjectInfo} from '../GameObject'

export default class Monkey extends GameObject {
	velocity: THREE.Vector3

	constructor (info: GameObjectInfo = {}) {
		super(info)
		this.velocity = new THREE.Vector3()
		this.collider = info.collider || Collider.create(Collider.SPHERE, 1.0)
	}

	update (dt: number) {
		if (!super.update(dt)) return false
		const ft = dt / 1000
		this.position.x += ft * this.velocity.x
		this.position.y += ft * this.velocity.y
		this.rotation.z += ft
		return true
	}
}
