/*
 * @name jQuery.util Module
 * @desc
		jQuery util to realize
 *
 */
(function(global,undefined){
	if(module.declare === undefined){
		throw 'There is no global module.declare method!';
	}
	module.alias({
		'jquery.selector':'{mobile}/jquery.selector'
	});
	//define jquery.util module
	module.declare('jquery.util',['jquery.selector'],function(require,exports,module){
		var $=require('jquery.selector');
		var class2type = {},
			toString=Object.prototype.toString,
			guid=1;//全局唯一标记
		$.extend({
			guid:function(el){
				return el.guid || (el.guid=guid++);
			},//全局唯一标记
			trim:function(value){
				value=value||'';
				return value.trim();
			},
			type:function(value){
				return value == null ?
					String(value) :
					class2type[toString.call(value)] || 'object';
			},
			isNumeric:function(value){
				return !isNaN(parseFloat(value)) && isFinite(value);
			},
			isFunction:function(value){
				return $.type(value) === 'function';
			},
			isObject:function(value){
				return $.type(value) === 'object';
			},
			isArray:function(value){
				return $.type(value) === 'array';
			},
			each:function(object,callback){
				var i=0,
					len=object.length,
					isObj = len === undefined ||$.isFunction(object);
				if(isObj){
					for(var name in object){
						if(callback.call(object[name],name,object[name]) === false){
							break;
						}
					}
				}else{
					for(;i<len;){
						if(callback.call(object[i],i,object[i++]) === false){
							break;
						}
					};
				}
			}
		});
		$.each("Boolean,Number,String,Function,Array,Date,RegExp,Object".split(","), function(i, name) {
			class2type[ "[object " + name + "]" ] = name.toLowerCase();
		});
		
		module.exports=$;
	});
})(this);