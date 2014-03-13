/* © 2009 ROBO Designfcanv
 * http://www.robodesign.ro
 */

// Keep everything in anonymous function, called on window load.
var canvas, context, canvasSrc, contextSrc, tool, container;
var layerCnt = 0;
var activeLayerId = 0;
var curColor = '#000';
var tool_select = 'pencil';
var plotPoints = new Array();
var tools = {};

function init () {
	// Drawing panel canvas
	canvas = $('#drawPan');
	if (!canvas) {
		alert('Error: No drawing panel !');
		return;
	}

	if (!canvas[0].getContext) {
		alert('Error: No drawing panel context area !');
		return;
	}

	// Get the 2D canvas context.
	context = canvas[0].getContext('2d');
	if (!context) {
		alert('Error: Failed to drawing panel context area!');
		return;
	}

	container = $(canvas[0]).parent();
	
	// Add layer to draw objects
	createLayer();

	// Get the tool select input.
	var tool_box = $('#tool_container span.tools');
	if (!tool_box) {
		alert('Error: failed to get the tool element!');
		return;
	}
	tool_box.on('click', ev_tool_change);

	$('div#tool_container').find('span[data-value='+tool_select+']').trigger('click');
	// Activate the default tool.
	/*if (tools[tool_default]) {
		tool = new tools[tool_default]();
		tool_box.val(tool_default);
	}*/

	// Attach the mousedown, mousemove and mouseup event listeners.
	canvas.on({
		mousedown: ev_canvas,
		mousemove: ev_canvas,
		mouseup: ev_canvas,
		touchstart: ev_canvas,
		touchmove: ev_canvas,
		touchend: ev_canvas,
		touchcancel: ev_canvas,
		/*mousewheel: ev_canvas,
		DOMMouseScroll: ev_canvas*/
	});
	
}

function ev_tool_change (ev) {
	val = $(this).attr('data-value');
	if (tools[val]) {
		tool = new tools[val]();
		$(this).parents('div#tool_container').find('span.tools.activeTool').removeClass('activeTool');
		$(this).addClass('activeTool');
	}
}

function ev_canvas (ev, delta) {
	if(ev.type == 'touchstart' || ev.type == 'touchmove' || ev.type == 'touchend' || ev.type == 'touchcancel'){
        var touch = ev.originalEvent.touches[0] || ev.originalEvent.changedTouches[0];
        ev._x = touch.pageX;
        ev._y = touch.pageY;
	} else if(ev.offsetX == undefined && ev.layerX == undefined) {
		ev._x = ev.clientX-canvas.offset().left;
		ev._y = ev.clientY-canvas.offset().top;
	} else if(ev.offsetX == undefined) {
		ev._x = ev.layerX;
		ev._y = ev.layerY;
	} else {
		ev._x = ev.offsetX;
		ev._y = ev.offsetY;
	}
	// Call the event handler of the tool.
	var func = tool[ev.type];
	if (func) {
		func(ev);
	}
}

function createLayer() {
	canvasLayer = canvas.clone();
	if (!canvasLayer) {
		alert('Error: I cannot create a new layer element!');
		return;
	}
	canvasLayer.attr('id', 'layer-'+(++layerCnt));
	plotPoints[layerCnt] = new Array();
	plotPoints[layerCnt]['obj'] = 0;
	plotPoints[layerCnt]['coords'] = new Array();
	plotPoints[layerCnt]['color'] = new Array();
	canvasLayer.addClass('viewLayer');
	container.prepend(canvasLayer);
//		contextLayer = canvasLayer[0].getContext('2d');
	layerLabel = '<div class="layerLabel floatLeft">Layer '+layerCnt+'</div><div class="layerAction floatRight"><span class="chooseLayer floatLeft"></span><span class="toggleLayer floatLeft"></span><span class="deleteLayer floatLeft"></span></div>';
	layerElem = $('<div />').addClass('layer_list').attr('data-layer', layerCnt).append(layerLabel);
	//layerLabel = '<li data-layer="'+layerCnt+'"><div class="layerLabel floatLeft">Layer '+layerCnt+'</div><div class="layerAction floatRight"><span class="chooseLayer">S</span><span class="toggleLayer">T</span><span class="deleteLayer">D</span></div></li>';
	
	//layerLabel = $('<div />').addClass('showLayer').attr('layer', layerCnt).append('Layer '+layerCnt+' <span class="toggleLayer">x</span>');
	
	$('#layerList').append(layerElem);
	layerElem.find('.chooseLayer').trigger('click');
	//layerLabel.trigger('click');
}

