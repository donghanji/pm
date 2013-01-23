(function(){
	module.declare('b.module',['c.module'],function(require,exports){
		console.log(require('c.module').foo);
		exports.foo='b module';
	});
})();