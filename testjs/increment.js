/*
 *
 * Increment Module
 * 
 * @desc 
 		this module rely on math module whitch is in another file
 */
(function(){
	if(module.declare === undefined){
		
		throw 'There is no global module.declare method!';
	}
	//define another module,in a file too
	module.declare('increment',['math'],function(require,exports,module){
		var add=require('math').add;
		exports.increment=function(val){
			
			return add(val,1);
		};
	});
})();