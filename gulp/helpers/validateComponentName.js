var grunt = require('grunt');
module.exports = function(name) {
    'use strict';
    var componentsFolder = grunt.config.get('componentsFolder'),
        com = grunt.file.expand({
            filter: 'isDirectory'
        }, componentsFolder + '/' + name);
    if (com.length === 0) {
        grunt.fail.fatal(name + ' is not a valid component.');
    }
    return true;
};
