// string utils

/**
 * @param t Time in ms
 * @returns Formatted string
 */
export function formatTime (t: number) {
	const ts = Math.round(t / 1000)
	const m = Math.floor(ts / 60)
	const ss = ts % 60
	const s = (ss >= 10 ? '' : '0') + ss.toString()
	return `${m}:${s}`
}
