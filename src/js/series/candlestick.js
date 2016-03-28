var d3 = require("d3");
var _ = require('lodash');
module.exports = function () {
	"use strict";
	var xScale,
	yScale;
	var cacheData,
	cacheScale;
	var tickSize = 5;
	var xValue,
	yOValue,
	yHValue,
	yLValue,
	yCValue,
	style = {
		above : {},
		below : {}
	};
	var defined = function () {
		return true;
	};

	var isUpDay = function (d) {
		return yCValue(d) > yOValue(d);
	};

	var getStyle = function(element,isUp){
		if(isUp){
			return style.above[element];
		}
		return style.below[element];
	};
	
	var line = d3.svg.line()
		.x(function (d) {
			return d.x;
		}).y(function (d) {
			return d.y;
		});

	var highLowLines = function (bar, isUp) {
		var paths = bar.append("path")
			.style(getStyle('path', isUp))
			.classed({
				"mstar-mkts-ui-plot-high-low-line" : true
			})
			.attr("d", function (d) {
				var x = xScale(xValue(d));
				return line([{
							"x" : x,
							"y" : yScale(yHValue(d))
						}, {
							"x" : x,
							"y" : yScale(yLValue(d))
						}
					]);
			});
	};

	var rectangles = function (bar, isUp) {
		var rect = bar.append('rect')
			.style(getStyle('rect', isUp))
			.attr("x", function (d) {
				return xScale(xValue(d)) - tickSize / 2;
			})
			.attr("y", function (d) {
				return isUp ? yScale(yCValue(d)) : yScale(yOValue(d));
			})
			.attr("width", tickSize)
			.attr("height", function (d) {
				return Math.max(0.5, isUp ? (yScale(yOValue(d)) - yScale(yCValue(d))) : (yScale(yCValue(d)) - yScale(yOValue(d))));
			});
	};

	/*var zoom = d3.behavior.zoom()
	.x(xScale)
	.scaleExtent([1, 50])
	.on('zoom', zoomed)
	.on('zoomend', zoomend);*/

	var candlestick = function (selection) {
		var bar;
		selection.each(function (data) {
			var outerElem = d3.select(this).append('g').classed('mstar-mkts-ui-plot-candlestick-series', true);
			var i = -1,
			n = data.length,
			d,
			isUp;
			while (++i < n) {
				if (defined.call(this, d = data[i], i)) {
					isUp = isUpDay(d);
					bar = outerElem.append('g').data([d])
						.classed({
							'mstar-mkts-ui-plot-bar' : true,
							'mstar-mkts-ui-plot-up' : isUp,
							'mstar-mkts-ui-plot-down' : !isUp
						});

					highLowLines(bar, isUp);
					rectangles(bar, isUp);
				}
			}
		});
	};

	//candlestick.zoom = function (selection) {
	//    var xDomain = xScale.domain();
	//    var xRange = xScale.range();
	//    var translate = zoom.translate()[0];
	//}

	candlestick.xScale = function (value) {
		if (!arguments.length) {
			return xScale;
		}
		xScale = value;
		return candlestick;
	};

	candlestick.yScale = function (value) {
		if (!arguments.length) {
			return yScale;
		}
		yScale = value;
		return candlestick;
	};

	candlestick.tickSize = function (value) {
		if (!arguments.length) {
			return tickSize;
		}
		tickSize = value;
		return candlestick;
	};

	candlestick.defined = function (value) {
		if (!arguments.length) {
			return defined;
		}
		defined = value;
		return candlestick;
	};

	candlestick.xValue = function (value) {
		if (!arguments.length) {
			return xValue;
		}
		xValue = value;
		return candlestick;
	};

	candlestick.yOValue = function (value) {
		if (!arguments.length) {
			return yOValue;
		}
		yOValue = value;
		return candlestick;
	};

	candlestick.yHValue = function (value) {
		if (!arguments.length) {
			return yHValue;
		}
		yHValue = value;
		return candlestick;
	};

	candlestick.yLValue = function (value) {
		if (!arguments.length) {
			return yLValue;
		}
		yLValue = value;
		return candlestick;
	};

	candlestick.yCValue = function (value) {
		if (!arguments.length) {
			return yCValue;
		}
		yCValue = value;
		return candlestick;
	};
	
	candlestick.style = function (value) {
		if (!arguments.length) {
			return style;
		}
		_.assignIn(style, value);
		return candlestick;
	};

	return candlestick;
};
