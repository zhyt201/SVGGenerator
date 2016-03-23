var container = require("jsdom").jsdom().body;
var plotter = require('./src/plotter');
var fs=require('fs');
var data=JSON.parse(fs.readFileSync('./IBM_1D.json'));
var seriesList = [{
	'data': data.Price.data,
	'graphType': 'line',
	'tickerObject': data.tickerObject,
	'spos': data.Price.spos,
	'epos': data.Price.epos,
	//'color': getColor(i, data[i].tickerObject),
	'linestyle': {
		'fill': 'none',
        'stroke': '#339bb6',
        'stroke-width': '2px',
	}
}];
var html = plotter(container,{
	width:800,
	height:600
}).init(seriesList).output();
//console.log(html);
fs.writeFileSync('./output.svg','<?xml version="1.0"?>' + html);