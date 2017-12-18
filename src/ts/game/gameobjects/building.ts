import {Vector3, Euler, Object3D} from 'three'
import Collider from '../collider'
import GameObject from '../gameobject'

export default class Building extends GameObject {
	constructor (visual: Object3D, pos: Vector3, rot: Euler, width: number, height: number) {
		super(visual, pos, rot)
		this.collider = new Collider(Collider.AABB, width, width, height)
	}

	render() {
		// do nothing because it doesn't move
	}
}
