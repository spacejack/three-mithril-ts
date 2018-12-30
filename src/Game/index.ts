import stream, {Stream} from 'mithril/stream'
import * as THREE from 'three'
import * as config from './config'
import {Assets} from '../lib/loader'
import * as input from '../lib/input'
import GameScene from './GameScene'
import GameEvent from './GameEvent'
import GameObject from './GameObject'
import Player, {PlayerInputs, PlayerShootEvent} from './gameobjects/Player'
import Monkey from './gameobjects/Monkey'
import Bullet from './gameobjects/Bullet'
import Building from './gameobjects/Building'
import Spark from './gameobjects/Spark'

/** Max milliseconds per frame */
const MAX_STEP = 100

/** Game public interface */
interface Game {
	/** Current score */
	score: Stream<number>
	/** Current level */
	level: Stream<number>
	/** Current level time */
	time: Stream<number>
	/** Start the game and render loop */
	run(): void
	/** Call when canvas resized */
	resize(width: number, height: number): void
	/** Call to cleanup resources */
	destroy(): void
}

/**
 * Game is implemented as a closure rather than a class because it
 * requires less boilerplate and is easier to work with callbacks.
 * There is only one instance so class prototype optimizations and
 * inheritance/polymorphism aren't really needed.
 */
function Game (canvas: HTMLCanvasElement, assets: Assets): Game {
	const scene = GameScene(canvas, assets, {antialias: true})
	const score = stream(0)
	const time = stream(0)
	const level = stream(0)
	let prevT = 0
	let running = false

	// Inputs
	const playerInputs = PlayerInputs()
	input.createInput('forward', [38, 87])
	input.createInput('back', [40, 83])
	input.createInput('left', [37, 65])
	input.createInput('right', [39, 68])
	input.createInput('fire', [16, 17, 32])

	// Private methods

	// Game objects
	let player: Player | undefined
	const monkeys: Monkey[] = []
	const buildings: Building[] = []
	const bullets: Bullet[] = []
	const sparks: Spark[] = []

	// GameObject Event handlers
	function onPlayerShoot (e: PlayerShootEvent) {
		const b = new Bullet({
			visual: scene.addBullet(e.position, e.rotation),
			position: e.position, rotation: e.rotation, onKill: onSpark,
			absVel: 30, duration: 2000
		})
		bullets.push(b)
	}

	function onMonkeyDie (e: GameEvent) {
		score(score() + 100)
		sparks.push(new Spark({
			visual: scene.addSpark(e.position),
			position: e.position,
			duration: 500
		}))
	}

	function onSpark (e: GameEvent) {
		sparks.push(new Spark({
			visual: scene.addSpark(e.position),
			position: e.position,
			duration: 500
		}))
	}

	/** Generate a bunch of buildings to fill the scene */
	function addBuildings() {
		const pos = new THREE.Vector3()
		const rot = new THREE.Euler()
		const spacing = config.buildingWidth * 2
		for (let iy = 0; iy < config.gridSize; ++iy) {
			for (let ix = 0; ix < config.gridSize; ++ix) {
				const height = config.buildingMinHeight
					+ Math.random() * (config.buildingMaxHeight - config.buildingMinHeight)
				pos.set(
					(ix - config.gridSize / 2) * spacing + config.buildingWidth,
					(iy - config.gridSize / 2) * spacing + config.buildingWidth,
					height / 2
				)
				const visual = scene.addBuilding(pos.x, pos.y, config.buildingWidth, height)
				buildings.push(new Building({
					visual, position: pos, rotation: rot,
					width: config.buildingWidth, height
				}))
			}
		}
	}

	function addMonkeys() {
		const num = 20
		const spacing = config.buildingWidth * 2
		const p = new THREE.Vector3()
		const r = new THREE.Euler()
		for (let i = 0; i < num; ++i) {
			p.set(
				Math.round(Math.random() * config.gridSize) * spacing - config.gridSize * spacing / 2,
				Math.round(Math.random() * config.gridSize) * spacing - config.gridSize * spacing / 2,
				2.0
			)
			r.z = Math.random() * Math.PI * 2.0
			const mesh = scene.addMonkey(p, r)
			monkeys.push(new Monkey({
				visual: mesh, position: p, rotation: r, onKill: onMonkeyDie
			}))
		}
	}

	function initWorld() {
		addBuildings()
	}

	/**
	 * Initialize level
	 */
	function initLevel (lvl: number) {
		level(lvl)
		addMonkeys()
		player = new Player({
			visual: scene.getCamera(),
			position: config.playerStartPos,
			rotation: config.playerStartRot,
			onShoot: onPlayerShoot
		})
	}

	/**
	 * Game loop.
	 * Compute delta time, perform some sanity checks.
	 * Dispatch updates and render.
	 */
	function doFrame() {
		if (!running) return
		const t = Date.now()
		let dt = t - prevT
		if (dt > 0) {
			if (dt > MAX_STEP) {
				prevT += dt - MAX_STEP
				dt = MAX_STEP
			}
			update(dt)
			render()
		}
		prevT = t
		requestAnimationFrame(doFrame)
	}

	/**
	 * Update logic. Assumes sanitized delta time.
	 */
	function update (dt: number) {
		time(time() + dt)
		input.getKeys(playerInputs)
		if (player != null) {
			player.setInputs(playerInputs)
			player.update(dt)
			GameObject.testHitList(player, buildings, onPlayerHitBuilding)
		}
		GameObject.updateList(monkeys, dt, onRemoveObject)
		GameObject.updateList(bullets, dt, onRemoveObject)
		GameObject.updateList(sparks, dt, onRemoveObject)

		GameObject.testHitLists(bullets, monkeys, onBulletHitMonkey)
		GameObject.testHitLists(bullets, buildings, onBulletHitBuilding)
	}

	function onPlayerHitBuilding (b: Building) {
		if (!player) return
		const minDist = b.collider!.size.x / 2 + player.collider!.size.x
		const bp = b.position
		const pp = player.position
		const dx = Math.abs(pp.x - bp.x)
		const dy = Math.abs(pp.y - bp.y)
		if (dx > dy) {
			pp.x = pp.x < bp.x
				? bp.x - minDist
				: bp.x + minDist
		} else {
			pp.y = pp.y < bp.y
				? bp.y - minDist
				: bp.y + minDist
		}
		return true
	}

	function onBulletHitBuilding (bullet: Bullet, building: Building) {
		bullet.kill()
		return true
	}

	function onBulletHitMonkey (bullet: Bullet, monkey: Monkey) {
		bullet.kill()
		monkey.kill()
		return true
	}

	function onRemoveObject (obj: GameObject) {
		if (obj.visual) {
			scene.removeChild(obj.visual)
		}
	}

	/**
	 * Render all scene objects
	 */
	function render() {
		if (player != null) {
			player.render()
		}
		GameObject.renderList(bullets)
		GameObject.renderList(monkeys)
		GameObject.renderList(sparks)
		scene.render()
	}

	// Public methods

	/**
	 * Called to start the game
	 */
	function run() {
		if (running) {
			console.warn("Game already running")
			return
		}
		initWorld()
		initLevel(1)
		running = true
		prevT = Date.now()
		requestAnimationFrame(doFrame)
	}

	function resize (w: number, h: number) {
		scene && scene.resize(w, h)
	}

	function destroy() {
		running = false
		scene.destroy()
	}

	return {run, resize, destroy, score, time, level}
}

export default Game