function img_update (clear) {
	if(clear == true)
		contextLayer.clearRect(0, 0, canvas[0].width, canvas[0].height);
	contextLayer.drawImage(canvas[0], 0, 0);
	context.clearRect(0, 0, canvas[0].width, canvas[0].height);
}

function plotCanvas(plotPoints) {
	len = plotPoints[activeLayerId].obj;

	context.clearRect(0, 0, canvas[0].width, canvas[0].height);
	context.beginPath();
	//.push({coords: {x: ev._x, y: ev._y}});
	$(plotPoints[activeLayerId]['coords'][len]).each(function(i) {
		if(i == 0) context.moveTo(this.x, this.y);
		context.lineTo(this.x, this.y);
	});
	context.strokeStyle = plotPoints[activeLayerId]['color'][len];
	context.stroke();
	context.closePath();
}
		
function statusClear() {
	$('#statusUpdate').hide();
	$('#statusUpdate').html('');
}

function statusUpdate(ev, msg) {
	statusSpan = $('#statusUpdate');
	if(msg.n) msg.n = statusSpan.append('<span>'+msg.n+'</span>');
	if(msg.p1) msg.p1 = statusSpan.append('<span><b>Start</b> '+msg.p1+'</span>');
	if(msg.p2) msg.p2 = statusSpan.append('<span><b>End</b> '+msg.p2+'</span>');
	if(msg.c) msg.c = statusSpan.append('<span><b>Center</b> '+msg.c+'</span>');
	if(msg.r) msg.r = statusSpan.append('<span><b>Radius</b> '+msg.r+'</span>');
	if(msg.x) msg.x = statusSpan.append('<span><b>X-axes</b> '+msg.x+'</span>');
	if(msg.y) msg.y = statusSpan.append('<span><b>Y-axes</b> '+msg.y+'</span>');
	if(msg.b) msg.b = statusSpan.append('<span><b>Breadth</b> '+msg.b+'</span>');
	if(msg.h) msg.h = statusSpan.append('<span><b>Height</b> '+msg.h+'</span>');
	if(msg.s) msg.s = statusSpan.append('<span><b>Slope</b> '+msg.s+'</span>');
	if(msg.w) msg.w = statusSpan.append('<span><b>Angle</b> '+msg.w+'</span>');
	if(msg.z) msg.z = statusSpan.append('<span><b>Zoom</b> '+msg.z+'</span>');
	if(msg.d) msg.d = statusSpan.append('<span><b>Distance</b> '+msg.d+'</span>');
	statusSpan.css('top', ev.pageY+15).css('left', ev.pageX+15).show();
}

