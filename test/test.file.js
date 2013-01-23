(function(){
	module.alias({
		'unit':'{modules}/unit.module'
	});
	module.declare('test.file',['unit'],function(require,exports){
		var assert=require('unit.module').assert;
		exports.add=function(num){
			assert.ok(true,'test.file ok.');
			return num+1;
		};
	});
})();

