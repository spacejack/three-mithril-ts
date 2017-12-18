// DOM utils

/** The transform style prefix used by this browser (if any) */
export const transformStylePrefix = (function(){
	function getAttrLc (el: Element, attr: string) {
		const s = el.getAttribute(attr)
		return (!!s && typeof s === 'string') ? s.toLowerCase() : ''
	}
	const t = 'translate3d(100px,20px,0px)' // the transform we'll use to test
	const el = window.document.createElement('div') // Make a test element

	//  Check support for current standard first
	el.style.transform = t
	let style = getAttrLc(el, 'style')
	if (style.indexOf('transform') === 0) return '' // current - done

	//  Try beta/prefixed names...
	el.style['MozTransform'] = t // firefox
	el.style['webkitTransform'] = t // webkit/chrome
	el.style['msTransform'] = t // IE
	style = getAttrLc(el, 'style')

	if (style.indexOf('moz') >= 0) return 'moz'
	if (style.indexOf('webkit') >= 0) return 'webkit'
	if (style.indexOf('ms') >= 0) return 'ms'
	console.warn('3D transform styles may not be supported by this browser')
	return ''
}())

export const transformStyleName = transformStylePrefix.length > 0
	? '-' + transformStylePrefix + '-transform'
	: 'transform'

export function getCssRule (sel: string) {
	const rules = window.document.styleSheets[0]['cssRules'] || document.styleSheets[0]['rules']
	for (let i = 0, n = rules.length; i < n; ++i) {
		if (rules[i].selectorText === sel) return rules[i]
	}
	return null
}

/**
 * Eg: setStyle('.title', 'fontSize', '24px');
 */
export function setCssStyle (sel: string, style: string, val: string) {
	const rule = getCssRule(sel)
	if (!rule) return
	rule.style[style] = val
}

/**
 * Ensures this DOM element is rendered and ready so that CSS animations can be applied.
 */
export function readyDom (dom: Element) {
	// Assign value to a variable for side-effects.
	// Reading from the DOM element ensures it is rendered.
	let temp = (dom as HTMLElement).offsetHeight /* tslint:disable-line no-unused-variable */
}