tools.pencil = function () {
	var tool = this;
	this.started = false;
	
	this.touchstart = this.mousedown = function (ev) {
		tool.started = true;
		tool.x0 = ev._x;
		tool.y0 = ev._y;
		
		curObj = ++plotPoints[activeLayerId].obj;
		plotPoints[activeLayerId]['color'][curObj] = curColor;
		plotPoints[activeLayerId]['coords'][curObj] = new Array();
		plotPoints[activeLayerId]['coords'][curObj].push({x: ev._x, y: ev._y});
		statusClear();
		msg = {n: 'Pencil', p1: ev._x.toFixed(2)+', '+ev._y.toFixed(2)};
		statusUpdate(ev, msg);
	};
	
	this.touchmove = this.mousemove = function (ev) {
		if (!tool.started) {
			return false;
			
		}
		plotPoints[activeLayerId]['coords'][curObj].push({x: ev._x, y: ev._y});
		statusClear();
		msg = {n: 'Pencil', p1: tool.x0.toFixed(2)+', '+tool.y0.toFixed(2), p2: ev._x.toFixed(2)+', '+ev._y.toFixed(2)};
		statusUpdate(ev, msg);
		plotCanvas(plotPoints);
	};
	
	this.touchcancel = this.touchend = this.mouseup = function (ev) {
		if (tool.started) {
			/*tool.mousemove(ev);
			tool.touchmove(ev);*/
			tool.started = false;
			img_update();
			statusClear();
		}
	};
};

tools.ellipse = function () {
	var tool = this;
	this.started = false;

	this.touchstart = this.mousedown = function (ev) {
		tool.started = true;
		curObj = ++plotPoints[activeLayerId].obj;
		plotPoints[activeLayerId]['color'][curObj] = curColor;
		tool.x0 = ev._x;
		tool.y0 = ev._y;
		statusClear();
		msg = {n: 'Ellipse', p1: tool.x0.toFixed(2)+', '+tool.y0.toFixed(2)};
		statusUpdate(ev, msg);
	};

	
	this.touchmove = this.mousemove = function (ev) {
		if (!tool.started) {
			return;
		}
		plotPoints[activeLayerId]['coords'][curObj] = new Array();
		var points = new Array();
		var reversePoints = new Array();
		
		var a = Math.abs(ev._x - tool.x0),
		b = Math.abs(ev._y - tool.y0),
		m = (ev._y - tool.y0)/(ev._x - tool.x0);
		
		// 1st or 3rd
		if(m > 0) {
			if(ev._y > tool.y0) { // 1st
				xc = Math.min(ev._x, tool.x0);
				yc = Math.max(ev._y, tool.y0);
			} else { // 3rd
				xc = Math.max(ev._x, tool.x0);
				yc = Math.min(ev._y, tool.y0);
			}
		} else { // 2nd or 4th
			if(ev._y > tool.y0) { // 2nd
				xc = Math.max(ev._x, tool.x0);
				yc = Math.max(ev._y, tool.y0);
			} else { // 4th
				xc = Math.min(ev._x, tool.x0);
				yc = Math.min(ev._y, tool.y0);
			}
		}
		
		statusClear();
		msg = {n: 'Ellipse', p1: tool.x0.toFixed(2)+', '+tool.y0.toFixed(2), p2: ev._x.toFixed(2)+', '+ev._y.toFixed(2), c: xc.toFixed(2)+', '+yc.toFixed(2), x: a.toFixed(2), y: b.toFixed(2)};
		statusUpdate(ev, msg);
		
		x = 0; y = b;
		px = 0; py = 2*a*a*y;
		
		
		points.push({x: x, y: y});
		reversePoints.push({x: x, y: y});
		plotPoints[activeLayerId]['coords'][curObj].push({x: xc+x, y: yc+y});
		//R1
		p = b*b - a*a*b + 0.25*a*a;
		while(px < py) {
			x = x+1;
			px = px + 2*b*b;
			if(p < 0) {
				p = p + b*b + px;
			} else {
				y = y-1;
				py = py - 2*a*a;
				p = p + b*b + px - py;
			}
			points.push({x: x, y: y});
			reversePoints.push({x: x, y: y});
			plotPoints[activeLayerId]['coords'][curObj].push({x: xc+x, y: yc+y});
		}
		//R2
		p = b*b*(x+0.5)*(x+0.5) + a*a*(y-1)*(y-1) - a*a*b*b;
		while(y > 0) {
			y = y-1;
			py = py - 2*a*a;
			if(p > 0) {
				p = p + a*a - py;
			} else {
				x = x+1;
				px = px + 2*b*b;
				p = p + a*a - py + px;
			}
			points.push({x: x, y: y});
			reversePoints.push({x: x, y: y});
			plotPoints[activeLayerId]['coords'][curObj].push({x: xc+x, y: yc+y});
		}
		reversePoints.reverse();
		$(reversePoints).each(function(i, coord){
			plotPoints[activeLayerId]['coords'][curObj].push({x: xc+coord.x, y: yc-coord.y});
		});
		$(points).each(function(i, coord){
			plotPoints[activeLayerId]['coords'][curObj].push({x: xc-coord.x, y: yc-coord.y});
		});
		
		$(reversePoints).each(function(i, coord){
			plotPoints[activeLayerId]['coords'][curObj].push({x: xc-coord.x, y: yc+coord.y});
		});
		plotCanvas(plotPoints);
	};
	
	this.touchcancel = this.touchend = this.mouseup = function (ev) {
		if (tool.started) {
			//tool.mousemove(ev);
			tool.started = false;
			img_update();
			statusClear();
		}
	};
};

