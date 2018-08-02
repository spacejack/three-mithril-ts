// Shared global app states

import stream from 'mithril/stream'
import {DEFAULT_FONT_SIZE} from '../config'

/** Dynamic font size for game UI matches container size */
export const fontSize = stream(DEFAULT_FONT_SIZE)

/** Pixel scaling */
export const pixelScale = fontSize.map(fsz => fsz / DEFAULT_FONT_SIZE)

/** Widescreen flag */
export const isWidescreen = stream(false)
