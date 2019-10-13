// DOM utils

/** Finds a CSS Rule by name */
export function getCssRule (sel: string): CSSStyleRule | undefined {
	const sheet = window.document.styleSheets[0] as CSSStyleSheet
	const rules = sheet.cssRules || sheet.rules
	for (let i = 0, n = rules.length; i < n; ++i) {
		const rule = rules[i] as CSSStyleRule
		if (rule.selectorText === sel) return rule
	}
	return undefined
}

/**
 * Eg: setStyle('.title', 'fontSize', '24px');
 */
export function setCssStyle (sel: string, style: string, val: string) {
	const rule = getCssRule(sel)
	if (rule != null) {
		(rule.style as any)[style] = val
	}
}

/**
 * Ensures this DOM element is rendered and ready so that CSS animations can be applied.
 */
export function readyDom (dom: Element) {
	// Reading from the DOM element ensures it is rendered.
	const temp = dom.getBoundingClientRect() /* tslint:disable-line no-unused-variable */
}
