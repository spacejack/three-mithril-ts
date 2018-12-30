import m from 'mithril'
import stream from 'mithril/stream'
import * as config from '../../config'
import * as state from '../../state'
import {loadAssets} from '../../lib/loader'
import Game from '../../Game'
import TitleBlock from '../TitleBlock'
import Hud from '../Hud'

/**
 * Root application component.
 * This component renders the DOM and initializes the game engine.
 */
export default function App(): m.Component {
	// This is a FactoryComponent - state is maintaned within a closure.
	// Executes when component instance is instantiated.

	// Start loading game assets...
	const progress = stream<number>()
	const promise = loadAssets({
		geometries: [
			{name: 'monkey', url: 'data/mesh/monkey.json'},
			{name: 'bullet', url: 'data/mesh/bullet.json'}
		],
		textures: [
			{name: 'ground', url: 'data/tex/ground.jpg'},
			{name: 'bricks', url: 'data/tex/bricks.jpg'}
		]
	}, progress)

	let container: HTMLElement | undefined
	let canvas: HTMLCanvasElement | undefined
	let game: Game | undefined
	let started = false
	let loadError: Error | undefined

	function start() {
		if (!game || started) return
		game.run()
		started = true
	}

	function resize() {
		if (!canvas) return
		const {width, height} = canvas.getBoundingClientRect()
		// Recompute pixels-per-em
		state.fontSize(config.defaultFontSize * height / config.defaultAppHeight)
		if (game) {
			// Must resize 3D renderer
			game.resize(width, height)
		}
		m.redraw()
	}

	// Return component hooks
	return {
		oncreate ({dom}) {
			container = dom as HTMLElement
			canvas = container.querySelector('canvas.app-canvas') as HTMLCanvasElement
			window.addEventListener('resize', resize)
			resize()
			promise.then(assets => {
				// Loaded. Show 100% progress bar for a moment before continuing.
				setTimeout(() => {
					game = Game(canvas!, assets)
					resize()
				}, 100)
			}).catch(err => {
				loadError = err
				progress.end(true)
				m.redraw()
			})
		},

		onremove() {
			window.removeEventListener('resize', resize)
			if (game) {
				// Game uses assets that must be excplicitly freed
				game.destroy()
				container = canvas = game = undefined
			}
		},

		view() {
			return m('.app',
				m('canvas.app-canvas'),
				m('.ui',
					{style: 'font-size: ' + state.fontSize() + 'px'},
					!started
						// Show title block until user clicks start
						? m(TitleBlock, {
							progress,
							ready: !!game,
							error: loadError,
							onStart: start
						})
						// Show HUD when game started
						: !!game && m(Hud, {
							score: game.score,
							time: game.time,
							level: game.level
						})
				)
			)
		}
	}
}
