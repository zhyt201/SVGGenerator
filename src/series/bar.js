var d3 = require("d3");
module.exports = function () {
	"use strict";
	var xScale,
	yScale,
	xValue,
	yValue,
	tickSize = 5,
	fillColor,
	strokeColor,
	width,
	height,
	baseValue,
	defined = function () {
		return true;
	};

	var xFun = function (d) {
		return xScale(xValue(d)) - tickSize / 2;
	};

	var yFun = typeof baseValue === 'number' ? function (d) {
		return isUp(d) ? yScale(yValue(d)) : yScale(baseValue);
	}
	 : function (d) {
		return yScale(yValue(d));
	};

	var heightFun = typeof baseValue === 'number' ? function (d) {
		return isUp(d) ? (yScale(baseValue) - yScale(yValue(d))) : (yScale(baseValue) - yScale(baseValue));
	}
	 : function (d) {
		return height - yScale(yValue(d));
	};

	var isUp = typeof baseValue === 'number' ? function (d) {
		return yValue(d) > baseValue;
	}
	 : function (d) {
		return false;
	};

	var isDown = typeof baseValue === 'number' ? function (d) {
		return yValue(d) < baseValue;
	}
	 : function (d) {
		return false;
	};

	var drawRectangle = function (bar) {
		var rect = bar.append('rect')
			.attr("x", xFun)
			.attr("y", yFun)
			.attr("width", tickSize)
			.attr("height", heightFun);
	};

	/*var zoom = d3.behavior.zoom()
	.x(xScale)
	.scaleExtent([1, 50])
	.on('zoom', zoomed)
	.on('zoomend', zoomend);*/

	var bar = function (selection) {
		var series,
		bar;
		selection.each(function (data) {
			var outerElem = d3.select(this).append('g').classed("mstar-mkts-ui-plot-bar-series", true);
			var i = -1,
			n = data.length,
			d;
			while (++i < n) {
				if (defined.call(this, d = data[i], i)) {
					bar = outerElem.append("g").data([d])
						.classed({
							'mstar-mkts-ui-plot-bar' : true,
							'mstar-mkts-ui-plot-up' : isUp,
							'mstar-mkts-ui-plot-down' : isDown
						});

					drawRectangle(bar);
				}
			}
		});

		if (fillColor || strokeColor) {
			var style = {};
			if (fillColor) {
				style.fill = fillColor;
			}
			if (strokeColor) {
				style.stroke = strokeColor;
			}
			selection.selectAll("rect").style(style);
		}
	};

	//bar.zoom = function (selection) {
	//    var xDomain = xScale.domain();
	//    var xRange = xScale.range();
	//    var translate = zoom.translate()[0];
	//}

	bar.xScale = function (value) {
		if (!arguments.length) {
			return xScale;
		}
		xScale = value;
		return bar;
	};

	bar.yScale = function (value) {
		if (!arguments.length) {
			return yScale;
		}
		yScale = value;
		return bar;
	};

	bar.tickSize = function (value) {
		if (!arguments.length) {
			return tickSize;
		}
		tickSize = value;
		return bar;
	};

	bar.width = function (value) {
		if (!arguments.length) {
			return width;
		}
		width = value;
		return bar;
	};

	bar.height = function (value) {
		if (!arguments.length) {
			return height;
		}
		height = value;
		return bar;
	};

	bar.baseValue = function (value) {
		if (!arguments.length) {
			return baseValue;
		}
		baseValue = +value;
		return bar;
	};

	bar.fillColor = function (value) {
		if (!arguments.length) {
			return fillColor;
		}
		fillColor = value;
		return bar;
	};

	bar.strokeColor = function (value) {
		if (!arguments.length) {
			return strokeColor;
		}
		strokeColor = value;
		return bar;
	};

	bar.defined = function (value) {
		if (!arguments.length) {
			return defined;
		}
		defined = value;
		return bar;
	};

	bar.xValue = function (value) {
		if (!arguments.length) {
			return xValue;
		}
		xValue = value;
		return bar;
	};

	bar.yValue = function (value) {
		if (!arguments.length) {
			return yValue;
		}
		yValue = value;
		return bar;
	};

	return bar;
};
