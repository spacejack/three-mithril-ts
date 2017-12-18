import {Color, Vector3, Euler} from 'three'

export const FOV = 60.0
export const VIEW_DEPTH = 2000.0
export const FOG_COLOR = new Color(0.4, 0.733, 0.8)
export const FOG_NEAR = 10.0
export const FOG_FAR = 200.0
export const LIGHT_DIR = new Vector3(1.0, 0.5, -1.0).normalize()
export const LIGHT_COLOR = new Color(1.0, 1.0, 0.95)
export const AMBIENT_COLOR = new Color(0.25, 0.25, 0.25)

export const PLAYER_START_POS = new Vector3(0.0, 0.0, 2.0)
export const PLAYER_START_ROT = new Euler(0.0, 0.0, -Math.PI / 2.0)

export const GRID_SIZE = 10
export const BUILDING_WIDTH = 10.0
export const BUILDING_MIN_HEIGHT = 6.0
export const BUILDING_MAX_HEIGHT = 20.0
