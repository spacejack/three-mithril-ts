import * as m from 'mithril'
import {Stream} from 'mithril/stream'
import observer from './observer'

export interface Attrs {
	/** Progress value from 0..1 */
	progress: Stream<number>
}

export default {
	view ({attrs: {progress}}) {
		// Uses the observer component to handle stream management
		// and granular vdom re-rendering.
		return m(observer, {
			value: progress,
			render: (progress: number) => m('.bar', {
				style: `width: ${progress * 100}%`
			}),
			view: () => m('.bar-outer')
		})
	}
} as m.Component<Attrs>
