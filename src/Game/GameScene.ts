import * as THREE from 'three'
import {Assets} from '../lib/loader'
import * as config from './config'

export interface GameSceneOptions {
	antialias?: boolean
}

/**
 * A high-level scene wrapper
 */
interface GameScene {
	setCamera (pos?: THREE.Vector3, rot?: THREE.Euler): void
	getCamera(): THREE.Object3D
	addBuilding(x: number, y: number, width: number, height: number): THREE.Object3D
	addMonkey(position: THREE.Vector3, rotation: THREE.Euler): THREE.Object3D
	addBullet(position: THREE.Vector3, rotation: THREE.Euler): THREE.Object3D
	addSpark(position: THREE.Vector3): THREE.Object3D
	removeChild(obj: THREE.Object3D): void
	render(): void
	resize (width: number, height: number): void
	destroy(): void
}

/** Creates a game Scene instance */
function GameScene (canvas: HTMLCanvasElement, assets: Assets, opts?: GameSceneOptions): GameScene {
	// (could potentially create a non-webgl scene)
	return new GameSceneWebGL(canvas, assets, opts)
}

export default GameScene

interface Materials {
	monkey: THREE.MeshLambertMaterial
	building: THREE.MeshLambertMaterial
	bullet: THREE.MeshBasicMaterial
	spark: THREE.MeshBasicMaterial
}

/**
 * WebGL Implementation
 */
class GameSceneWebGL implements GameScene {
	canvas: HTMLCanvasElement
	displayWidth: number
	displayHeight: number
	renderer: THREE.WebGLRenderer
	scene: THREE.Scene
	camera: THREE.PerspectiveCamera
	camHolder: THREE.Object3D
	sunLight: THREE.DirectionalLight
	ambientLight: THREE.AmbientLight
	assets: Assets
	materials: Materials

	constructor (canvas: HTMLCanvasElement, assets: Assets, opts: GameSceneOptions = {}) {
		this.canvas = canvas
		this.assets = assets
		this.assets.geometries.monkey.rotateX(Math.PI * 0.5)
		this.assets.geometries.bullet.scale(0.5, 0.5, 0.5)
		this.assets.geometries.spark = new THREE.SphereBufferGeometry(0.25, 16, 8)
		this.assets.textures.bricks.repeat.set(2, 2)
		this.assets.textures.bricks.wrapS = this.assets.textures.bricks.wrapT = THREE.RepeatWrapping
		this.materials = {
			monkey: new THREE.MeshLambertMaterial({color: 0x887755}),
			building: new THREE.MeshLambertMaterial({color: 0xFFFFFF, map: this.assets.textures['bricks']}),
			bullet: new THREE.MeshBasicMaterial({color: 0xFF6600}),
			spark: new THREE.MeshBasicMaterial({color: 0xFFCC00, opacity: 0.75, transparent: true})
		}

		// Make transparent so it isn't rendered as black for 1 frame at startup
		this.renderer = new THREE.WebGLRenderer({
			canvas, antialias: !!opts.antialias,
			clearColor: config.fogColor.getHex(), alpha: true, clearAlpha: 1
		})
		if (!this.renderer) {
			throw new Error("Failed to create THREE.WebGLRenderer")
		}

		const rc = canvas.getBoundingClientRect()
		this.displayWidth = rc.width
		this.displayHeight = rc.height

		this.camera = new THREE.PerspectiveCamera(
			config.fov, this.displayWidth / this.displayHeight, 1.0, config.viewDepth
		)

		this.scene = new THREE.Scene()
		this.scene.fog = new THREE.Fog(config.fogColor.getHex(), config.fogNear, config.fogFar)

		this.sunLight = new THREE.DirectionalLight(config.lightColor.getHex(), 1.0)
		this.sunLight.position.set(-config.lightDir.x, -config.lightDir.y, -config.lightDir.z)
		this.scene.add(this.sunLight)

		this.ambientLight = new THREE.AmbientLight(config.ambientColor.getHex())
		this.scene.add(this.ambientLight)

		// Setup the camera so Z is up.
		// Then we have cartesian X,Y coordinates along ground plane.
		this.camera.rotation.order = "ZXY"
		this.camera.rotation.x = Math.PI * 0.5
		this.camera.rotation.y = Math.PI * 0.5
		this.camera.rotation.z = Math.PI
		this.camera.up.set(0.0, 0.0, 1.0)

		// Put camera in an object so we can transform it normally
		this.camHolder = new THREE.Object3D()
		this.camHolder.rotation.order = "ZYX"
		this.camHolder.add(this.camera)
		this.camHolder.position.copy(config.playerStartPos)
		// (Don't use Euler.copy because it will overwrite rotation.order)
		this.camHolder.rotation.x = config.playerStartRot.x
		this.camHolder.rotation.y = config.playerStartRot.y
		this.camHolder.rotation.z = config.playerStartRot.z

		// Add camera to scene
		this.scene.add(this.camHolder)

		this.addGround()
		//this.addBuildings()
	}

