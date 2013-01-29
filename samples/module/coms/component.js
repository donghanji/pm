(function(){
	//define a module
	module.declare('a.module',function(require,exports,module){
	    console.log('--a.module--');
		exports.foo='a.module';
	});
	//define another module
	module.declare('b.module',function(require,exports,module){
	    console.log('--b.module--');
		exports.foo='b.module';
	});
	//define a component module,same as the file name
	module.declare('component',function(require,exports,module){
		var a=require('a.module'),
			b=require('b.module');
		//console.log(a.foo);
		//console.log(b.foo);
		console.log('--component--');
		
		exports.foo='component module';
	});
})();