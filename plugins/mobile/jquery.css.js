/*
 * @name jQuery.css Module
 * @desc
		jQuery CSS to realize
 *
 */
 
(function(global,undefined){
	if(module.declare === undefined){
		throw 'There is no global module.declare method!';
	}
	module.alias({
		'jquery.selector':'{mobile}/jquery.selector'
	});
	//define jquery.css module
	module.declare('jquery.css',['jquery.selector'],function(require,exports,module){
		var $=require('jquery.selector');
		$.fn.extend({
			getComputedStyle:function(el,name){
				return document.defaultView.getComputedStyle(el)[name];
			},
			style:function(elem,name,value){
				if ( !elem || elem.nodeType === 3 || elem.nodeType === 8 || !elem.style ) {
					return;
				}
				if(value === undefined){
					return parseFloat(this.getComputedStyle(elem,name))||0;
				}else{
					elem.style[name]=Exp_OTHER.NUM.test(value) ? value+'px' : value;
				}
				return this;
			},
			height:function(key,value){
				var _this=this;
				return this.access(this,function(key,value){
					return _this.style(this,'height',value);
				},null,key,arguments.length);
			},
			width:function(key,value){
				var _this=this;
				return this.access(this,function(key,value){
					return _this.style(this,'width',value);
				},null,key,arguments.length);
			},
			css:function(key,value){
			   return this.access(this,function(key,value){
					if($.type(key) === 'string' && $.type(value) !== 'string'){
						return this.style[key];
					}else{
						if($.type(key) === 'string'){
							this.style[key]=value;
						}
						if($.type(key) === 'object'){
							value=key;
							for(var key in value){
								this.style[key]=value[key];
							}
						}
					}
				},key,value,arguments.length);
			},
			show:function(){
				//
				var el=this[0]||_$(this.selector);
				el.style.display='block';
				
				return this;
			},
			hide:function(){
				//
				var el=this[0]||_$(this.selector);
				el.style.display='none';
				
				return this;
			}
		});
		
		module.exports=$;
	});
})(this);