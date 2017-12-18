import {Object3D, Vector3, Euler, Mesh, MeshBasicMaterial} from 'three'
import GameObject from '../gameobject'

export default class Spark extends GameObject {
	lifeSpan: number

	constructor (
		visual: Object3D, pos: Vector3, rot?: Euler,
		lifeSpan = 500
	) {
		super(visual, pos, rot)
		this.lifeSpan = lifeSpan
	}

	update (dt: number) {
		if (!super.update(dt)) return false
		if (this.lifeT >= this.lifeSpan) {
			this.snuff()
			return false
		}
		return true
	}

	render() {
		super.render()
		const vis = this.visual as Mesh
		const s = 1.0 + 3.0 * this.lifeT / this.lifeSpan
		vis.scale.set(s, s, s)
		const mat = vis.material as MeshBasicMaterial
		mat.opacity = 0.75 - 0.75 * this.lifeT / this.lifeSpan
	}
}
