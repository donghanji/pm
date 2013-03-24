/*
 * @name jQuery.me Module
 * @desc
		Custom jquery code,including:
		jQuery Selector,
		jQuery util,
		jQuery dom
		jQuery css
		jQuery attr
		
		By jQuery.me Module,can merge those modules.
 *
 */
 
(function(){
	if(module.declare === undefined){
		throw 'There is no global module.declare method!';
	}
	module.alias({
		'jquery.selector':'plugins/mobile/jquery.selector',
		'jquery.util':'plugins/mobile/jquery.util',
		'jquery.dom':'plugins/mobile/jquery.dom',
		'jquery.css':'plugins/mobile/jquery.css',
		'jquery.attr':'plugins/mobile/jquery.attr',
		'jquery.event':'plugins/mobile/jquery.event'
	});
	//define jquery.me module
	module.declare('jquery.me',['jquery.selector','jquery.util','jquery.dom','jquery.css','jquery.attr','jquery.event'],function(require,exports,module){
		var $=require('jquery.selector');
		
		module.exports=$;
	});
})();
