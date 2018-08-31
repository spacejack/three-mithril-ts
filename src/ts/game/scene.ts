import {
	Vector3, Euler, Object3D, Scene as THREEScene, WebGLRenderer,
	PerspectiveCamera, DirectionalLight, AmbientLight, Fog, RepeatWrapping,
	PlaneBufferGeometry, BoxBufferGeometry, SphereBufferGeometry,
	MeshBasicMaterial, MeshLambertMaterial,
	Mesh
} from 'three'
import {Assets} from '../lib/loader'
import {
	FOV, VIEW_DEPTH,
	FOG_COLOR, FOG_NEAR, FOG_FAR,
	LIGHT_DIR, LIGHT_COLOR, AMBIENT_COLOR,
	PLAYER_START_POS, PLAYER_START_ROT
} from './config'

export interface Options {
	antialias?: boolean
}

/**
 * A high-level scene wrapper
 */
export interface Scene {
	setCamera (pos?: Vector3, rot?: Euler): void
	getCamera(): Object3D
	addBuilding(x: number, y: number, width: number, height: number): Object3D
	addMonkey(position: Vector3, rotation: Euler): Object3D
	addBullet(position: Vector3, rotation: Euler): Object3D
	addSpark(position: Vector3): Object3D
	removeChild(obj: Object3D): void
	render(): void
	resize (width: number, height: number): void
	destroy(): void
}

export function createScene (canvas: HTMLCanvasElement, assets: Assets, opts?: Options): Scene {
	// (could potentially create a non-webgl scene)
	return new SceneWebGL(canvas, assets, opts)
}

interface Materials {
	monkey: MeshLambertMaterial
	building: MeshLambertMaterial
	bullet: MeshBasicMaterial
	spark: MeshBasicMaterial
}

/**
 * WebGL Implementation
 */
class SceneWebGL implements Scene {
	canvas: HTMLCanvasElement
	displayWidth: number
	displayHeight: number
	renderer: WebGLRenderer
	scene: THREEScene
	camera: PerspectiveCamera
	camHolder: Object3D
	sunLight: DirectionalLight
	ambientLight: AmbientLight
	assets: Assets
	materials: Materials

	constructor (canvas: HTMLCanvasElement, assets: Assets, opts: Options = {}) {
		this.canvas = canvas
		this.assets = assets
		this.assets.geometries['monkey'].rotateX(Math.PI * 0.5)
		this.assets.geometries['bullet'].scale(0.5, 0.5, 0.5)
		this.assets.geometries['spark'] = new SphereBufferGeometry(0.25, 16, 8)
		this.assets.textures['bricks'].repeat.set(2, 2)
		this.assets.textures['bricks'].wrapS = this.assets.textures['bricks'].wrapT = RepeatWrapping
		this.materials = {
			monkey: new MeshLambertMaterial({color: 0x887755}),
			building: new MeshLambertMaterial({color: 0xFFFFFF, map: this.assets.textures['bricks']}),
			bullet: new MeshBasicMaterial({color: 0xFF6600}),
			spark: new MeshBasicMaterial({color: 0xFFCC00, opacity: 0.75, transparent: true})
		}

		// Make transparent so it isn't rendered as black for 1 frame at startup
		this.renderer = new WebGLRenderer({
			canvas, antialias: !!opts.antialias,
			clearColor: FOG_COLOR.getHex(), alpha: true, clearAlpha: 1
		})
		if (!this.renderer) {
			throw new Error("Failed to create THREE.WebGLRenderer")
		}

		const rc = canvas.getBoundingClientRect()
		this.displayWidth = rc.width
		this.displayHeight = rc.height

		this.camera = new PerspectiveCamera(
			FOV, this.displayWidth / this.displayHeight, 1.0, VIEW_DEPTH
		)

		this.scene = new THREEScene()
		this.scene.fog = new Fog(FOG_COLOR.getHex(), FOG_NEAR, FOG_FAR)

		this.sunLight = new DirectionalLight(LIGHT_COLOR.getHex(), 1.0)
		this.sunLight.position.set(-LIGHT_DIR.x, -LIGHT_DIR.y, -LIGHT_DIR.z)
		this.scene.add(this.sunLight)

		this.ambientLight = new AmbientLight(AMBIENT_COLOR.getHex())
		this.scene.add(this.ambientLight)

		// Setup the camera so Z is up.
		// Then we have cartesian X,Y coordinates along ground plane.
		this.camera.rotation.order = "ZXY"
		this.camera.rotation.x = Math.PI * 0.5
		this.camera.rotation.y = Math.PI * 0.5
		this.camera.rotation.z = Math.PI
		this.camera.up.set(0.0, 0.0, 1.0)

		// Put camera in an object so we can transform it normally
		this.camHolder = new Object3D()
		this.camHolder.rotation.order = "ZYX"
		this.camHolder.add(this.camera)
		this.camHolder.position.copy(PLAYER_START_POS)
		// (Don't use Euler.copy because it will overwrite rotation.order)
		this.camHolder.rotation.x = PLAYER_START_ROT.x
		this.camHolder.rotation.y = PLAYER_START_ROT.y
		this.camHolder.rotation.z = PLAYER_START_ROT.z

		// Add camera to scene
		this.scene.add(this.camHolder)

		this.addGround()
		//this.addBuildings()
	}

	removeChild (obj: Object3D) {
		this.scene.remove(obj)
	}

	setCamera (pos?: Vector3, rot?: Euler) {
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
		tex.wrapS = tex.wrapT = RepeatWrapping
		tex.repeat.x = 100.0
		tex.repeat.y = 100.0
		const plane = new Mesh(
			new PlaneBufferGeometry(1000.0, 1000.0),
			new MeshLambertMaterial({color: 0x999999, map: tex})
		)
		this.scene.add(plane)
	}

	addBuilding (x: number, y: number, width: number, height: number) {
		const segs = Math.max(Math.round(height / width), 1)
		const b = new Mesh(
			new BoxBufferGeometry(
				width, height, width, 1, segs, 1
			).rotateX(Math.PI * 0.5),
			this.materials.building
		)
		b.position.set(x, y, height / 2)
		this.scene.add(b)
		return b
	}

	addMonkey (pos: Vector3, rot: Euler) {
		const mesh = new Mesh(
			this.assets.geometries['monkey'],
			this.materials.monkey
		)
		mesh.position.copy(pos)
		mesh.rotation.copy(rot)
		this.scene.add(mesh)
		return mesh
	}

	addBullet (pos: Vector3, rot: Euler) {
		const mesh = new Mesh(
			this.assets.geometries['bullet'],
			this.materials.bullet
		)
		mesh.position.copy(pos)
		mesh.rotation.copy(rot)
		this.scene.add(mesh)
		return mesh
	}

	addSpark (pos: Vector3) {
		const mesh = new Mesh(
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
