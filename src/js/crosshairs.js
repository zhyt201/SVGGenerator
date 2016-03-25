var d3 = require("d3");
var _ = require('lodash');
module.exports = function () {
	'use strict';
	var width = 0,
	height = 0,
	x = 0,
	y = 0,
	mouseX = 0,
	mouseY = 0,
	circleRadius = 4,
	circle = {
		show : true,
		radius : 4
	},
	_lineH,
	_lineV,
	_circle,
	_translate;

	var crosshairs = function (selection) {
		var root = selection.append('g').attr('class', 'mstar-mkts-ui-plot-crosshairs').attr('transform', _translate);

		_lineH = root.append('line')
			.attr('class', 'mstar-mkts-ui-plot-corssharis mstar-mkts-ui-plot-horizontal')
			.attr('x1', 0)
			.attr('x2', width)
			.attr('y1', y)
			.attr('y2', y)
			.attr('display', 'none');

		_lineV = root.append("line")
			.attr('class', 'mstar-mkts-ui-plot-crosshairs mstar-mkts-ui-plot-vertical')
			.attr('x1', x)
			.attr('x2', x)
			.attr('y1', height)
			.attr('y2', 0)
			.attr('display', 'none');

		if (circle.show === true) {
			_circle = root.append("circle")
				.attr('class', 'mstar-mkts-ui-plot-crosshairs mstar-mkts-ui-plot-circle')
				.attr('r', circle.radius)
				.attr('cx', x)
				.attr('cy', y)
				.attr('display', 'none');
		}

	};

	crosshairs.width = function (value) {
		if (!arguments.length) {
			return width;
		}
		width = value;
		return crosshairs;
	};

	crosshairs.height = function (value) {
		if (!arguments.length) {
			return height;
		}
		height = value;
		return crosshairs;
	};

	crosshairs.x = function (value) {
		if (!arguments.length) {
			return x;
		}
		x = value;
		_lineV.attr('x1', x).attr('x2', x);
		if (_circle) {
			_circle.attr('cx', x);
		}
		return crosshairs;
	};

	crosshairs.y = function (value) {
		if (!arguments.length) {
			return y;
		}
		y = value;
		_lineH.attr('y1', y).attr('y2', y);
		if (_circle) {
			_circle.attr('cy', y);
		}
		return crosshairs;
	};

	crosshairs.show = function () {
		_lineH.attr('display', null);
		_lineV.attr('display', null);
		if (_circle) {
			_circle.attr('display', null);
		}
		return crosshairs;
	};
	crosshairs.hide = function () {
		_lineH.attr('display', 'none');
		_lineV.attr('display', 'none');
		if (_circle) {
			_circle.attr('display', 'none');
		}
		return crosshairs;
	};
	crosshairs.circle = function (value) {
		if (!arguments.length) {
			return circle;
		}
		_.assignIn(circle, value);
		return crosshairs;
	};
	crosshairs.translate = function (value) {
		if (!arguments.length) {
			return _translate;
		}
		_translate = value;
		return crosshairs;
	};
	return crosshairs;
};