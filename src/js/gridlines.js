var d3 = require("d3");
module.exports = function () {
	"use strict";
	var xStyle,
	yStyle,
	xScale,
	yScale,
	xTicks,
	yTicks,
	translate;

	var xLines = function (data, grid) {
		var xlines = grid.selectAll(".mstar-mkts-ui-plot-grid-x").data(data)
		.enter()
		.append("line")
		.style(xStyle)
		.attr({
			"class" : "mstar-mkts-ui-plot-grid-x",
			"x1" : function (d) {
				return xScale(d);
			},
			"x2" : function (d) {
				return xScale(d);
			},
			"y1" : yScale.range()[0],
			"y2" : yScale.range()[1]
		});
	};

	var yLines = function (data, grid) {
		var ylines = grid.selectAll('.mstar-mkts-ui-plot-grid-y').data(data)
		.enter()
		.append('line')
		.style(xStyle)
		.attr({
			'class' : 'mstar-mkts-ui-plot-grid-y',
			'x1' : xScale.range()[0],
			'x2' : xScale.range()[1],
			'y1' : function (d) {
				return yScale(d);
			},
			'y2' : function (d) {
				return yScale(d);
			}
		});
	};

	var gridlines = function (selection) {
		var grid,
		xTickData,
		yTickData;
		selection.each(function () {
			xTickData = xTicks ? (Array.isArray(xTicks) ? xTicks : xScale.ticks(xTicks)) : xScale.ticks();
			yTickData = yTicks ? (Array.isArray(yTicks) ? yTicks : yScale.ticks(yTicks)) : yScale.ticks();
			grid = d3.select(this).selectAll('.mstar-mkts-ui-plot-gridlines').data([[xTickData, yTickData]])
				.enter().append('g').classed('mstar-mkts-ui-plot-gridlines', true).attr('transform', translate);

			xLines(xTickData, grid);
			yLines(yTickData, grid);
		});
	};

	gridlines.xStyle = function (value) {
		if (!arguments.length) {
			return xStyle;
		}
		xStyle = value;
		return gridlines;
	};

	gridlines.yStyle = function (value) {
		if (!arguments.length) {
			return yStyle;
		}
		yStyle = value;
		return gridlines;
	};
	
	gridlines.xScale = function (value) {
		if (!arguments.length) {
			return xScale;
		}
		xScale = value;
		return gridlines;
	};

	gridlines.yScale = function (value) {
		if (!arguments.length) {
			return yScale;
		}
		yScale = value;
		return gridlines;
	};

	gridlines.xTicks = function (value) {
		if (!arguments.length) {
			return xTicks;
		}
		xTicks = value;
		return gridlines;
	};

	gridlines.yTicks = function (value) {
		if (!arguments.length) {
			return yTicks;
		}
		yTicks = value;
		return gridlines;
	};

	gridlines.translate = function (value) {
		if (!arguments.length) {
			return translate;
		}
		translate = value;
		return gridlines;
	};

	return gridlines;
};