import m from 'mithril'
import {Stream} from 'mithril/stream'
import {formatTime} from '../lib/string'
import * as fullscreen from '../lib/fullscreen'
//import {isWidescreen} from '../state'
import observer from './observer'
import * as svgs from './svgs'

export interface Attrs {
	score: Stream<number>
	time: Stream<number>
	level: Stream<number>
}

export default {
	view ({attrs: {score, time, level}}) {
		return m('.hud',
			m('.score-block',
				// Use 'observer' components for frequently-updating values
				m(observer, {
					value: score,
					render: (s: number) => String(s),
					view: () => m('.score')
				}),
				m(observer, {
					value: time,
					render: (t: number) => formatTime(t),
					view: () => m('.time')
				}),
				m(observer, {
					value: level,
					render: (l: number) => String(l),
					view: () => m('.level')
				})
			),
			m('.control-block',
				/* !fullscreen.is() && m('.widescreen',
					m('button',
						{
							type: 'button',
							onclick() {
								isWidescreen(!isWidescreen())
							}
						},
						isWidescreen() ?
							svgs.widescreenOff() : svgs.widescreenOn()
					)
				), */
				m('.fullscreen',
					m('button',
						{
							type: 'button',
							onclick() {
								fullscreen.toggle(
									document.querySelector('.app') as HTMLElement
								)
							}
						},
						fullscreen.is() ?
							svgs.fullscreenOff() : svgs.fullscreenOn()
					)
				)
			)
		)
	}
} as m.Component<Attrs>
