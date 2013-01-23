(function(){
	module.alias({
		'jquery.module':'{modules}/jquery.module'
	});
	module.globals({
		'$':'jquery.module'
	});
	module.declare('a.plugin',['jquery.module'],function(require,exports){
	    var $name=module.globals()['$'];//module.globals('$');
		var $=require($name);
		//
		console.log($name);
	});
})();