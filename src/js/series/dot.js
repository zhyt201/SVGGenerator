var d3 = require("d3");
module.exports = function () {
	'use strict';

	var tickSize = 2;
	var defined = function () {
		return true;
	};
	var func = function (v) {
		return typeof v === "function" ? v : function () {
			return v;
		};
	};
	var x = func,
	y = func;

	var dot = function (selection) {
		var series,
		dot;
		selection.each(function (data) {
			var outerElem = d3.select(this).append("g").classed("mstar-mkts-ui-plot-dot-series", true);
			var i = -1,
			n = data.length,
			d;
			while (++i < n) {
				if (defined.call(this, d = data[i], i)) {
					dot = outerElem.append("circle")
						.attr("r", tickSize)
						.attr("cx", x(d))
						.attr("cy", y(d));
				}
			}
		});
	};

	dot.tickSize = function (value) {
		if (!arguments.length) {
			return tickSize;
		}
		tickSize = value;
		return dot;
	};

	dot.x = function (value) {
		if (!arguments.length) {
			return x;
		}
		x = value;
		return dot;
	};

	dot.y = function (value) {
		if (!arguments.length) {
			return y;
		}
		y = value;
		return dot;
	};

	dot.defined = function (value) {
		if (!arguments.length) {
			return defined;
		}
		defined = value;
		return dot;
	};

	return dot;
};