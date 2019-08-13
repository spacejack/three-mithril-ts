import m from 'mithril'
import Stream from 'mithril/stream'
import Observer from '../Observer'

export interface Attrs {
	/** Progress value from 0..1 */
	progress: Stream<number>
}

const LoadingBar: m.Component<Attrs> = {
	view ({attrs: {progress}}) {
		// Uses the observer component to handle stream management
		// and granular vdom re-rendering.
		return m(Observer, {
			value: progress,
			render: (p: number) => m('.bar', {
				style: `width: ${p * 100}%`
			}),
			view: () => m('.loading-bar')
		})
	}
}

export default LoadingBar
