// Loader that provides a dictionary of named assets

import m from 'mithril'
import stream from 'mithril/stream'
import {Stream} from 'mithril/stream'
import {BufferGeometry, Texture, BufferGeometryLoader, TextureLoader} from 'three'
import D from 'pojod'

export interface Assets {
	texts: {[id: string]: string}
	datas: {[id: string]: any}
	images: {[id: string]: HTMLImageElement}
	geometries: {[id: string]: BufferGeometry}
	textures: {[id: string]: Texture}
	//sounds: {[id: string]: Howler.Howl}
}

export interface AssetDescription {
	name: string
	url: string
}

export interface AssetList {
	texts?: AssetDescription[]
	datas?: AssetDescription[]
	geometries?: AssetDescription[]
	images?: AssetDescription[]
	textures?: AssetDescription[]
	//sounds?: AssetDescription[]
}

interface LoadResult {
	promise: Promise<Assets>
	progress: Stream<number>
}

/**
 * Returns an object that contains a promise that resolves with loaded assets
 * and a stream containing the current loading progress as a value from 0..1
 */
export function loadAssets (assetList: AssetList): LoadResult {
	const assets: Assets = {
		texts: Object.create(null),
		datas: Object.create(null),
		images: Object.create(null),
		geometries: Object.create(null),
		textures: Object.create(null)
	}

	const loadFns: Record<keyof Assets, (url: string) => Promise<any>> = {
		texts: loadText,
		datas: loadJSON,
		images: loadImage,
		geometries: loadGeometry,
		textures: loadTexture
	}

	const keys = D.keys(assets)
	const progress = stream(0)
	// Count total number of assets to load
	const totalToLoad = keys.reduce((total, k) => {
		if (assetList[k]) {
			total += assetList[k]!.length
		}
		return total
	}, 0)

	let totalLoaded = 0

	const promises = keys.reduce((ps, k) => {
		if (!assetList[k]) return ps
		return ps.concat(
			assetList[k]!.map(
				ad => loadFns[k](ad.url).then(resource => {
					assets[k][ad.name] = resource
					totalLoaded += 1
					progress(totalLoaded / totalToLoad)
					return resource
				})
			)
		)
	}, [] as Promise<any>[])

	return {
		promise: Promise.all(promises).then(() => assets),
		progress
	}
}

function loadText (url: string): Promise<string> {
	return m.request({
		url,
		extract: xhr => xhr.responseText,
		background: true
	})
}

function loadJSON<T> (url: string): Promise<T> {
	return m.request<T>({url, background: true})
}

function loadImage (url: string): Promise<HTMLImageElement> {
	return new Promise((resolve, reject) => {
		const image = new Image()
		image.onload = () => {resolve(image)}
		image.onerror = e => {reject(e)}
		image.src = url
	})
}

function loadTexture (url: string): Promise<Texture> {
	return new Promise((resolve, reject) => {
		const loader = new TextureLoader()
		loader.load(
			url,
			texture => {
				resolve(texture)
			},
			undefined,
			e => {
				reject(e.message ? e : new Error('Failed to load texture: ' + url))
			}
		)
	})
}

function loadGeometry (url: string) {
	return new Promise<BufferGeometry>((resolve, reject) => {
		const loader = new BufferGeometryLoader()
		loader.load(url, resolve, undefined,
			(xhr: XMLHttpRequest) => {
				reject(new Error(`Failed to load '${url}' (${xhr.status})`))
			}
		)
	})
}
