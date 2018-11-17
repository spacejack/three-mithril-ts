import * as THREE from 'three'
import GameObject from '../GameObject'

export default class Spark extends GameObject {
	lifeSpan: number

	constructor (
		visual: THREE.Object3D, pos: THREE.Vector3, rot?: THREE.Euler,
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
		const vis = this.visual as THREE.Mesh
		const s = 1.0 + 3.0 * this.lifeT / this.lifeSpan
		vis.scale.set(s, s, s)
		const mat = vis.material as THREE.MeshBasicMaterial
		mat.opacity = 0.75 - 0.75 * this.lifeT / this.lifeSpan
	}
}
