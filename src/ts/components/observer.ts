import * as m from 'mithril'
import {Stream} from 'mithril/stream'

export interface Attrs<T> {
	value: Stream<T>
	selector?: string
	view(vnode: m.Vnode<Attrs<T>>): m.Children
	render(value: T): m.Children
}

export interface State {
	value: Stream<any>
}

/**
 * This is a wrapper component that is optimized to only
 * re-render its child vdom on stream updates.
 */
export default {
	value: undefined as any,

	oncreate ({dom, attrs: {render, selector, value}}) {
		// Create a dependent stream so that we can unsubscribe
		// when this component is removed.
		this.value = value.map(v => v)
		const el = typeof selector === 'string'
			? dom.querySelector(selector)!
			: dom
		// Re-render only stream updates
		this.value.map(v => {
			m.render(el, render(v))
		})
	},

	onremove() {
		// Unsubscribe from source by ending this dependent stream
		this.value.end(true)
	},

	view (vnode) {
		return vnode.attrs.view(vnode)
	}
} as m.Comp<Attrs<any>, State>

/*
Flems example:

https://flems.io/#0=N4IgZglgNgpgziAXAbVAOwIYFsZJAOgAsAXLKEAGhAGMB7NYmBvEAXwvW10QICsEqdBk2J4A9ACoAOmhkAVQhDgACAOQB5AEZwYAJwBue1crpYADvRHKYADzMxqxFcUIxlGYsV0qAJvGq6EJowPsrBULQA7vjyrsr6PrRYyrpMfqmhmgCeygAG+hAwkbnKkdBQKTAAtKlo6cpotLpYGFBQOWUuELJoALIQLoFQqioZuhiRJlnUsDFoCm4JSZV1eiFhObm16SVlbcr07ZU1aXqlrmjKLjAy+q0Arm5wXjDYyvdmPh7w+MoKSqVyg1aMQroEAObgs7giKaVqVHzjSJwOZbU66ErbPQqbrEWhXOKJZKNPzKPxwAJBdbZPI6WCOJq5CgyEGuXRlHRkmBgDD3KBOK7464mJIWNAiEYpWgg4F+OYyLQ6Ax6ACCnm8AB45AA+ZTAGRSYh3KCPRDKADKL2wWu1zNkThg9LxugA-GbnoE0OC7YaCkUABT6EkwM0ANWDAEow8GfS9VrpAw8Q38o8pw7Q-DJWAa0BIxDIhM8Dto9IZdMoALzKMD3NCOCD0f3ADxeOBm4DG03xJPm3TUVisCN6mTKZRiMTKADCqW+7i59lWDGUHteyUibmoGEu9zg920lOCgoOl1SWFoxpHIrQRc7birt971HwLTMgcruv0EcvqWI910l31S5R2PAJXkYZQmyJCh3HVNs9SxXRoLpBxnQHIdAOA4Dx2UAARCBQnXZQoVBDBl0dFCmgOcs4EIWg+QItwEKPXRpVBYMXQNYhDUNQtQUdSsriyexaDAMinUoitJLUD1unBVROO4rjiBdMkknwABHR5dCyc1yIZBNkP0r97UUw0zSJBSlOwgAlaomMOHJ6GXK1kg+L5GDgSzfSTZ8MFffR32HEylMNLB8AQ-1HWgiLP2M0ziEHS9R3YJLj1Pc8YH9dDUtHbCAFVrz3ClAkPMAWOSFdsBy7sTRgfA0n9LxHiHZRUpSoDRz9SJA0jILMNHH8-0uIMMzqltvHwLqetG4zMOzID5vmmRJGkS4JD+OIIgwHxZIAIQwctTDFKxCC3HwVBE0TKoqoqDxgMRa13fcSpuNblBaTAoRwJczverd7nhJi8QJNxaBLZVDtFSwGDmZR1oAdTcPwZgOxZCkmf06MYXQh1+pj-W6cUcerWt63oZxTq4t7hTBpUyxFcxodBPYKm6fRaAAazqkc8wLcnQS2navQEwDfXRiDm1g9szBY8FUjgOA0KCxTBv-d7MfBstoIw-rsIWMSKPLHd1mByA6hBlZ6mIA7iOsWBvqp-qDf0s1VHwOFdCqLGjFjRTbzNGXaDl+A4F9pT8cD4OFey4KVZgX81awf03Y91RteeLJYDNXIyh8FwzQAEmASP5ZUdaAEYAAZK9YABSXJEtjhKw7FgMY-iw1VcuJO3cF2Sqk0CJqA5tPqswnuzDT5QS5DrLlA1ZRy+UFSpBAAAZWhttk-Ad9X5QzVXnDLAAQlXiM7SdzC9bia3dFt8iHeY9ELZnhWwgO5RcVoMfgJ792Dq9vcbGqhZqXziiFBKllG6GkWjmSQyhegYG6O4MwZgGbHSXLzOs-MUFoKrDrKaMdMJd3Vm7Pyk8L79R7oQcuU9V69ByCqVBZ9KHj39H3L02tX6K3PtVbhc9tRViXgAMmEaQihP8e6aCAXiNAo8OqXx1pfYCxAhLJlUNIzw9B5HKMwvQGYEBh7ulvsQVhl92q6NaiAWyzwDpcRAD-UBmEnHKFAbAno2EAAStAoChG4c5WcyDSLXRkP4qsYVrpZTgROc0EAsB8lnBw8EgIXBzmsiqAAYsoCItAzAyBrHWYgDZLiCw3rkueOt+H8KHAAamUJXfA1cACsoCICiX9NU+ei8iHAVSJpeAxAVRoDiR4YpGTxg4HYZvHwZSzBuLtpyJRY4JxHxJvsMYExzhMGydMkIqUwobO6m4rMOYClk0uLY3QxAKmXn4ZXUBfTHjPCGSMop9BxlcCmdtWZxklrXhMVEjxE5eh0SXMKchMgwpnlrNcxI1B7gO3dhmLI0FyHGTYBwEAmAcB4HwNQBWlAaD0EYMwHg+ByF9WrMSqoPIsDQCyO6LccAqhKjaQAbhOT0fASSB5Dw5kFP5-9Pbe3LDrXO+dlAACZK4wCwByoCrgIDghIGacusr5Wjk0E0dIZoADEABOQ1i8zA2GXD4-C8rBUe0peKwgZpK61w1coRVyriCquro6y8cJh5y1BT4KodAIi6D1QAZknJXS1Mg2AAF0qBQG6BzBAKBOA4p4HSwY0BCV-nIDwEgxAzBtnHLWMwHNwR4qSGIdNhAhgAAFy74HrQANkrQMat0B8D8EJao+weBO3sBTdwEA10s26BzSAPNBbEBFrQCWstpgW0ZqgHWht+Bm3XTEMOqg3bB19ujawIAA
*/
