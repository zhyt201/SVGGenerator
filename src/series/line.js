var d3 = require('d3');
module.exports = function (container, series) {
	'use strict';
	var xScale,
	xValue,
	yScale,
	yValue,
	defined,
	className;

	var line = d3.svg.line()
		.x(function (d) {
			return xScale(xValue(d));
		})
		.y(function (d) {
			return yScale(yValue(d));
		})
		.defined(defined);

	var _graph = container.append('g').attr('class', className);
	_graph.append('path').attr('d', line(series.data));

	return {
		graph : function () {
			return _graph;
		},
		cls : function (value) {
			if (!arguments.length) {
				return className;
			}
			className = value;
			return this;
		},
		xScale : function (value) {
			if (!arguments.length) {
				return xScale;
			}
			xScale = value;
			return this;
		},
		yScale : function (value) {
			if (!arguments.length) {
				return yScale;
			}
			yScale = value;
			return this;
		},
		xValue : function (value) {
			if (!arguments.length) {
				return xValue;
			}
			xValue = value;
			return this;
		},
		yValue : function (value) {
			if (!arguments.length) {
				return yValue;
			}
			yValue = value;
			return this;
		},
		defined : function (value) {
			if (!arguments.length) {
				return defined;
			}
			defined = value;
			return this;
		}
	};
};
