import stream, {Stream} from 'mithril/stream'
import {Vector3, Euler} from 'three'
import {
	PLAYER_START_POS, PLAYER_START_ROT, GRID_SIZE,
	BUILDING_WIDTH, BUILDING_MIN_HEIGHT, BUILDING_MAX_HEIGHT
} from './config'
import {Assets} from '../lib/loader'
import * as input from '../lib/input'
import {createScene} from './scene'
import GameObject from './gameobject'
import Player, {createPlayerInputs, PlayerActions} from './gameobjects/player'
import Monkey, {MonkeyActions} from './gameobjects/monkey'
import Bullet, {BulletActions} from './gameobjects/bullet'
import Building from './gameobjects/building'
import Spark from './gameobjects/spark'

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
	const scene = createScene(canvas, assets, {antialias: true})
	const score = stream(0)
	const time = stream(0)
	const level = stream(0)
	let prevT = 0
	let running = false

	// Inputs
	const playerInputs = createPlayerInputs()
	input.createInput('forward', [38, 87])
	input.createInput('back', [40, 83])
	input.createInput('left', [37, 65])
	input.createInput('right', [39, 68])
	input.createInput('fire', [16, 17, 32])

	// Game objects
	let player: Player | undefined
	const monkeys: Monkey[] = []
	const buildings: Building[] = []
	const bullets: Bullet[] = []
	const sparks: Spark[] = []

	// Actions
	const playerActions: PlayerActions = {
		shoot (position: Vector3, rotation: Euler) {
			const b = new Bullet(
				scene.addBullet(position, rotation),
				position, rotation, bulletActions, 25, 2000
			)
			bullets.push(b)
		}
	}
	const monkeyActions: MonkeyActions = {
		die (position: Vector3) {
			score(score() + 100)
			const s = new Spark(
				scene.addSpark(position),
				position, undefined, 500
			)
			sparks.push(s)
		}
	}
	const bulletActions: BulletActions = {
		spark (position: Vector3) {
			const s = new Spark(
				scene.addSpark(position),
				position, undefined, 500
			)
			sparks.push(s)
		}
	}

	// Private methods

	function addBuildings() {
		const pos = new Vector3()
		const rot = new Euler()
		const spacing = BUILDING_WIDTH * 2
		for (let iy = 0; iy < GRID_SIZE; ++iy) {
			for (let ix = 0; ix < GRID_SIZE; ++ix) {
				const height = BUILDING_MIN_HEIGHT
					+ Math.random() * (BUILDING_MAX_HEIGHT - BUILDING_MIN_HEIGHT)
				pos.set(
					(ix - GRID_SIZE / 2) * spacing + BUILDING_WIDTH,
					(iy - GRID_SIZE / 2) * spacing + BUILDING_WIDTH,
					height / 2
				)
				const visual = scene.addBuilding(pos.x, pos.y, BUILDING_WIDTH, height)
				buildings.push(new Building(visual, pos, rot, BUILDING_WIDTH, height))
			}
		}
	}

	function addMonkeys() {
		const num = 20
		const spacing = BUILDING_WIDTH * 2
		const p = new Vector3()
		const r = new Euler()
		for (let i = 0; i < num; ++i) {
			p.set(
				Math.round(Math.random() * GRID_SIZE) * spacing - GRID_SIZE * spacing / 2,
				Math.round(Math.random() * GRID_SIZE) * spacing - GRID_SIZE * spacing / 2,
				2.0
			)
			r.z = Math.random() * Math.PI * 2.0
			const mesh = scene.addMonkey(p, r)
			const monkey = new Monkey(mesh, p, r, monkeyActions)
			monkeys.push(monkey)
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
		player = new Player(
			scene.getCamera(), PLAYER_START_POS, PLAYER_START_ROT,
			playerActions
		)
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
