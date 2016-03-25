var mainBowerFiles = require('main-bower-files');
module.exports = function(root, workingdir, bowerrcPath, includeSelf, includeDev) {
    'use strict';
    var deps = mainBowerFiles({
        includeSelf: !!includeSelf,
        includeDev: !!includeDev,
        debugging: false,
        checkExistence: true,
        filter: /.*\.(js|css)/,
        main: 'main',
        paths: {
            bowerDirectory: root + '/bower_components',
            bowerrc: bowerrcPath || root + '.bowerrc',
            bowerJson: workingdir + '/bower.json',
        }
    });
    return deps;
};
