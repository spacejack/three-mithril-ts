import * as m from 'mithril'
import {DEFAULT_HEIGHT, DEFAULT_FONT_SIZE} from '../config'
import {fontSize} from '../state'
import {loadAssets} from '../lib/loader'
import createGame, {Game} from '../game'
import titleBlock from './title-block'
import hud from './hud'

/**
 * Root application component.
 * This component renders the DOM and initializes the game engine.
 */
export default (): m.Component => {
	// This is a FactoryComponent - state is maintaned within a closure.
	// Executes when component instance is instantiated.

	// Start loading game assets...
	const {promise, progress} = loadAssets({
		geometries: [
			{name: 'monkey', url: 'data/mesh/monkey.json'},
			{name: 'bullet', url: 'data/mesh/bullet.json'}
		],
		textures: [
			{name: 'ground', url: 'data/tex/ground.jpg'},
			{name: 'bricks', url: 'data/tex/bricks.jpg'}
		]
	})

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
		if (!container || !canvas || !game) return
		const {width, height} = canvas.getBoundingClientRect()
		// Recompute pixels-per-em
		fontSize(DEFAULT_FONT_SIZE * height / DEFAULT_HEIGHT)
		// Must resize 3D renderer
		game.resize(width, height)
		m.redraw()
	}

	// Return component hooks
	return {
		oncreate ({dom}) {
			promise.then(assets => {
				// Loaded. Show 100% progress bar for a moment before continuing.
				setTimeout(() => {
					container = dom as HTMLElement
					canvas = container.querySelector('canvas.app-canvas') as HTMLCanvasElement
					game = createGame(canvas, assets)
					window.addEventListener('resize', resize)
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
					{style: 'font-size: ' + fontSize() + 'px'},
					!started
						// Show title block until user clicks start
						? m(titleBlock, {
							progress,
							ready: !!game,
							error: loadError,
							onStart: start
						})
						// Show game & HUD when started
						: !!game && m(hud, {
							score: game.score,
							time: game.time,
							level: game.level
						})
				)
			)
		}
	}
}
