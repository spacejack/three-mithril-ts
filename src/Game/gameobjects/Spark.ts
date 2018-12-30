import * as THREE from 'three'
import GameObject, {GameObjectInfo} from '../GameObject'

export interface SparkInfo extends GameObjectInfo {
	duration: number
}

export default class Spark extends GameObject {
	duration: number

	constructor (info: SparkInfo) {
		super(info)
		this.duration = info.duration != null ? info.duration : 500
	}

	update (dt: number) {
		if (!super.update(dt)) return false
		return true
	}

	render() {
		super.render()
		const vis = this.visual as THREE.Mesh
		const s = 1.0 + 3.0 * this.lifeT / this.duration
		vis.scale.set(s, s, s)
		const mat = vis.material as THREE.MeshBasicMaterial
		mat.opacity = 0.75 - 0.75 * this.lifeT / this.duration
	}
}
