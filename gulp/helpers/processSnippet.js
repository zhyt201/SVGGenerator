var fs = require('fs'),
    nameCvt = require('../helpers/directiveNameConvert.js');

module.exports = function(tplname, opts) {
    'use strict';
    var snippetsPath = process.cwd() + '/gulp/snippets/';
    var tplpath = snippetsPath + tplname;
    return fs.readFileSync(tplpath, {
            encoding: 'utf-8'
        })
        .replace(/\{\{name\}\}/g, nameCvt.camelCased(opts.name)) //camel cased used for function name
        .replace(/\{\{Name\}\}/g, nameCvt.pascalCased(opts.name)) //pascal cased for directive literal partial
        .replace(/\{\{dName\}\}/g, opts.name); //- separated use for html page and test markup
};