tools.line = function () {
	var tool = this;
	this.started = false;
	
	this.touchstart = this.mousedown = function (ev) {
		tool.started = true;
		curObj = ++plotPoints[activeLayerId].obj;
		plotPoints[activeLayerId]['color'][curObj] = curColor;
		tool.x0 = ev._x;
		tool.y0 = ev._y;
		statusClear();
		msg = {n: 'Line', p1: tool.x0.toFixed(2)+', '+tool.y0.toFixed(2)};
		statusUpdate(ev, msg);
	};

	this.touchmove = this.mousemove = function (ev) {
		if (!tool.started) {
			return;
		}
		
		plotPoints[activeLayerId]['coords'][curObj] = new Array();
		var dx = Math.abs(ev._x - tool.x0);
		var dy = Math.abs(ev._y - tool.y0);
		var x1 = tool.x0, y1 = tool.y0;
		var m = Math.abs(dx/dy);
		statusClear();
		msg = {n: 'Line', p1: tool.x0.toFixed(2)+', '+tool.y0.toFixed(2), p2: ev._x.toFixed(2)+', '+ev._y.toFixed(2), s: m.toFixed(2)};
		statusUpdate(ev, msg);
		if(((ev._x-x1) < 0 && (ev._y-y1) > 0) || ((ev._x-x1) > 0 && (ev._y-y1) < 0)) {
			a = -1;
		} else {
			a = 1;
		}
		if(m > 1) {
			if(x1 > ev._x ) {
				t = x1; x1 = ev._x; ev._x = t;
				t = y1; y1 = ev._y; ev._y = t;
			}
			p = 2*dy - dx;
			plotPoints[activeLayerId]['coords'][curObj].push({x: tool.x0, y: tool.y0});
			while(Math.abs(x1) < Math.abs(ev._x)) {
				if(p < 0) {
					p = p + 2*dy;
				} else {
					p = p+2*dy-2*dx;
					y1 = y1+a;
				}
				x1 = x1+1;
				plotPoints[activeLayerId]['coords'][curObj].push({x: x1, y: y1});
			};
		} else if(m < 1) {
			if(y1 > ev._y) {
				t = y1; y1 = ev._y; ev._y = t;
				t = x1; x1 = ev._x; ev._x = t;
			}
			p = 2*dx - dy;
			plotPoints[activeLayerId]['coords'][curObj].push({x: tool.x0, y: tool.y0});
			while(Math.abs(y1) < Math.abs(ev._y)) {
				if(p < 0) {
					p = p + 2*dx;
				} else {
					p = p + 2*dx - 2*dy;
					x1 = x1+a;
				}
				y1 = y1+1;
				plotPoints[activeLayerId]['coords'][curObj].push({x: x1, y: y1});
			}
		}
		plotCanvas(plotPoints);
	};

	// This is called when you release the mouse button.
	this.touchcancel = this.touchend = this.mouseup = function (ev) {
		if (tool.started) {
			//tool.mousemove(ev);
			tool.started = false;
			img_update();
			statusClear();
		}
	};
};

