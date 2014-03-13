$(function() {
	$('#colorpicker').colpick({
		layout:'rgbhex',
		submit:0,
		colorScheme:'dark',
		color:'000000',
		onChange:function(hsb,hex,rgb,el,bySetColor) {
			$(el).css('background-color', '#'+hex);
			curColor = '#'+hex;
			if(!bySetColor) $(el).val(hex);
		}
	}).keyup(function(){
		$(this).colpickSetColor(this.value);
	}).css('background-color', '#000000');
	
	$('#tool_container span.tools').on('click', function(){
		tool_select = $(this).attr('data-value');
		if(!tool_select) return false;
		tool = new tools[tool_select]();
	});
	$('#newLayer').on('click', function(ev){
		createLayer();
	});
	
	$('#layerList').on('click', '.chooseLayer', function(ev){
		ParentElem = $(this).parents('div.layer_list');
		$('#layerList').find('.activeLayer').removeClass('activeLayer');
		ParentElem.addClass('activeLayer');
		activeLayerId = ParentElem.attr('data-layer');
		layerId = ParentElem.attr('data-layer');
		contextLayer = $('canvas#layer-'+layerId)[0].getContext('2d');
	});
	
	$('#layerList').on('click', '.toggleLayer', function(ev){
		ParentElem = $(this).parents('div.layer_list');
		if(ParentElem.hasClass('activeLayer')) return false;
		else {
			layerId = ParentElem.attr('data-layer');
			if($('canvas#layer-'+layerId).is(':visible')) {
				$(this).css('background-color', '#DDD');
				$('canvas#layer-'+layerId).hide();
			} else {
				$(this).css('background-color', '#ADF5E8');
				$('canvas#layer-'+layerId).show();
			}
		}
	});
	
	$('#layerList').on('click', '.deleteLayer', function(ev){
		ParentElem = $(this).parents('div.layer_list');
		if(ParentElem.hasClass('activeLayer')) return false;
		else {
			layerId = ParentElem.attr('data-layer');
			plotPoints[layerId] = new Array();
			$('canvas#layer-'+layerId).remove();
			ParentElem.remove();
		}
	});
	
	init();
});