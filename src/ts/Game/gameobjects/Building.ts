import * as THREE from 'three'
import Collider from '../Collider'
import GameObject from '../GameObject'

export default class Building extends GameObject {
	constructor (
		visual: THREE.Object3D, pos: THREE.Vector3, rot: THREE.Euler,
		width: number, height: number
	) {
		super(visual, pos, rot)
		this.collider = new Collider(Collider.AABB, width, width, height)
	}

	render() {
		// do nothing because it doesn't move
	}
}
