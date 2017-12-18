module.exports = ctx => ({
	// Include source maps in dev builds
	map: ctx.env === 'production' ? false : {inline: true},
	plugins: {
		'postcss-import': {},
		'postcss-custom-properties': {},
		'postcss-nesting': {},
		'autoprefixer': {
			browsers: ['last 2 versions', 'ie >= 10', 'iOS >= 8'],
			grid: true
		},
		// Minify prod builds
		'postcss-clean': ctx.env === 'production' ? {} : false
	}
})