tools.circle = function () {
	var tool = this;
	this.started = false;

	this.touchstart = this.mousedown = function (ev) {
		tool.started = true;
		curObj = ++plotPoints[activeLayerId].obj;
		plotPoints[activeLayerId]['color'][curObj] = curColor;
		tool.x0 = ev._x;
		tool.y0 = ev._y;
		statusClear();
		msg = {n: 'Circle', c: tool.x0.toFixed(2)+', '+tool.y0.toFixed(2)};
		statusUpdate(ev, msg);
	};

	this.touchmove = this.mousemove = function (ev) {
		if (!tool.started) {
			return;
		}
		plotPoints[activeLayerId]['coords'][curObj] = new Array();
		var points = new Array();
		var reversePoints = new Array();
		
		var dx = ev._x - tool.x0;
		var dy = ev._y - tool.y0;
		var r = Math.sqrt(dx*dx + dy*dy);
		var xc = tool.x0, yc = tool.y0;
		statusClear();
		msg = {n: 'Circle', c: tool.x0.toFixed(2)+', '+tool.y0.toFixed(2), r: r.toFixed(2)};
		statusUpdate(ev, msg);
		x = 0; y = r;
		
		points.push({x: x, y: y});
		reversePoints.push({x: x, y: y});
		plotPoints[activeLayerId]['coords'][curObj].push({x: xc+x, y: yc+y});
		
		p = 1-r;
		while(x < y) {
			if(p < 0) {
				p = p + 2*x +1;
			} else {
				p = p+2*x-2*y+1;
				y = y-1;
			}
			x = x+1;
			
			points.push({x: x, y: y});
			reversePoints.push({x: x, y: y});
			plotPoints[activeLayerId]['coords'][curObj].push({x: xc+x, y: yc+y});
		};
		reversePoints.reverse();
		$(reversePoints).each(function(i, coord){
			plotPoints[activeLayerId]['coords'][curObj].push({x: xc+coord.y, y: yc+coord.x});
		});
		$(points).each(function(i, coord){
			plotPoints[activeLayerId]['coords'][curObj].push({x: xc+coord.y, y: yc-coord.x});
		});
		$(reversePoints).each(function(i, coord){
			plotPoints[activeLayerId]['coords'][curObj].push({x: xc+coord.x, y: yc-coord.y});
		});
		$(points).each(function(i, coord){
			plotPoints[activeLayerId]['coords'][curObj].push({x: xc-coord.x, y: yc-coord.y});
		});
		$(reversePoints).each(function(i, coord){
			plotPoints[activeLayerId]['coords'][curObj].push({x: xc-coord.y, y: yc-coord.x});
		});
		$(points).each(function(i, coord){
			plotPoints[activeLayerId]['coords'][curObj].push({x: xc-coord.y, y: yc+coord.x});
		});
		$(reversePoints).each(function(i, coord){
			plotPoints[activeLayerId]['coords'][curObj].push({x: xc-coord.x, y: yc+coord.y});
		});
		plotCanvas(plotPoints);
	};

	this.touchcancel = this.touchend = this.mouseup = function (ev) {
		if (tool.started) {
			//tool.mousemove(ev);
			tool.started = false;
			img_update();
			statusClear();
		}
	};
};

