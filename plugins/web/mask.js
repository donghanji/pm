/*
 * @name Mask Module
 * @desc
 		this mask module is not perfect,
		is only a mask layout, not as a container,don't set the container property
		especially on IE(=<9) and Firefox(css3-display:box;position:absolute; make abnormal)
 *
 */
(function(){
	if(module.declare === undefined){
		throw 'There is no global module.declare method!';
	}
	module.sets({
		'mask':{
			id:'',
			time:'',//auto hidden time
			text:'',//show text
			auto:true,//auto show
			cls:'mask',//class
			opacity:1,//opacity
			zIndex:9999,//z-index
			container:null,//
			renderTo:''
		}
	});
	module.declare('mask',function(require,exports){
		var toString=Object.prototype.toString,
		class2type = {};
		/*
		 * @name Util Class
		 *
		 */
		function Util(){};
		Util.prototype={
			type:function(value){
				return value == null ?
					String(value) :
					class2type[toString.call(value)] || 'object';
			},
			each:function(object,callback){
				var i=0,
					len=object.length,
					isObj = len === undefined ||this.type(object) === 'function';
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
			},
			extend:function(){
				var options,
					target=arguments[0]||{},
					length=arguments.length,
					i=1;
				if(length === i){
					target=this;
					--i;
				}
				for(;i<length;i++){
					options=arguments[i];
					if(typeof options === 'object'){
						for(var name in options){
							target[name]=options[name];
						}
					}
				}
				
				return target;
			}
		};
		var $util=new Util();
		$util.each("Boolean,Number,String,Function,Array,Date,RegExp,Object".split(","), function(i, name) {
			class2type[ "[object " + name + "]" ] = name.toLowerCase();
		});
		var $create=function(name){
				name=name||'div';
				
				return document.createElement(name);
			},
			$id=function(id){
				
				return document.getElementById(id);
			},
			$html=function(el,value){
				if (value !== undefined && el.nodeType === 1 ) {
					el.innerHTML=value;
				}else{
					return el.innerHTML;
				}
			},
			$css=function(el,css){
				if($util.type(css) === 'object'){
					for(var key in css){
						el.style[key]=css[key];
					}
				}
			},
			$hasClass=function(el,cls){
				if(el.nodeType === 1 && (' '+el.className+' ').replace(/[\n\t\r]/g,'').indexOf(cls) > -1){
					
					return true;
				}
				return false;
			},
			$addClass=function(el,cls){
				if(el.nodeType === 1 && !$hasClass(el,cls)){
					el.className=(el.className+' '+cls).trim();
				}
			},
			$append=function(dom,el){
				dom.appendChild(el);
			};
		var $set=module.sets('mask');//mask options
		/*
		 * Mask Class
		 */
		function Mask(options){
			options=options||{};
			var conf=$util.extend({},$set,options),
				id=conf.id,
				time=conf.time,
				cls=conf.cls,
				text=conf.text,
				auto=conf.auto === false ? false : true,
				opacity=conf.opacity||1,
				zIndex=conf.zIndex||9999,
				container=conf.container,
				renderTo=conf.renderTo||document.body;
			renderTo=$util.type(renderTo) === 'string' ? document.getElementById(renderTo) : renderTo; 
			this.container=$create('div');
			if(id){
				this.container.id=id;
			}
			if(cls){
				$addClass(this.container,conf.cls);
			}
			if(text && !container){
				var div=$create('div');
				$html(div,text);
				$addClass(div,'loading');
				$append(this.container,div);
			}
			if(container){
				$util.type(container) === 'string' ? $html(this.container,container) : $append(this.container,container);
			}
			var display=auto ? '' : 'none';
			$css(this.container,{'opacity':opacity,'z-index':zIndex,'display':display});
			$append(renderTo,this.container);
		};
		Mask.prototype={
			show:function(){
				this.container.style.display='';
			},
			hide:function(){
				this.container.style.display='none';
			},
			remove:function(){
				var el=this.container;
				if(el.parentNode){
					el.parentNode.removeChild(el);
				}
			}
		};
		
		return Mask;
	});
})();