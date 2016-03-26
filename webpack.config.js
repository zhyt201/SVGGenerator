module.exports = {
	output : {
		filename : 'svg-generator.js',
		libraryTarget : "umd",
		umdNamedDefine : true
	},
	devtool: 'source-map',
	stats : {
		colors : true,
		modules : true,
		reasons : true
	},
	module : {},
	externals : {
		d3 : 'd3',
		lodash : '_'
	}
};
