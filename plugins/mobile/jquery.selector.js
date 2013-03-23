/*
 * @name jQuery.selector Module
 * @desc
		jQuery Selector to realize
 *
 */
(function(global,undefeined){
	if(module.declare === undefined){
		throw 'There is no global module.declare method!';
	}
	//selector regular expressions
	var Exp_SELECTOR={
		ID:/#((?:[\w\u00c0-\uFFFF\-]|\\.)+)/,
		CLASS: /\.((?:[\w\u00c0-\uFFFF\-]|\\.)+)/,
		NAME: /\[name=['"]*((?:[\w\u00c0-\uFFFF\-]|\\.)+)['"]*\]/,
		TAG: /^((?:[\w\u00c0-\uFFFF\*\-]|\\.)+)/,
		OTHER:/[,\+>~\s+]/,
		CREATETAG:/^<(\w+)\s*\/?>(?:<\/\1>)?$/,
		FRAGMENT:/^\s*<(\w+)[^>]*>/
	};
	//define jquery.selector module
	module.declare('jquery.selector',function(require, exports, module){
		var _$=function(selector,context){
			return new _$.fn.init(selector,context);
		},
		toString=Object.prototype.toString,
		hasOwn=Object.prototype.hasOwnProperty,
		slice=Array.prototype.slice,
		push=Array.prototype.push,
		indexOf=Array.prototype.indexOf,
		
		
		tr_el=document.createElement('tr'),
		table_el=document.createElement('table'),
		containers={
			'tr':	document.createElement('tbody'),
			'tbody':table_el,
			'thead':table_el,
			'tfoot':table_el,
			'th':	tr_el,
			'td':	tr_el,
			'*':	document.createElement('div')
		};
		
		_$.fn=_$.prototype={
			constructor:_$,
			length:0,
			size:function(){
				return this.length;
			},
			slice:[].slice,
			init:function(selector,context){
				//console.log(context);
				context = context || document;
				this.length=0;
				//console.dir('--this--');
				if(!selector){
					return this;
				}
				//console.log('--$--');
				if(selector.constructor === this.constructor){
					return selector;
				}
				//console.log('--DOM--');
				if(selector.nodeType){
					this.context=this[0]=selector;
					this.length=1;
					return this;
				}
				//console.log('--window--');
				if(selector != null && selector == selector.window){
					this.context=window;
					this[0]=window;
					this.length=1;
					return this;
				}
				//console.log('--BODY--');
				if(selector === 'body' && !context && document.body){
					this.context=document;
					this[0]=document.body;
					this.selector=selector;
					this.length=1;
					return this;
				}
				//console.log('--Create DOM--');
				if(typeof selector === 'string'){
					if ( selector.charAt(0) === "<" && selector.charAt( selector.length - 1 ) === ">" && selector.length >= 3 ) {
						var ret=Exp_SELECTOR.CREATETAG.exec(selector),
							frag=null,
							dom=null,
							doc=null;
						    context=context instanceof _$ ? context[0] : context;
							doc=context.ownerDocument || context;
						//single element
						if(ret && ret.length > 1){
							dom=doc.createElement(ret[1]);
						}else{
							//multi element
							frag=Exp_SELECTOR.FRAGMENT.exec(selector);
							var container=null,
							    tag=frag[1];
							
							if(!(tag in containers)){
								tag='*';
							}
							container=containers[tag];
							container.innerHTML=''+selector;
							dom=(this.slice.call(container.childNodes))[0];
						}
						//console.dir(dom);	
						this.context=dom;
						this.selector=selector;
						this[0]=dom;
						this.length=1;
						
						return this;
					}
				}
				//console.log('--ID--');
				if(Exp_SELECTOR.ID.test(selector) && !Exp_SELECTOR.OTHER.test(selector)){
					this.context=context;
					var id=selector.match(Exp_SELECTOR.ID)[1];
					this[0]=context.getElementById(id);
					if(this[0]){
						this.length=1;
						return this;
					}
					return this;
				}
				
				//console.log('--CLASS--');
				if(Exp_SELECTOR.CLASS.test(selector) && !Exp_SELECTOR.OTHER.test(selector)){
					this.context=context;
					var className=selector.match(Exp_SELECTOR.CLASS)[1],
						dom=context.getElementsByClassName(className);
					_$.extend(this,dom);
					this.length=dom.length;
					return this;
				}
				//console.log('--Name--');
				if(Exp_SELECTOR.NAME.test(selector) && !Exp_SELECTOR.OTHER.test(selector)){
					this.context=context;
					var name=selector.match(Exp_SELECTOR.NAME)[1],
						dom=context.getElementsByName(name);
					_$.extend(this,dom);
					this.length=dom.length;
					return this;
				}
				//console.log('--TAG--');
				if(Exp_SELECTOR.TAG.test(selector) && !Exp_SELECTOR.OTHER.test(selector)){
					this.context=context;
					var tag=selector.match(Exp_SELECTOR.TAG)[1],
						dom=context.getElementsByTagName(tag);
					_$.extend(this,dom);
					this.length=dom.length;
					return this;
				}
				//console.log('--OTHER--');
				this.context=context;
				var dom=context.querySelectorAll(selector);//
				_$.extend(this,dom);
				this.length=dom.length;
				
				return this;
			}
		};
		_$.fn.init.prototype=_$.fn;
		
		_$.extend=_$.fn.extend=function(){
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
		};
		
		module.exports=_$;
	});
})(this);