import m from 'mithril'
import App from './components/App'

// Application entry point

m.mount(document.querySelector('.game-container')!, App)

///////////////////////////////////////////////////////////
// For browserify-hmr
// See browserify-hmr module.hot API docs for hooks docs.
// declare const module: any // tslint:disable-line no-reserved-keywords
// if (module.hot) {
// 	module.hot.accept()
// 	module.hot.dispose((data: any) => {
// 		m.redraw()
// 	})
// }
