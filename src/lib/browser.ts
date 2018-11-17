declare global {
	interface Navigator {
		standalone?: boolean
	}
	interface External {
		msIsSiteMode(): boolean
	}
}

/** Determine if launched from homescreen/desktop app launcher */
export const isStandalone = (function() {
	// iOS
	if (navigator.standalone !== undefined)
		return !!navigator.standalone
	// Windows Mobile
	if (window.external && window.external.msIsSiteMode)
		return !!window.external.msIsSiteMode()
	// Chrome
	return window.matchMedia('(display-mode: standalone)').matches
}())

const ua = navigator.userAgent

/** Is any Safari browser (mobile/desktop) */
export const isSafari = /^((?!chrome|android).)*safari/i.test(ua)

/** Boolean flags indicating what type of mobile browser */
export const isMobile = (function() {
	const a = /Android/i.test(ua)
	const bb = /BlackBerry/i.test(ua)
	const ios = /iPhone|iPad|iPod/i.test(ua)
	const o = /Opera Mini/i.test(ua)
	const w = /IEMobile/i.test(ua)
	const ff = /\(Mobile/i.test(ua)
	const any = (a || bb || ios || o || w || ff)
	return {
		Android: a,
		BlackBerry: bb,
		iOS: ios,
		Opera: o,
		Windows: w,
		FireFox: ff,
		any: any
	}
}())
