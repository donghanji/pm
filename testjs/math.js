/*
 *
 * Math Module
 *
 */
(function(){
	if(module.declare === undefined){
		
		throw 'There is no global module.declare method!';
	}
	//define a module,in a file
	module.declare('math',function(require,exports,module){
		exports.add=function(){
			var sum = 0, i = 0, args = arguments, l = args.length;
			while (i < l) {
				sum += args[i++];
			}
			
			return sum;
		};
	});
})();