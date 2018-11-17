// Shared global app states

import stream from 'mithril/stream'
import * as config from './config'

/** Dynamic font size for game UI matches container size */
export const fontSize = stream(config.defaultFontSize)

/** Pixel scaling */
export const pixelScale = fontSize.map(fsz => fsz / config.defaultFontSize)
