'use strict';
var gulp = require('gulp');
var plugins = require('gulp-load-plugins')();
var fs = require('fs');
var processTpl = require('./gulp/helpers/processSnippet.js');
var mainBowerFiles = require('main-bower-files');
var _ = require('lodash');

function getMainBowerFiles(opts, appendMaps) {
	var self = this;
	opts = _.assignIn({
			includeSelf : false,
			includeDev : false,
			debugging : false,
			checkExistence : true,
			paths : {
				bowerDirectory : 'bower_components',
				bowerrc : '.bowerrc',
				bowerJson : 'bower.json'
			}
		}, opts);

	var mainFiles = mainBowerFiles(opts);
	var results = [];
	_.each(mainFiles, function (filePath) {
		results.push(filePath);
		if (appendMaps && fs.existsSync(filePath + '.map')) {
			results.push(filePath + '.map');
		}
	});

	return results;
};

function filterFileType(files, extension) {
	var regExp = new RegExp('\\.' + extension + '$');
	return files.filter(regExp.test.bind(regExp));
};

function inject() {
	return gulp.src('src/index.html').
	pipe(plugins.inject(gulp.src(filterFileType(getMainBowerFiles({
						includeDev : true
					}), 'js'), {
				read : false
			}), {
			starttag : '<!-- bower:js -->',
			endtag : '<!-- endbower -->'
		}))
	.pipe(gulp.dest('.temp/'));
};

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

	inject();
});
