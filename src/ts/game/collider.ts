// Simple collision detection for spheres and axis-aligned bounding boxes

import {Vector3} from 'three'

export type ColliderType = 1 | 2

export default class Collider {
	static SPHERE: ColliderType = 1
	static AABB: ColliderType   = 2

	type: ColliderType
	size: Vector3

	constructor (type: ColliderType, xs: number, ys?: number, zs?: number) {
		this.type = type
		this.size = new Vector3(
			xs,
			type !== Collider.SPHERE && typeof ys === 'number' ? ys : xs,
			type !== Collider.SPHERE && typeof zs === 'number' ? zs : xs
		)
	}

	/**
	 * Test if 2 objects are colliding
	 */
	static hit (a: Collider, ap: Vector3, b: Collider, bp: Vector3): boolean {
		if (a.type === Collider.SPHERE && b.type === Collider.SPHERE) {
			return ap.distanceTo(bp) <= a.size.x + b.size.x
		}
		if (a.type === Collider.AABB && b.type === Collider.AABB) {
			return Math.abs(ap.x - bp.x) < (a.size.x + b.size.x) / 2
				&& Math.abs(ap.y - bp.y) < (a.size.y + b.size.y) / 2
				&& Math.abs(ap.z - bp.z) < (a.size.z + b.size.z) / 2
		}
		// Test SPHERE vs AABB
		return a.type === Collider.SPHERE
			? distToAABB(ap, bp, b.size) < a.size.x  // sphere vs aabb
			: distToAABB(bp, ap, a.size) < b.size.x  // aabb vs sphere
	}
}

function distToAABB (pt: Vector3, aabbPos: Vector3, aabbSize: Vector3) {
	const sqDist = axisDistSq(pt.x, aabbPos.x - aabbSize.x / 2, aabbPos.x + aabbSize.x / 2)
		+ axisDistSq(pt.y, aabbPos.y - aabbSize.y / 2, aabbPos.y + aabbSize.y / 2)
		+ axisDistSq(pt.z, aabbPos.z - aabbSize.z / 2, aabbPos.z + aabbSize.z / 2)
	return Math.sqrt(sqDist)
}

function axisDistSq (a: number, min: number, max: number): number {
	const val = a < min ? min - a
		: a > max ? a - max
		: 0
	return val * val
}