tools.rect = function () {
	var tool = this;
	this.started = false;

	this.touchstart = this.mousedown = function (ev) {
		tool.started = true;
		curObj = ++plotPoints[activeLayerId].obj;
		plotPoints[activeLayerId]['color'][curObj] = curColor;
		tool.x0 = ev._x;
		tool.y0 = ev._y;
		statusClear();
		msg = {n: 'Rectangle', p1: tool.x0.toFixed(2)+', '+tool.y0.toFixed(2)};
		statusUpdate(ev, msg);
	};

	this.touchmove = this.mousemove = function (ev) {
		if (!tool.started) {
			return;
		}
		plotPoints[activeLayerId]['coords'][curObj] = new Array();
		
		var x = Math.min(ev._x,  tool.x0),
		y = Math.min(ev._y,  tool.y0),
		w = Math.abs(ev._x - tool.x0),
		h = Math.abs(ev._y - tool.y0);
		statusClear();
		msg = {n: 'Rectangle', p1: tool.x0.toFixed(2)+', '+tool.y0.toFixed(2), p2: ev._x.toFixed(2)+', '+ev._y.toFixed(2), h: h.toFixed(2), b: w.toFixed(2)};
		statusUpdate(ev, msg);
		x1 = x;
		y1 = y;
		while(x1 <= x+w) {
			plotPoints[activeLayerId]['coords'][curObj].push({x: x1, y: y1});
			x1 = x1+1;
		};
		while(y1 <= y+h) {
			plotPoints[activeLayerId]['coords'][curObj].push({x: x1, y: y1});
			y1 = y1+1;
		};
		while(x1 > x) {
			plotPoints[activeLayerId]['coords'][curObj].push({x: x1, y: y1});
			x1 = x1-1;
		};
		while(y1 > y) {
			plotPoints[activeLayerId]['coords'][curObj].push({x: x1, y: y1});
			y1 = y1-1;
		};
		plotPoints[activeLayerId]['coords'][curObj].push({x: x1, y: y1});
		
		plotCanvas(plotPoints);
	};

	this.touchcancel = this.touchend = this.mouseup = function (ev) {
		if (tool.started) {
			//tool.mousemove(ev);
			tool.started = false;
			img_update();
			statusClear();
		}
	};
};

tools.translate = function () {
	var tool = this;
	this.started = false;

	this.touchstart = this.mousedown = function (ev) {
		tool.started = true;
		tool.x0 = ev._x;
		tool.y0 = ev._y;
		statusClear();
		msg = {n: 'Move', p1: tool.x0.toFixed(2)+', '+tool.y0.toFixed(2)};
		statusUpdate(ev, msg);
	};

	this.touchmove = this.mousemove = function (ev) {
		if (!tool.started) {
			return;
		}
		
		context.clearRect(0, 0, canvas[0].width, canvas[0].height);
		var x = (ev._x - tool.x0), y = (ev._y - tool.y0);
		d = Math.sqrt(Math.abs(x)*Math.abs(x)+Math.abs(y)*Math.abs(y));
		
		statusClear();
		msg = {n: 'Move', p1: tool.x0.toFixed(2)+', '+tool.y0.toFixed(2), p2: ev._x.toFixed(2)+', '+ev._y.toFixed(2), d: d.toFixed(2), s: (y/x).toFixed(2)};
		statusUpdate(ev, msg);
		
		$(plotPoints[activeLayerId].coords).each(function(i) {
			context.beginPath();
			$(plotPoints[activeLayerId].coords[i]).each(function(j){
				if(j == 0) context.moveTo(plotPoints[activeLayerId].coords[i][j].x+x, plotPoints[activeLayerId].coords[i][j].y+y);
				context.lineTo(plotPoints[activeLayerId].coords[i][j].x+x, plotPoints[activeLayerId].coords[i][j].y+y);
			});
			context.strokeStyle = plotPoints[activeLayerId].color[i];
			context.stroke();
			context.closePath();
		});
	};

	this.touchcancel = this.touchend = this.mouseup = function (ev) {
		if (tool.started) {
			//tool.mousemove(ev);
			tool.started = false;
			var x = (ev._x - tool.x0), y = (ev._y - tool.y0);
			$(plotPoints[activeLayerId].coords).each(function(i) {
				$(plotPoints[activeLayerId].coords[i]).each(function(j){
					plotPoints[activeLayerId].coords[i][j].x = plotPoints[activeLayerId].coords[i][j].x+x;
					plotPoints[activeLayerId].coords[i][j].y = plotPoints[activeLayerId].coords[i][j].y+y;
				});
			});
			img_update(true);
			statusClear();
		}
	};
};

