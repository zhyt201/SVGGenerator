var container = require("jsdom").jsdom().body;
var svggenerator = require('../../src/index').svggenerator;
var fs = require('fs');
var data = JSON.parse(fs.readFileSync('test/mock/MSFT_1D.json'));
var seriesList = [{
		'data' : data.Price.data,
		'graphType' : 'abovebelow',
		'tickerObject' : data.tickerObject,
		'spos' : data.Price.spos,
		'epos' : data.Price.epos
		//'color': getColor(i, data[i].tickerObject),
	}
];
var html = svggenerator(container, {
		width : 800,
		height : 600
	}).init(seriesList).output();
//console.log(html);
fs.writeFileSync('test/output.svg', '<?xml version="1.0"?>' + html);
