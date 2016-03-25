var grunt = require('grunt');
module.exports = function(cb) {
    'use strict';
    var componentsFolder = grunt.config.get('componentsFolder');
    var comlist = grunt.file.expand({
        cwd: componentsFolder,
        filter: 'isDirectory'
    }, '*');

    comlist.forEach(cb);
    return comlist;
};