tools.scale = function () {
	var tool = this;
	this.started = false;

	this.DOMMouseScroll = function(ev) {
		if(!tool.started) {
			tool.started = true;
			 //var delta = evt.detail < 0 || evt.wheelDelta > 0 ? 1 : -1;
			zm = -(ev.detail);
			//zm = ev.originalEvent.detail;
			context.clearRect(0, 0, canvas[0].width, canvas[0].height);
			$(plotPoints[activeLayerId].coords).each(function(i) {
				context.beginPath();
				$(plotPoints[activeLayerId].coords[i]).each(function(j){
					tx = plotPoints[activeLayerId].coords[i][j].x*zm;
					ty = plotPoints[activeLayerId].coords[i][j].y*zm;
					if(j == 0) context.moveTo(tx, ty);
					context.lineTo(tx, ty);
					plotPoints[activeLayerId].coords[i][j].x = tx;
					plotPoints[activeLayerId].coords[i][j].y = ty;
				});
				context.strokeStyle = plotPoints[activeLayerId].color[i];
				context.stroke();
				context.closePath();
				
			});
			img_update(true);
			tool.started = false;
		}
		return false;
	};
	
	this.mousewheel = function(ev){
		if(!tool.started) {
			tool.started = true;
			//zm = ev.originalEvent.wheelDelta;
			zm = ev.wheelDelta;
			context.clearRect(0, 0, canvas[0].width, canvas[0].height);
			$(plotPoints[activeLayerId].coords).each(function(i) {
				context.beginPath();
				$(plotPoints[activeLayerId].coords[i]).each(function(j){
					tx = plotPoints[activeLayerId].coords[i][j].x*zm;
					ty = plotPoints[activeLayerId].coords[i][j].y*zm;
					if(j == 0) context.moveTo(tx, ty);
					context.lineTo(tx, ty);
					plotPoints[activeLayerId].coords[i][j].x = tx;
					plotPoints[activeLayerId].coords[i][j].y = ty;
				});
				context.strokeStyle = plotPoints[activeLayerId].color[i];
				context.stroke();
				context.closePath();
				
			});
			img_update(true);
			tool.started = false;
		}
		return false;
	};
		
	this.touchstart = this.mousedown = function (ev) {
		tool.started = true;
		tool.x0 = ev._x;
		tool.y0 = ev._y;
		statusClear();
		msg = {n: 'Zoom', p1: tool.y0.toFixed(2)};
		statusUpdate(ev, msg);
	};

	this.touchmove = this.mousemove = function (ev) {
		if (!tool.started) {
			return;
		}
		zm = (ev._y / tool.y0);
		
		statusClear();
		msg = {n: 'Zoom', p1: tool.y0.toFixed(2), p2: ev._y.toFixed(2), z: zm.toFixed(2)};
		statusUpdate(ev, msg);
		
		context.clearRect(0, 0, canvas[0].width, canvas[0].height);
		
		$(plotPoints[activeLayerId].coords).each(function(i) {
			context.beginPath();
			$(plotPoints[activeLayerId].coords[i]).each(function(j){
				tx = plotPoints[activeLayerId].coords[i][j].x*zm;
				ty = plotPoints[activeLayerId].coords[i][j].y*zm;
				if(j == 0) context.moveTo(tx, ty);
				context.lineTo(tx, ty);
			});
			context.strokeStyle = plotPoints[activeLayerId].color[i];
			context.stroke();
			context.closePath();
		});
	};

	this.touchcancel = this.touchend = this.mouseup = function (ev) {
		if (tool.started) {
			//tool.mousemove(ev);
			tool.started = false;
			zm = (ev._y / tool.y0);
			
			$(plotPoints[activeLayerId].coords).each(function(i) {
				$(plotPoints[activeLayerId].coords[i]).each(function(j){
					tx = plotPoints[activeLayerId].coords[i][j].x*zm;
					ty = plotPoints[activeLayerId].coords[i][j].y*zm;
					plotPoints[activeLayerId].coords[i][j].x = tx;
					plotPoints[activeLayerId].coords[i][j].y = ty;
				});
			});
			img_update(true);
			statusClear();
		}
	};
};

