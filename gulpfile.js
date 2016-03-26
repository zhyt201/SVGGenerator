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
	.pipe(gulp.dest('tmp/'));
};

gulp.task('clean', function () {
	return gulp.src(['build', 'tmp']).pipe(plugins.clean({
			force : true,
			read : false
		}));
});

gulp.task('build', ['clean'], function () {
	return gulp.src('src/index.js')
	.pipe(plugins.webpack(require('./webpack.config.js')))
	.pipe(gulp.dest('build/'))
});

gulp.task('copy', ['build'], function () {
	return gulp.src(['./bower_components/**/*', './build/**/*', './test/mock/*'], {
		base : '.'
	})
	.pipe(gulp.dest('tmp/'));
});


gulp.task('inject', ['copy'], function () {
	if (!fs.existsSync('src/index.html')) {
		var html = processTpl('indexPreview.snippet', {
				name : 'svg-generator'
			});
		fs.writeFileSync('src/index.html', html);
	}

	return inject();
});

gulp.task('open', ['connect'], function () {
	return gulp.src(__filename)
	.pipe(plugins.open({
			uri : 'http://localhost:1234/index.html'
		}));
});

gulp.task('connect', ['inject'], function (cb) {
	plugins.connect.server({
		root : 'tmp',
		port : 1234,
		livereload : true
	});
	cb();
});

gulp.task('reload', ['inject'], function () {
	return gulp.src('tmp/**/*.*')
	.pipe(plugins.connect.reload());
});

gulp.task('watch', function () {
	gulp.watch('src/**/*.*', ['reload']);
});

gulp.task('preview', ['open', 'watch']);
