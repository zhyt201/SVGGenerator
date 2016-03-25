'use strict';
var gulp = require('gulp');
var plugins = require('gulp-load-plugins')();
var fs = require('fs');
var processTpl = require('./gulp/helpers/processSnippet.js');

gulp.task('clean', function () {
	return gulp.src('build').pipe(plugins.clean({
			force : true
		}));
});

gulp.task('build', ['clean'], function () {
	return gulp.src('src/js/plotter.js')
	.pipe(plugins.webpack(require('./webpack.config.js')))
	.pipe(gulp.dest('build/'))
});

gulp.task('preview', function () {
	if (!fs.existsSync('src/index.html')) {
		var html = processTpl('indexPreview.snippet', {
				name : 'svg-generator'
			});
		fs.writeFileSync('src/index.html', html);
	}
	gulp.src('src/index.html')
	.pipe(plugins.inject(gulp.src('./bower.json')
			.pipe(plugins.mainBowerFiles({
					heckExistence : true,
					paths : {
						bowerDirectory : 'bower_components',
						bowerrc : './bowerrc',
						bowerJson : './bower.json'
					}
				})), {
			starttag : '<!-- bower:js -->',
			endtag : '<!-- endbower -->'
		}))
	.pipe(gulp.dest('.temp/'));
	gulp.src('./bower.json')
});
