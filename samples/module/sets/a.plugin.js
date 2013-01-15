(function(){
	/*
	module.sets({
		'a.plugin':{
			'time':1000
		}
	});
	*/
	/**/
	module.sets({
		'a.plugin':{
			'time':1000
		}
	});
	
	module.declare('a.plugin',function(require,exports){
	    var sets=module.sets('a.plugin');
		//
		console.log('this default time is 1000,but output:'+sets['time']);
	});
})();