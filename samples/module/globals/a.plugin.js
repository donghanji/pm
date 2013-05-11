(function(){
	module.alias({
		'jquery.module':'{modules}/jquery.module'
	});
	module.globals({
		'$':'jquery.module'
	});
	var $name=module.globals()['$'];//module.globals('$');
	module.declare('a.plugin',[$name],function(require,exports){
	   
		var $=require($name);
		//
		console.log($name);
		console.dir($);
	});
})();