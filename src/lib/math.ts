// Math utils

export const PI2: number = Math.PI * 2.0

export function sign (n: number) {
	return (n > 0 ? 1 : n < 0 ? -1 : 0)
}

export function roundFrac (n: number, places: number) {
	const d = Math.pow(10, places)
	return Math.round((n + 0.000000001) * d) / d
}

export function clamp (n: number, min: number, max: number) {
	return Math.min(Math.max(n, min), max)
}

/**  Always positive modulus */
export function pmod (n: number, m: number) {
	return ((n % m + m) % m)
}

/** A random number from -1.0 to 1.0 */
export function nrand() {
	return Math.random() * 2.0 - 1.0
}

export function angle (x: number, y: number) {
	return pmod(Math.atan2(y, x), PI2)
}

export function difAngle (a0: number, a1: number) {
	const r = pmod(a1, PI2) - pmod(a0, PI2)
	return Math.abs(r) < Math.PI ? r : r - PI2 * sign(r)
}

export function dot (x0: number, y0: number, x1: number, y1: number) : number {
	return (x0 * x1 + y0 * y1)
}

/**
 * Linear interplation from x to y.
 * a must be from 0.0 to 1.0
 */
export function lerp (x: number, y: number, a: number): number {
	const b = 1.0 - a
	return (x * b + y * a)
}

export function lerpAngle (x: number, y: number, a: number): number {
	const d = difAngle(x, y)
	return pmod(x + d * a, PI2)
}

/**
 * Trigonometric interpolation from x to y (smoothed at endpoints.)
 * a must be from 0.0 to 1.0
 */
export function terp (x: number, y: number, a: number): number {
	const r = Math.PI * a
	const s = (1.0 - Math.cos(r)) * 0.5
	const t = 1.0 - s
	return (x * t + y * s)
}

/**
 * Exponential interpolation
 * @param x Start value
 * @param y End value
 * @param a Amount (0-1)
 * @param e Exponent
 */
export function xerp (x: number, y: number, a: number, e: number): number {
	let s: number
	if (a < 0.5) {
		s = Math.pow(a * 2.0, e) / 2.0
	} else {
		s = 1.0 - (a - 0.5) * 2.0
		s = Math.pow(s, e) / 2.0
		s = 1.0 - s
	}
	return lerp (x, y, s)
}