tools.rotate = function () {
	var tool = this;
	this.started = false;

	this.touchstart = this.mousedown = function (ev) {
		tool.started = true;
		tool.x0 = ev._x;
		tool.y0 = ev._y;
		statusClear();
		msg = {n: 'Rotate', p1: tool.x0.toFixed(2)+', '+tool.y0.toFixed(2)};
		statusUpdate(ev, msg);
	};

	this.touchmove = this.mousemove = function (ev) {
		if (!tool.started) {
			return;
		}
		xc = canvas[0].width/2, yc = canvas[0].height/2;
		m1 = (xc - tool.x0)/(yc - tool.y0);
		m2 = (xc - ev._x)/(yc - ev._y);
		ang1 = Math.atan(m1);
		if((yc-tool.y0) < 0) ang1 += Math.PI;
		ang2 = Math.atan(m2);
		if((yc-ev._y) < 0) ang2 += Math.PI;
		theta = ang1 - ang2; // Changed direction to clockwise
//		w = 360+((theta*180)/Math.PI);
		
		statusClear();
		msg = {n: 'Rotate', p1: tool.x0.toFixed(2)+', '+tool.y0.toFixed(2), p2: ev._x.toFixed(2)+', '+ev._y.toFixed(2), c: xc.toFixed(2)+', '+yc.toFixed(2), w: theta.toFixed(2)};
		statusUpdate(ev, msg);
		
		context.clearRect(0, 0, canvas[0].width, canvas[0].height);
		
		$(plotPoints[activeLayerId].coords).each(function(i) {
			context.beginPath();
			$(plotPoints[activeLayerId].coords[i]).each(function(j){
				tx = plotPoints[activeLayerId].coords[i][j].x-xc;
				ty = plotPoints[activeLayerId].coords[i][j].y-yc;
				x = tx*Math.cos(theta) - ty*Math.sin(theta);
				y = tx*Math.sin(theta) + ty*Math.cos(theta);
				tx = x + xc;
				ty = y + yc;
				if(j == 0) context.moveTo(tx, ty);
				context.lineTo(tx, ty);
			});
			context.strokeStyle = plotPoints[activeLayerId].color[i];
			context.stroke();
			context.closePath();
		});
	};

	this.touchcancel = this.touchend = this.mouseup = function (ev) {
		if (tool.started) {
			//tool.mousemove(ev);
			tool.started = false;
			
			xc = canvas[0].width/2, yc = canvas[0].height/2;
			m1 = (xc - tool.x0)/(yc - tool.y0);
			m2 = (xc - ev._x)/(yc - ev._y);
			ang1 = Math.atan(m1);
			if((yc-tool.y0) < 0) ang1 += Math.PI;
			ang2 = Math.atan(m2);
			if((yc-ev._y) < 0) ang2 += Math.PI;

			theta = ang1 - ang2; // Changed direction to clockwise
			$(plotPoints[activeLayerId].coords).each(function(i) {
				$(plotPoints[activeLayerId].coords[i]).each(function(j){
					tx = plotPoints[activeLayerId].coords[i][j].x-xc;
					ty = plotPoints[activeLayerId].coords[i][j].y-yc;
					x = tx*Math.cos(theta) - ty*Math.sin(theta);
					y = tx*Math.sin(theta) + ty*Math.cos(theta);
					tx = x + xc;
					ty = y + yc;
					plotPoints[activeLayerId].coords[i][j].x = tx;
					plotPoints[activeLayerId].coords[i][j].y = ty;
				});
			});
			img_update(true);
			statusClear();
		}
	};
};