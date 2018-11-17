import {Color, Vector3, Euler} from 'three'

/** Game configuration constants */

export const fov = 60.0
export const viewDepth = 2000.0
export const fogColor = new Color(0.4, 0.733, 0.8)
export const fogNear = 10.0
export const fogFar = 200.0
export const lightDir = new Vector3(1.0, 0.5, -1.0).normalize()
export const lightColor = new Color(1.0, 1.0, 0.95)
export const ambientColor = new Color(0.25, 0.25, 0.25)

export const playerStartPos = new Vector3(0.0, 0.0, 2.0)
export const playerStartRot = new Euler(0.0, 0.0, -Math.PI / 2.0)

export const gridSize = 10
export const buildingWidth = 10.0
export const buildingMinHeight = 6.0
export const buildingMaxHeight = 20.0
