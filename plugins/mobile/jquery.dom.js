/*
 * @name jQuery.dom Module
 * @desc
		jQuery Dom to realize
 *
 */
 
(function(global,undefined){
	if(module.declare === undefined){
		throw 'There is no global module.declare method!';
	}
	module.alias({
		'jquery.selector':'{mobile}/jquery.selector',
		'jquery.util':'{mobile}/jquery.util'
	});
	//define jquery.dom module
	module.declare('jquery.dom',['jquery.selector','jquery.util'],function(require,exports,module){
		var $=require('jquery.selector'),
			$util=require('jquery.util');
		$.fn.extend({
			find:function(selector){
				var context=this[0];
				
				return $(selector,context);
			},
			get:function(index){
				var length=this.length;
				if(index <= length && index > -1){
					return this[index];
				}
				return null;
			},
			eq:function(index){
				return $(this.get(index));
			},
			append:function(){
				return this.domManip(arguments,true,function(el){
					if(this.nodeType === 1){
						this.appendChild(el);
					}
				});
			},
			clone:function(){
				return this.access(this,function(){
					return this.cloneNode(true);
				});
			},
			
			empty:function(){
				for(var i=0,el;(el=this[i]) != null;i++){
					//数据处理
					while(el.firstChild){
						el.removeChild(el.firstChild);
					}
				}
				return this;
			},
			remove:function(){
				for(var i=0,el;(el=this[i]) != null;i++){
					//数据处理
					if(el.parentNode){
						el.parentNode.removeChild(el);
					}
				}
				
				return this;
			},
			//$对象到dom对象的操作
			domManip:function(args,table,callback){
				var value=args[0],
					i=0,
					len=this.length,
					j=0,
					vlen=0;
				if(len && value != undefined){
					if($.type(value) === 'string'){
						if(value.charAt(0) === "<" && value.charAt( value.length - 1 ) === ">" && value.length >= 3){
							value=$(value);
						}
					}
					for(;i<len;i++){
						if(value instanceof $){
							vlen=value.length;
							for(;j<vlen;j++){
								callback.call(this[i],value[j]);
							}
						}else{
							value=document.createTextNode(value);
							callback.call(this[i],value);
						}
					}
					
				}
				
				return this;
			},
			//直接操作dom对象
			access:function(elems,fun,key,value,len){
				var i=0,
					l=elems.length;
				if(key === null && value === undefined || (len === 1 && $.type(key) !=='object' && $.type(value) !=='object')){
					return fun.call(elems[0],key,value);
				}
				for(;i<l;i++){
					fun.call(elems[i],key,value);
				}
				
				return this;
			}
		});
		
		//筛选
		$.each({
			parent:function(el){
				var parent=el.parentNode;
				return parent && parent.nodeType !==11 ? parent : null;
			},
			next:function(el){
				var next=el.nextElementSibling;
				return next && next.nodeType !== 11 ? next : null;
			},
			prev:function(el){
				var prev=el.previousElementSibling;
				return prev && prev.nodeType !== 11 ? prev : null;
			}
		},function(name,fn){
			$.fn[name]=function(){
				var i=0,
					len=this.length;
				//暂时针对this[0]
				return $(fn.call(this,this[0]));
			};
		});
		
		module.exports=$;
	});
})(this);