	removeChild (obj: THREE.Object3D) {
		this.scene.remove(obj)
	}

	setCamera (pos?: THREE.Vector3, rot?: THREE.Euler) {
		if (pos) {
			this.camHolder.position.copy(pos)
		}
		if (rot) {
			this.camHolder.rotation.x = rot.x
			this.camHolder.rotation.y = rot.y
			this.camHolder.rotation.z = rot.z
		}
	}

	getCamera() {
		return this.camHolder
	}

	addGround() {
		const tex = this.assets.textures['ground']
		tex.wrapS = tex.wrapT = THREE.RepeatWrapping
		tex.repeat.x = 100.0
		tex.repeat.y = 100.0
		const plane = new THREE.Mesh(
			new THREE.PlaneBufferGeometry(1000.0, 1000.0),
			new THREE.MeshLambertMaterial({color: 0x999999, map: tex})
		)
		this.scene.add(plane)
	}

	addBuilding (x: number, y: number, width: number, height: number) {
		const segs = Math.max(Math.round(height / width), 1)
		const b = new THREE.Mesh(
			new THREE.BoxBufferGeometry(
				width, height, width, 1, segs, 1
			).rotateX(Math.PI * 0.5),
			this.materials.building
		)
		b.position.set(x, y, height / 2)
		this.scene.add(b)
		return b
	}

	addMonkey (pos: THREE.Vector3, rot: THREE.Euler) {
		const mesh = new THREE.Mesh(
			this.assets.geometries['monkey'],
			this.materials.monkey
		)
		mesh.position.copy(pos)
		mesh.rotation.copy(rot)
		this.scene.add(mesh)
		return mesh
	}

	addBullet (pos: THREE.Vector3, rot: THREE.Euler) {
		const mesh = new THREE.Mesh(
			this.assets.geometries['bullet'],
			this.materials.bullet
		)
		mesh.position.copy(pos)
		mesh.rotation.copy(rot)
		this.scene.add(mesh)
		return mesh
	}

	addSpark (pos: THREE.Vector3) {
		const mesh = new THREE.Mesh(
			this.assets.geometries['spark'],
			this.materials.spark.clone()
		)
		mesh.position.copy(pos)
		this.scene.add(mesh)
		return mesh
	}

	render() {
		this.renderer.render(this.scene, this.camera)
	}

	resize (w: number, h: number) {
		this.displayWidth = w
		this.displayHeight = h
		this.canvas.width = w
		this.canvas.height = h
		// Tell three.js not to set inline style w,h
		this.renderer.setSize(w, h, false)
		this.camera.aspect = w / h
		this.camera.updateProjectionMatrix()
		this.renderer.render(this.scene, this.camera)
	}

	destroy() {
		this.renderer.dispose()
	}
}
