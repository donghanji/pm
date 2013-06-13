(function(){
	/*
	module.defaults({
		'a.plugin':{
			'time':1000
		}
	});
	*/
	/**/
	module.defaults({
		'a.plugin':{
			'time':1000
		}
	});
	
	module.declare('a.plugin',function(require,exports){
	    var defaults=module.defaults('a.plugin');
		//
		console.log('this default time is 1000,but output:'+defaults['time']);
	});
})();