import * as m from 'mithril'
import {Stream} from 'mithril/stream'
import loadingBar from './loading-bar'

export interface Attrs {
	progress: Stream<number>
	ready: boolean
	error?: Error
	onStart(): void
}

export default {
	view ({attrs: {progress, ready, error, onStart}}) {
		return m('.title-block',
			m('h1', 'Monkey Hunt'),
			m('p', 'Use arrow keys or WASD to move'),
			m('p', 'Space, control or shift to fire.'),
			ready
				// Show start button when loaded
				? m('.start-block',
					m('button.btn-start',
						{onclick: onStart},
						'Start'
					)
				)
				// Display loading bar until loaded
				: m('.loading',
					m('.message', error ? error.message : 'Loading'),
					m('div',
						m(loadingBar, {progress})
					)
				)
			)
	}
} as m.Component<Attrs>
