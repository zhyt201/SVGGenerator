var container = require("jsdom").jsdom().body;
var plotter = require('./src/plotter');
var fs=require('fs');
var data=JSON.parse(fs.readFileSync('./IBM_1D.json'));
var seriesList = [{
	'data': data.Price.data,
	'graphType': 'abovebelow',
	'tickerObject': data.tickerObject,
	'spos': data.Price.spos,
	'epos': data.Price.epos
	//'color': getColor(i, data[i].tickerObject),
}];
var html = plotter(container,{
	width:1240,
	height:587
}).init(seriesList).output();
//console.log(html);
fs.writeFileSync('./output.svg','<?xml version="1.0"?>' + html);