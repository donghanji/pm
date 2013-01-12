/*
 * @name Zepto Module
 * @desc 
		Zepto does not support AMD API.
		Zepto Module can let zepto also support AMD API
 */
(function(global,undefined){
	if(module.declare === undefined){
		throw 'There is no global module.declare method!';
	}
	module.files({
		'zepto':'http://zeptojs.com/zepto.min.js'
	});
	//define zepto.module module
	module.declare('zepto.module',['zepto'],function(require,exports,module){
		if(Zepto !== undefined){
			require('zepto',[],function(require,exports,module){
				
				module.exports=Zepto;
			});
			
			return Zepto;
		}else{
			throw 'zepot.js is failed to load.'
		}
	});
})(this);