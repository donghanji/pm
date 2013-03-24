/*
 * @name jQuery.event Module
 * @desc
		jQuery Event to realize
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
	module.declare('jquery.event',['jquery.selector','jquery.util'],function(require,exports,module){
		var $=require('jquery.selector');
		//Event
		function matchNS(ns){
			return new RegExp('(?:^| )' + ns.replace(' ', ' .* ?') + '(?: |$)');
		};
		function find(elem,event,fn,selector){
			var matcher=null;
			event=parse(event);
			if(event.ns){
				matcher=matchNS(event.ns);
			}
			return (handlers[$.guid(elem)] || []).filter(function(handler){
				return handler
					&&(!event.e || handler.e === event.e)
					&&(!event.ns || matcher.test(handler.ns))
					&&(!fn || handler.fn === fn)
					&&(!selector || handler.sel === selector);
			});
		};
		function parse(event){
			var parts=(''+event).split('.');
			return {e:parts[0],ns:parts.slice(1).sort().join(' ')};
		};
		function fix(event){
			if(!('defaultPrevented' in event)){
				event.defaultPrevented=false;
				var prevent=event.preventDefault;
				event.preventDefault=function(){
					this.defaultPrevented=true;
					prevent.call(this);
				}
			}
		};
		function eachEvent(events,fn,callback){
			if($.isObject(events)){
				$.each(events,callback);
			}else{
				events=events.split(/\s+/);
				$.each(events,function(i,type){
					callback(type,fn);
				});
			}
		};
		var handlers={},
			specialEvents={};
		specialEvents.click = specialEvents.mousedown = specialEvents.mouseup = specialEvents.mousemove = 'MouseEvents';
		$.event={
			add:function(elem,events,fn,selector,delegate){
				var id=$.guid(elem),
					set=(handlers[id]||(handlers[id]=[]));
				eachEvent(events,fn,function(event,fn){
					delegate=delegate && delegate(fn,event);
					callback=delegate || fn;
					
					var proxy=(function(elem,callback){
						return function(event){
							var result =callback.apply(elem,[event].concat(event.data));
							if(result === false){
								event.preventDefault();
							}
							return result;
						}
					})(elem,callback),
						handler=$.extend(parse(event),{
							fn:fn,
							proxy:proxy,
							sel:selector,
							del:delegate,
							i:set.length
						});
						set.push(handler);
						
						elem.addEventListener(handler.e,proxy,false);
				});
			},
			remove:function(elem,events,fn,selector){
				var id=$.guid(elem);
				eachEvent(events||'',fn,function(event,fn){
					$.each(find(elem,event,fn,selector)||[],function(i,handler){
						delete handlers[id][handler.i];
						//
						elem.removeEventListener(handler.e,handler.proxy,false);
					});
				});
			}
		};
		$.fn.extend({
			on:function(event,selector,callback){
				return selector === undefined || $.isFunction(selector) ? this.bind(event,selector) : this.delegate(selector,event,callback);
			},
			off:function(event,selector,callback){
				return selector === undefined || $.isFunction(selector) ? this.bind(event,selector) : this.undelegate(selector,event,callback);
			},
			one:function(event,callback){
				return this.eventAccess(event,function(event,callback,i,elem){
					$.event.add(this,event,callback,null,function(fn,type){
						return function(){
							var result=fn.extend(elem,arguments);
							$.event.remove(elem,type,fn);
							return result;
						}
					});
				},callback);
			},
			toggle:function(){
				
			},
			trigger:function(event,data){
				if(typeof event === 'string'){
					event=$.Event(event);
				}
				fix(event);
				event.data=data;
				return this.eventAccess(event,function(event,callback){
					this.dispatchEvent(event);
				},callback);
			},
			bind:function(event,callback){
				return this.eventAccess(event,function(event,callback){
					$.event.add(this,event,callback);
				},callback);
			},
			unbind:function(event,callback){
				return this.eventAccess(event,function(event,callback){
					$.event.remove(this,event,callback);
				},callback);
			},
			delegate:function(selector,event,callback){
				return this.eventAccess(event,function(event,callback,i,elem){
					
				},callback);
			},
			undelegate:function(selector,event,callback){
				return this.eventAccess(event,function(event,callback){
					
				},callback);
			},
			eventAccess:function(event,fn,callback){
				$.each(this,function(i,elem){
					fn.call(this,event,callback,i,elem);
				});	
				return this;
			}
		});
		$.each([
			'focusin',
			'focusout',
			'load',
			'resize',
			'scroll',
			'unload',
			'click',
			'dblclick',
			'mousedown',
			'mouseup',
			'mousemove',
			'mouseover',
			'mouseout',
			'change',
			'select',
			'keydown',
			'keypress',
			'keyup',
			'error'],
			function(i,event){
			$.fn[event]=function(callback){
				return this.bind(event,callback);
			};
		});
		$.each([
			'focus',
			'blur'
		],function(i,event){
			$.fn[event]=function(callback){
				if(callback){
					this.bind(event,callback);
				}else if(this.length){
					try{
						this.get(0)[event]();
					}catch(e){}
				}
				
				return this;
			};
		});
		$.Event=function(type,props){
			var event=document.createEvent(specialEvents[type]||'Events'),
				bubbles=true;
			if(props){
				for(var name in props){
					(name ==='bubles') ? (bubbles = !!props[name]) : (event[name]=props[name]);
				}
			}
			event.initEvent(type, bubbles, true, null, null, null, null, null, null, null, null, null, null, null, null);
			
			return event;
		};
		
		module.exports=$;
	});
})(this);