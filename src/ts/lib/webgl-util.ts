// WebGL util funcs

export function detectWebGL() {
	try {
		const canvas = document.createElement('canvas')
		return !!canvas.getContext('webgl')
			|| !!canvas.getContext('experimental-webgl')
	}
	catch (e) {
		return null
	}
}
