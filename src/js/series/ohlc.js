var d3 = require("d3");
var _ = require('lodash');
module.exports = function () {
	'use strict';
	var xScale,
	yScale,
	tickSize = 5,
	isHLC = false,
	xValue,
	yOValue,
	yHValue,
	yLValue,
	yCValue,
	style = {};
	var defined = function () {
		return true;
	};

	var isUpDay = function (d) {
		return yCValue(d) > yOValue(d);
	};

	var line = d3.svg.line()
		.x(function (d) {
			return d.x;
		})
		.y(function (d) {
			return d.y;
		});

	var highLowLines = function (bar) {
		bar.append("path")
		.style(style)
		.classed("mstar-mkts-ui-plot-high-low-line", true)
		.attr("d", function (d) {
			var x = xScale(xValue(d));
			return line([{
						x : x,
						y : yScale(yHValue(d))
					}, {
						x : x,
						y : yScale(yLValue(d))
					}
				]);
		});
	};

	var openTicks = function (bar) {
		bar.append("path")
		.style(style)
		.classed("mstar-mkts-ui-plot-open-tick", true)
		.attr("d", function (d) {
			var x = xScale(xValue(d));
			var x1,
			x2;
			x1 = x - tickSize;
			x2 = x;
			var y = yScale(yOValue(d));
			return line([{
						x : x1,
						y : y
					}, {
						x : x2,
						y : y
					}
				]);
		});
	};

	var closeTicks = function (bar) {
		var close = bar.append("path")
			.style(style)
			.classed("mstar-mkts-ui-plot-close-tick", true)
			.attr("d", function (d) {
				var x = xScale(xValue(d));
				var x1,
				x2;
				x1 = x;
				x2 = x + tickSize;
				var y = yScale(yCValue(d));
				return line([{
							x : x1,
							y : y
						}, {
							x : x2,
							y : y
						}
					]);
			});
	};

	var ohlc = function (selection) {
		var bar;
		selection.each(function (data) {
			var outerElem = d3.select(this).append('g').classed('mstar-mkts-ui-plot-ohlc-series', true);
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
							'mstar-mkts-ui-plot-up-day' : isUp,
							'mstar-mkts-ui-plot-down-day' : !isUp
						});

					highLowLines(bar);

					if (!ohlc.isHLC()) {
						openTicks(bar);
					}
					closeTicks(bar);
				}
			}
		});
	};

	ohlc.xScale = function (value) {
		if (!arguments.length) {
			return xScale;
		}
		xScale = value;
		return ohlc;
	};

	ohlc.yScale = function (value) {
		if (!arguments.length) {
			return yScale;
		}
		yScale = value;
		return ohlc;
	};

	ohlc.tickSize = function (value) {
		if (!arguments.length) {
			return tickSize;
		}
		tickSize = value / 2;
		return ohlc;
	};

	ohlc.isHLC = function (value) {
		if (!arguments.length) {
			return isHLC;
		}
		isHLC = value;
		return ohlc;
	};
	ohlc.defined = function (value) {
		if (!arguments.length) {
			return defined;
		}
		defined = value;
		return ohlc;
	};

	ohlc.xValue = function (value) {
		if (!arguments.length) {
			return xValue;
		}
		xValue = value;
		return ohlc;
	};

	ohlc.yOValue = function (value) {
		if (!arguments.length) {
			return yOValue;
		}
		yOValue = value;
		return ohlc;
	};

	ohlc.yHValue = function (value) {
		if (!arguments.length) {
			return yHValue;
		}
		yHValue = value;
		return ohlc;
	};

	ohlc.yLValue = function (value) {
		if (!arguments.length) {
			return yLValue;
		}
		yLValue = value;
		return ohlc;
	};

	ohlc.yCValue = function (value) {
		if (!arguments.length) {
			return yCValue;
		}
		yCValue = value;
		return ohlc;
	};
	
	ohlc.style = function (value) {
		if (!arguments.length) {
			return style;
		}
		_.assignIn(style, value);
		return ohlc;
	};

	return ohlc;
};