import Collider from '../Collider'
import GameObject, {GameObjectInfo} from '../GameObject'

export interface BuildingInfo extends GameObjectInfo {
	width: number
	height: number
}

export default class Building extends GameObject {
	constructor (info: BuildingInfo) {
		super(info)
		this.collider = info.collider || Collider.create(
			Collider.AABB, info.width, info.width, info.height
		)
	}

	render() {
		// do nothing because it doesn't move
	}
}
