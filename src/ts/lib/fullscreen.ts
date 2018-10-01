// Fullscreen API helpers

declare global {
	interface Document {
		fullscreenElement?: Element
		mozFullScreenElement?: Element
		msFullscreenElement?: Element
		webkitFullscreenElement?: Element
		mozCancelFullScreen?(): void
		msExitFullscreen?(): void
		webkitExitFullscreen?(): void
		msRequestFullscreen?(): void
		mozRequestFullScreen?(): void
	}
	interface Element {
		msRequestFullscreen?(): void
		mozRequestFullScreen?(): void
		webkitRequestFullscreen?(): void
	}
}

export function toggle(el: HTMLElement) {
	if (!is()) {
		if (el.requestFullscreen) {
			el.requestFullscreen()
		} else if (el.msRequestFullscreen) {
			el.msRequestFullscreen()
		} else if (el.mozRequestFullScreen) {
			el.mozRequestFullScreen()
		} else if (el.webkitRequestFullscreen) {
			el.webkitRequestFullscreen()
		}
	} else {
		if (document.exitFullscreen) {
			document.exitFullscreen()
		} else if (document.msExitFullscreen) {
			document.msExitFullscreen()
		} else if (document.mozCancelFullScreen) {
			document.mozCancelFullScreen()
		} else if (document.webkitExitFullscreen) {
			document.webkitExitFullscreen()
		}
	}
}

export function is() {
	return !!document.fullscreenElement || !!document.mozFullScreenElement ||
		!!document.webkitFullscreenElement || !!document.msFullscreenElement
}
