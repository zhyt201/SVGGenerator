var d3 = require("d3");
var _ = require('lodash');
var gridLines = require("./gridlines");
var crosshairs = require("./crosshairs");
var barSeries = require("./series/bar");
var dotSeries = require("./series/dot");
var ohlcSeries = require("./series/ohlc");
var candlestickSeries = require("./series/candlestick");

module.exports = function (container, opt) {
	'use strict';
	var option = {
		xaxis : {
			show : true,
			align : 'bottom',
			orient : 'bottom',
			value : function (d) {
				return d.index;
			},
			minvalue : function (d) {
				return d.index;
			},
			maxvalue : function (d) {
				return d.index;
			},
			autoScaleMargin : 0,
			height : 30,
			marginTop : 5,
			styleFun : function (elem) {
				elem.selectAll("text").style("text-anchor", "start").attr("x", 1).attr("y", 1);
				return elem;
			}
		},
		yaxis : {
			show : true,
			align : 'right',
			orient : 'left',
			scaleType : 'linear', //log
			value : function (d) {
				return +d.close;
			},
			minvalue : function (d) {
				return +d.low;
			},
			maxvalue : function (d) {
				return +d.high;
			},
			openvalue : function (d) {
				return +d.open;
			},
			highvalue : function (d) {
				return +d.high;
			},
			lowvalue : function (d) {
				return +d.low;
			},
			closevalue : function (d) {
				return +d.close;
			},
			autoScaleMargin : 0.02,
			width : 50,
			showLastlegend : true,
			styleFun : function (elem) {
				var orient = elem.attr('orient'),
				align = elem.attr('align');
				var opt = {
					orient : orient,
					align : align
				};
				if (isInnerAxis(opt)) {
					elem.selectAll("text").attr("dy", "1em");
				}
				return elem;
			}
		},
		highlight : {
			show : true,
			radius : 4
		},
		gridlines : {
			show : true,
			xStyle : {
				'stroke' : '#d3d3d3',
				'stroke-dasharray' : '1 3'
			},
			yStyle : {
				'stroke' : '#d3d3d3',
				'stroke-dasharray' : '1 3'
			}
		},
		crosshairs : {
			show : true,
			circle : {
				show : false,
				radius : 5
			},
			traceMouse : false
		},
		line : {
			style : {
				'fill' : 'none',
				'stroke' : '#0039b7',
				'stroke-width' : '2px'
			}
		},
		area : {
			style : {
				'fill' : '#0039b7',
				'fill-opacity' : '.4'
			}
		},
		mountain : {},
		bar : {
			width : 'auto' // it could be number or auto, auto means it is calculated.
		},
		dot : {
			radius : 2
		},
		ohlc : {
			width : 'auto'
		},
		candlestick : {
			width : 'auto'
		},
		abovebelow : {
			aStyle : {
				'fill' : '#92BC65',
				'opacity' : '.8',
				'stroke' : '#65A125'
			},
			bStyle : {
				'fill' : '#D86D72',
				'opacity' : '.8',
				'stroke' : '#CA3239'
			},
			referValue : function (d) {
				return d.close;
			}
		},
		invalid : function (d) {
			return !isNaN(yValue(d));
		},
		callbacks : {
			onMove : null
		}

	};

	//jquery object
	//var $container;

	//normal object
	var _random = new Date().getTime(),
	_width,
	_height,
	_seriesList = [],
	_seriesCache = {
		'graph' : {},
		'highlight' : {}
	};

	//d3 object
	var _container,
	_svg,
	_graph,
	_highlight,
	_xScale,
	_yScale,
	_xaxis,
	_yaxis,
	_gridlines,
	_corsshairs;

	var plotter = function () {};

	plotter.init = function (data) {

		_seriesList = data;
		//create scale
		createScale();
		//create axes
		createAxes();
		//create gridlines
		createGridLines();
		//change data domain
		changeDomain(_seriesList);
		//clear highlight circle
		clearHighlight();
		//draw series line
		for (var i = 0, l = _seriesList.length; i < l; i++) {
			drawSeries(_seriesList[i], i);
		}
		return plotter;
	};

	plotter.output = function () {
		return _container.html().replace(/clippath/g, 'clipPath');
	};

	var construct = function () {
		_container = d3.select(container.jquery ? container[0] : container);
		_.assignIn(option, opt);
		//create SVG
		createSVG();
		//create scale
		createScale();
		//create hightcircle container
		if (option.highlight.show) {
			_highlight = _svg.append('g').attr('transform', getTranslate());
		}
		//create series container
		_graph = _svg.append('g').attr('class', 'mstar-mkts-ui-plot-graph')
			.attr('transform', getTranslate());
		//create gridlines
		createGridLines();
		//create axes
		createAxes();
		//create crossharis
		createCrossHaris();
		//create overlay to bind the event
		createOverlay();
	};

	var parseData = function (data) {};

	var changeDomain = function (data) {
		_xScale.domain([0, data[0].data.length - 1]);
		var yDomain = calculateAxisExtreme(data);
		var yMin = yDomain[0],
		yMax = yDomain[1];
		var scaleMargin = option.yaxis.autoScaleMargin;
		if (scaleMargin > 0) {
			var s = (yDomain[1] - yDomain[0]) * scaleMargin;
			yMin -= s;
			if (yMin < 0 && yDomain[0] >= 0) {
				yMin = 0;
			}

			yMax += s;
			if (yMax > 0 && yDomain[1] <= 0) {
				yMax = 0;
			}
		}
		_yScale.domain([yMin, yMax]);
		if (_gridlines) {
			_svg.selectAll('.mstar-mkts-ui-plot-gridlines-g').call(_gridlines);
		}
		if (_xaxis) {
			_svg.selectAll('.mstar-mkts-ui-plot-x').call(_xaxis).call(option.xaxis.styleFun);
		}
		if (_yaxis) {
			var _yElem = _svg.selectAll('.mstar-mkts-ui-plot-y');
			_yElem.call(_yaxis).call(option.yaxis.styleFun);
			processTicks(_yElem);
		}

	};

	var calculateAxisExtreme = function (dataList) {
		var ymax = Number.NEGATIVE_INFINITY,
		ymin = Number.POSITIVE_INFINITY;
		dataList.forEach(function (series) {
			var data = series.data;
			var graphType = series.graphType || 'line';
			var isOHLC = graphType === 'ohlc' || graphType === 'candlestick';
			var invalid = option[graphType].invalid || option.invalid;
			data.forEach(function (d) {
				var yminTemp = yValue(d, isOHLC ? 'min' : ''),
				ymaxTemp = yValue(d, isOHLC ? 'max' : '');
				if (!invalid(yminTemp) && yminTemp < ymin) {
					ymin = yminTemp;
				}
				if (!invalid(ymaxTemp) && ymaxTemp > ymax) {
					ymax = ymaxTemp;
				}
			});
		});
		return [ymin, ymax];
	};

	var drawSeries = function (series, index) {
		var _graphList = [];
		switch (series.graphType) {
		case 'line':
			_graphList.push(drawLines(series));
			drawHighlightCircle(index);
			break;
		case 'area':
			_graphList.push(drawArea(series));
			drawHighlightCircle(index);
			break;
		case 'mountain':
			_graphList.push(drawLines(series));
			_graphList.push(drawArea(series));
			drawHighlightCircle(index);
			break;
		case 'dot':
			_graphList.push(drawDots(series));
			drawHighlightCircle(index);
			break;
		case 'ohlc':
			_graphList.push(drawOHLC(series));
			drawHighlightRect(index);
			break;
		case 'candlestick':
			_graphList.push(drawCandlestick(series));
			drawHighlightRect(index);
			break;
		case 'abovebelow':
			_graphList.push(drawAboveBelow(series));
			drawHighlightCircle(index);
			break;
		case 'bar':
			_graphList.push(drawBars(series));
			drawHighlightRect(index);
			break;
		default:
			_graphList.push(drawLines(series));
			drawHighlightCircle(index);
			break;
		}
		var className = getSeriesClassName(index);
		for (var i = 0, l = _graphList.length, _temp; i < l; i++) {
			_temp = _graphList[i];
			_temp.classed(className, true);
			storeSeriesGraph(index, _temp);
		}
	};

	var calculateSize = function () {
		_width = option.width;
		_height = option.height;
		var flag = _width <= 0 || _height <= 0;
		if (!flag) {
			_width = _width - getYaxisWidth();
			_height = _height - getXaxisHeight();
			flag = _width <= 0 || _height <= 0;
		}
		if (flag) {
			throw 'Invalid dimensions for plot, width = ' + _width + ', height = ' + _height;
		}
	};

	var createSVG = function () {
		calculateSize();
		if (!_svg) {
			var margin = option.margin;
			var w = _width + getYaxisWidth();
			var h = _height + getXaxisHeight();
			_svg = _container
				.append('svg')
				.attr('class', 'mstar-mkts-ui-plot')
				.attr('width', w)
				.attr('height', h)
				.attr('xmlns', 'http://www.w3.org/2000/svg')
				.attr('viewBox', '0 0 ' + w + ' ' + h);
		}
	};

	var createScale = function () {
		if (!_xScale) {
			_xScale = d3.scale.linear().range([0, _width]).nice(); //.domain([0, data.length - 1]);
		}
		if (!_yScale) {
			_yScale = d3.scale[option.yaxis.scaleType]().range([_height, 0]).nice(); //.domain(yScaleDomain);
		}
	};

	var createAxes = function () {
		var translate;
		var translateXY = getTranslate(true);
		var xaxisOpt = option.xaxis;
		var yaxisOpt = option.yaxis;
		if (xaxisOpt.show && !_xaxis) {
			_xaxis = createAxis(xaxisOpt, _xScale);
			var xg = _svg.append('g')
				.attr('class', 'mstar-mkts-ui-plot-x mstar-mkts-ui-plot-axis')
				.attr('orient', xaxisOpt.orient)
				.attr('align', xaxisOpt.align);
			if (xaxisOpt.align === 'bottom') {
				translate = [translateXY.x, _height + xaxisOpt.marginTop];
			} else if (xaxisOpt.align === 'top') {
				translate = [translateXY.x, 0];
			}
			xg.attr('transform', 'translate(' + translate[0] + ',' + translate[1] + ')');
		}
		if (yaxisOpt.show && !_yaxis) {
			_yaxis = createAxis(yaxisOpt, _yScale);
			var yg = _svg.append('g')
				.attr('class', 'mstar-mkts-ui-plot-y mstar-mkts-ui-plot-axis')
				.attr('orient', yaxisOpt.orient)
				.attr('align', yaxisOpt.align);
			if (yaxisOpt.align === 'right') {
				translate = [_width, 0];
			} else if (yaxisOpt.align === 'left') {
				translate = [translateXY.x, 0];
			}
			yg.attr('transform', 'translate(' + translate[0] + ',' + translate[1] + ')');
		}

	};

	var createGridLines = function () {
		if (option.gridlines.show === true && !_gridlines) {
			var glg = _svg.append('g')
				.attr('class', 'mstar-mkts-ui-plot-gridlines-g')
				.attr('transform', getTranslate());
			_gridlines = gridLines()
				.xStyle(option.gridlines.xStyle)
				.yStyle(option.gridlines.yStyle)
				.xScale(_xScale)
				.yScale(_yScale)
				.xTicks(option.xaxis.tickValues ? option.xaxis.tickValues() : option.xaxis.ticks)
				.yTicks(option.yaxis.tickValues ? option.yaxis.tickValues() : option.yaxis.ticks);
		}
	};

	var createCrossHaris = function () {
		if (option.crosshairs.show === true && !_corsshairs) {
			_corsshairs = crosshairs()
				.width(_width)
				.height(_height)
				.circle(option.crosshairs.circle)
				.translate(getTranslate());
			_svg.call(_corsshairs);
		}
	};

	var createOverlay = function () {
		_svg.append('rect')
		.style({
			'fill' : 'none',
			'stroke' : 'none',
			'pointer-events' : 'all'
		})
		.attr('class', 'mstar-mkts-ui-plot-overlay')
		.attr('width', _width)
		.attr('height', _height)
		.attr('transform', getTranslate())
		.on('mouseover.plotter', function () {
			if (_corsshairs) {
				_corsshairs.show();
			}
		})
		.on('mouseout.plotter', function () {
			hideHighlight();
			if (_corsshairs) {
				_corsshairs.hide();
			}
		})
		.on('mousemove.plotter', function () {
			var mouse = d3.mouse(this);
			var oriXVal = _xScale.invert(mouse[0]);
			var xVal = Math.round(oriXVal - _xScale.domain()[0]);
			var nearest = findNearest(0, xVal);
			if (nearest) {
				var x = option.crosshairs.traceMouse ? mouse[0] : _xScale(xValue(nearest));
				var y = option.crosshairs.traceMouse ? mouse[1] : _yScale(yValue(nearest));
				if (_corsshairs) {
					_corsshairs.x(x).y(y);
				}
				if (_.isFunction(option.callbacks.onMove)) {
					option.callbacks.onMove({
						mouse : mouse,
						item : nearest
					});
				}
			}
			highlight(xVal);
		});
	};

	var highlight = function (xVal) {
		if (_highlight) {
			var hlCache = getHighlight();
			var hl,
			nearest;
			for (var index in hlCache) {
				hl = hlCache[index];
				nearest = findNearest(index, xVal);
				if (!nearest) {
					continue;
				}
				if (hl.circle) {
					var x = _xScale(xValue(nearest));
					var y = _yScale(yValue(nearest));
					hl.circle.attr('cx', x)
					.attr('cy', y)
					.attr('display', null);
				}
				if (hl.rect) {
					if (!_.isEmpty(hl.rect)) {
						hl.rect.classed('mstar-mkts-ui-plot-highlightbar', false);
					}
					var bars = getGraph(index).selectAll('.mstar-mkts-ui-plot-bar');
					bars.each(function (d, i) {
						if (i === nearest.__idx) {
							var bar = d3.select(this);
							bar.classed('mstar-mkts-ui-plot-highlightbar', true);
							storeSeriesHighlight(index, {
								'rect' : bar
							});
						}
					});
				}
			}
		}
	};

	var hideHighlightRect = function () {
		var hlCache = getHighlight();
		var hl;
		for (var index in hlCache) {
			hl = hlCache[index];
			if (hl.rect && !_.isEmpty(hl.rect)) {
				hl.rect.classed('mstar-mkts-ui-plot-highlightbar', false);
			}
		}
	};

	var hideHighlight = function () {
		if (_highlight) {
			_highlight.selectAll('circle')
			.attr('display', 'none');
			hideHighlightRect();
		}
	};

	var clearHighlight = function () {
		if (_highlight) {
			_highlight.selectAll('circle').remove();
			hideHighlightRect();
		}
	};

	var findNearest = function (index, xVal) {
		var nearest,
		dx = Number.MAX_VALUE,
		series = getSeriesByIndex(index),
		data = series.data || [],
		defined = option[series.graphType] ? option[series.graphType].invalid : undefined;
		defined = defined || option.invalid;
		for (var i = 0, l = data.length, d, xDiff; i < l; i++) {
			d = data[i];
			if (!defined(d)) {
				continue;
			}
			xDiff = Math.abs(xVal - xValue(d));
			if (xDiff < dx) {
				dx = xDiff;
				nearest = d;
				nearest.__idx = i;
			}
		}
		return nearest;
	};

	var getSeriesByIndex = function (index) {
		return _seriesList[index] || {};
	};

	var getSeriesClassName = function (index) {
		var series = getSeriesByIndex(index);
		var className = series.className;
		if (!series.className) {
			className = "mstar-mkts-ui-plot-series-" + index;
		}
		return className;
	};

	var createAxis = function (opt, scale) {
		var axis = d3.svg.axis().scale(scale).orient(opt.orient);
		var array = ['ticks', 'tickSize', 'tickPadding', 'tickValues', 'tickFormat'];
		for (var i = 0, l = array.length, a; i < l; i++) {
			a = array[i];
			if (opt[a] && axis[a]) {
				axis[a](opt[a]);
			}
		}
		return axis;
	};

	var drawHighlightCircle = function (index) {
		if (_highlight) {
			var circle = _highlight.append("circle")
				.attr('index', index)
				.attr('class', 'mstar-mkts-ui-plot-highlight mstar-mkts-ui-plot-circle mstar-mkts-ui-plot-series-' + index)
				.attr('r', option.highlight.radius)
				.attr('display', 'none')
				.style({
					'stroke' : getSeriesByIndex(index).color
				});
			storeSeriesHighlight(index, {
				'circle' : circle
			});
		}
	};

	var drawHighlightRect = function (index) {
		if (_highlight) {
			storeSeriesHighlight(index, {
				'rect' : {}
			});
		}
	};

	var drawLines = function (series) {
		var line = d3.svg.line()
			.x(function (d) {
				return _xScale(xValue(d));
			})
			.y(function (d) {
				return _yScale(yValue(d));
			})
			.defined(option.line.invalid || option.invalid);

		var lineseries = _graph.append('g').attr('class', 'mstar-mkts-ui-plot-line-series').style(series.linestyle || option.line.style);
		lineseries.append('path').attr('d', line(series.data));

		return lineseries;
	};

	var drawArea = function (series) {
		var area = d3.svg.area()
			.x(function (d) {
				return _xScale(xValue(d));
			})
			.y0(_height)
			.y1(function (d) {
				return _yScale(yValue(d));
			})
			.defined(option.area.invalid || option.invalid);

		var target = _graph.append('g').attr('class', 'mstar-mkts-ui-plot-area-series').style(series.areastyle || option.area.style);
		var clipId = series.clipId || _random + '#clip';

		createClipPath(target, clipId);

		target.append('path')
		.attr('clip-path', 'url(#' + clipId + ')')
		.attr('d', area(series.data));

		return target;
	};

	var drawBars = function (series) {
		var bar = barSeries()
			.width(_width)
			.height(_height)
			.tickSize(calculateTickSize(option.bar.width, series.data))
			.xScale(_xScale)
			.yScale(_yScale)
			.xValue(function (d) {
				return xValue(d);
			})
			.yValue(function (d) {
				return yValue(d);
			})
			.defined(option.bar.invalid || option.invalid);

		var target = _graph.append('g');
		target.datum(series.data).call(bar);
		return target;
	};

	var drawDots = function (series) {
		var dot = dotSeries()
			.tickSize(option.dot.radius)
			.x(function (d) {
				return _xScale(xValue(d));
			})
			.y(function (d) {
				return _yScale(yValue(d));
			})
			.defined(option.dot.invalid || option.invalid);

		var target = _graph.append('g');
		target.datum(series.data).call(dot);
		return target;
	};

	var drawOHLC = function (series) {
		var ohlc = ohlcSeries()
			.tickSize(calculateTickSize(option.ohlc.width, series.data))
			.xScale(_xScale)
			.yScale(_yScale)
			.xValue(function (d) {
				return xValue(d);
			})
			.yOValue(function (d) {
				return yValue(d, 'open');
			})
			.yHValue(function (d) {
				return yValue(d, 'high');
			})
			.yLValue(function (d) {
				return yValue(d, 'low');
			})
			.yCValue(function (d) {
				return yValue(d, 'close');
			})
			.defined(option.ohlc.invalid || option.invalid);

		var target = _graph.append('g');
		target.datum(series.data).call(ohlc);
		return target;
	};

	var drawCandlestick = function (series) {
		var candlestick = candlestickSeries()
			.tickSize(calculateTickSize(option.candlestick.width, series.data))
			.xScale(_xScale)
			.yScale(_yScale)
			.xValue(function (d) {
				return xValue(d);
			})
			.yOValue(function (d) {
				return yValue(d, 'open');
			})
			.yHValue(function (d) {
				return yValue(d, 'high');
			})
			.yLValue(function (d) {
				return yValue(d, 'low');
			})
			.yCValue(function (d) {
				return yValue(d, 'close');
			})
			.defined(option.ohlc.invalid || option.invalid);

		var target = _graph.append('g');
		target.datum(series.data).call(candlestick);
		return target;
	};

	var drawAboveBelow = function (series) {
		var referValue = option.abovebelow.referValue(series.data[0]);
		var yClipValue = _yScale(referValue);
		var clipArea = d3.svg.area()
			.x(function (d) {
				return _xScale(xValue(d));
			})
			.y1(yClipValue)
			.defined(option.abovebelow.invalid || option.invalid);

		var abArea = d3.svg.area()
			.x(function (d) {
				return _xScale(xValue(d));
			})
			.y1(function (d) {
				return _yScale(yValue(d));
			})
			.defined(option.abovebelow.invalid || option.invalid);

		var target = _graph.append('g').attr('class', 'mstar-mkts-ui-plot-abovebelow-series');
		var aboveClipId = series.aboveClipId || 'clip-above-' + _random;
		var belowClipId = series.belowClipId || 'clip-below-' + _random;

		target.datum(series.data);

		var defs = target.append('defs');

		defs.append('clipPath')
		.attr('id', aboveClipId)
		.append('rect')
		.attr('x', 0)
		.attr('y', 0)
		.attr('width', _width)
		.attr('height', yClipValue);

		defs.append('clipPath')
		.attr('id', belowClipId)
		.append('rect')
		.attr('x', 0)
		.attr('y', yClipValue)
		.attr('width', _width)
		.attr('height', _height - yClipValue);

		target.append('path')
		.style(series.aboveStyle || option.abovebelow.aStyle)
		.attr('class', 'mstar-mkts-ui-plot-above-series')
		.attr("clip-path", "url(#" + aboveClipId + ")")
		.attr("d", abArea.y0(_height));

		target.append('path')
		.style(series.belowStyle || option.abovebelow.bStyle)
		.attr('class', 'mstar-mkts-ui-plot-below-series')
		.attr("clip-path", "url(#" + belowClipId + ")")
		.attr("d", abArea.y0(0));

		return target;
	};

	var createClipPath = function (target, id) {
		target.append('clipPath')
		.attr('id', id)
		.append('rect')
		.attr('width', _width)
		.attr('height', _height);
	};

	var xValue = function (d, type) {
		type = typeof type === 'undefined' ? '' : type;
		return option.xaxis[type + 'value'](d);
	};

	var yValue = function (d, type) {
		type = typeof type === 'undefined' ? '' : type;
		return option.yaxis[type + 'value'](d);
	};

	var isInnerAxis = function (axisOpt) {
		return axisOpt.align !== axisOpt.orient;
	};

	var getYaxisWidth = function () {
		return !option.yaxis.show || isInnerAxis(option.yaxis) ? 0 : option.yaxis.width;
	};

	var getXaxisHeight = function () {
		return !option.xaxis.show || isInnerAxis(option.xaxis) ? 0 : option.xaxis.height;
	};

	var getTranslate = function (onlyNumber) {
		var x = option.yaxis.align === 'right' ? 0 : getYaxisWidth(),
		y = option.xaxis.align === 'bottom' ? 0 : getXaxisHeight();
		return onlyNumber ? {
			x : x,
			y : y
		}
		 : 'translate(' + x + ',' + y + ')';
	};

	var calculateTickSize = function (size, data) {
		var tickSize = size;
		if (tickSize === 'auto') {
			tickSize = _width / data.length - 1;
			tickSize = Math.min(tickSize, 30);
			tickSize = Math.max(tickSize, 1);
		}
		return tickSize;
	};

	var processTicks = function (yElem) {
		var lastTick = yElem.select(".tick");
		if (lastTick.size()) {
			var _transform = lastTick.attr("transform");
			var _yPosition = parseInt(_transform.replace(/translate\(.+,(.+)\)/, "$1"), 10);
			var lastText = lastTick.select("text");
			if (lastText.size()) {
				if (!option.yaxis.textHeight) {
					//option.yaxis.textHeight = $(lastText[0]).outerHeight(true);
				}
				if (_height - _yPosition < option.yaxis.textHeight) {
					lastTick.remove();
				}
			}
		}
	};

	var storeSeriesHighlight = function (index, highlight) {
		_seriesCache.highlight[index] = _seriesCache.highlight[index] || {};
		//$.extend(true, _seriesCache.highlight[index], highlight);
	};

	var storeSeriesGraph = function (index, graph) {
		_seriesCache.graph[index] = graph;
	};

	var getGraph = function (index) {
		if (arguments.length > 0) {
			return _seriesCache.graph[index];
		}
		return _seriesCache.graph;
	};

	var getHighlight = function (index) {
		if (arguments.length > 0) {
			return _seriesCache.highlight[index];
		}
		return _seriesCache.highlight;
	};

	construct();

	return plotter;
};
