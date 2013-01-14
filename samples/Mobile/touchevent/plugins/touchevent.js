/*
 * @name TouchEvent Module
 * @desc
 		touch event,tuchdown/up/on/press/move
		events are bound to $ object,like this:
		$('').touchon(function(){
			//
		});
		
 * @dependencies
 		os module
		zepto.module ,this is the default item,can be reset
 */
;(function(undefined){
	if(module.declare === undefined){
		throw 'There is no global module.declare method!';
	}
	module.alias({
		'zepto.module':'{modules}/zepto.module',
		'os':'{plugins}/os'
	});
	module.globals({
		'$':'zepto.module'
	});
	module.sets('touchevent',{
		pressTime:1000,//long click time
		delayTime:0,//click delay time
		offsetTime:200,//offset time
		eventListenerZone:document//Event monitoring area
	});
	var globals=module.globals(),
		$name=globals['$'];
	//define touchevent module
	module.declare('touchevent',['os',$name],function(require,exports){
		var os=require('os'),
			$=require($name),
			sets=module.sets('touchevent');
			
		var handEvent=['down','up','on','press','move'];
		var desktop=os.desktop;
		var eventName=desktop ? 'HTMLEvents' : 'TouchEvent',
			touchName='touch',
			el=sets.eventListenerZone||document;
		
		var START_EV=desktop ? 'mousedown' : 'touchstart',
			MOVE_EV=desktop ? 'mousemove' : 'touchmove',
			END_EV=desktop ? 'mouseup' : 'touchend';
		//touch event binding mechanism
		function TouchBind($){
			/*
			 * down	: touch down
			 * up	: touch up
			 * on	: touch on
			 * press: touch press
			 * move	: touch move
			 *
			 */
			$.fn.eventAccess=function(elems,fun,name,fn){
				var i=0,
					l=elems.length;
				for(;i<l;i++){
					fun.call(elems[i],name,fn);
				}
				
				return this;
			};
			$.each(handEvent,function(index,name){
				$.fn[touchName+name]=function(fn,bubbles,cancelable){
					cancelable=cancelable ===undefined ? true : cancelable;
				bubbles=bubbles === true ? true : false;
					
					return this.eventAccess(this,function(name,fn){
						var evtName=touchName+name;
						if(fn == null){
							//directly trigger
							this.dispatchEvent(this.event[evtName]);
							return;
						}
						var _this=this,
							evt=document.createEvent(eventName);
						
						_this.bubbles=bubbles;//bubbles
						_this.addEventListener(evtName,fn,bubbles);
						
						new EventManager(_this,evtName,fn);//event regist
					},name,fn);
				}
			});
			$.fn.unbindtouch=function(name, fn){
				return this.eventAccess(this,function(name,fn){
					(function(el){
						var t=setTimeout(function(){
							clearTimeout(t);
							EventManager.remove(el,name,fn);
						});
					})(this);
				},name,fn);
			};
		};
		//touch event realization mechanism
		function TouchEvent(el){
			if(typeof el === 'string'){
				el=document.getElementById(el);	
			}
			el.addEventListener(START_EV,this,true);
		};
		TouchEvent.prototype={
			dx:0,
			dy:0,
			cx:0,
			cy:0,
			isInPressTime:true,
			isInDelayTime:true,
			triggered:false,
			moved:false,
			pressTimeout:null,
			delayTimeout:null,
			handleEvent:function(e){
				var target=e.target;
				if(target.nodeType === 3){//text node
					target=target.parentNode;
				}
				this.prevTarget=target;
				this.triggered=false;
				while(target.nodeType !== 9){
					if(EventManager.isIn(target)){
						this[e.type].call(this,e,target);
						if(target.bubbles){//don't bubbles
							return;	
						}
					}
					target=target && target.parentNode ? target.parentNode : document;
				}
			},
			mousedown:function(e,target){
				this.touchstart(e,target);
			},
			mousemove:function(e,target){
				this.touchmove(e,target);
			},
			mouseup:function(e,target){
				this.touchend(e,target);
			},
			touchstart:function(e,target){
				var down=touchName+'down';
				//trigger touch down event
				EventManager.dispatch(target,down,e);
				
				var _this=this;
				this.isInPressTime=true;
				this.moved=false;
				
				//long time according to
				if(this.pressTimeout === null){
					var ptime=sets.pressTime;
					ptime=ptime-sets.offsetTime;
					ptime=ptime > 0 ? ptime : 0;
					_this.pressTimeout=setTimeout(function(){
						_this.isInPressTime=!_this.isInPressTime;
						if(!_this.isInPressTime && !_this.moved){
							var press=touchName+'press'
							//trigger touch press event
							EventManager.dispatch(target,press,e);
						}
						clearTimeout(_this.pressTimeout);
						_this.pressTimeout=null;
					},ptime);
				}
				
				//delay time
				if(this.delayTimeout === null){
					var dtime=sets.delayTime;
					dtime=dtime-sets.offsetTime;
					dtime=dtime > 0 ? dtime : 0;
					_this.delayTimeout=setTimeout(function(){
						_this.isInDelayTime=true;
						clearTimeout(_this.delayTimeout);
						_this.delayTimeout=null;
					},dtime);
				}
				
				document.addEventListener(MOVE_EV, this, true);
				document.addEventListener(END_EV, this, true);
			},
			touchmove:function(e,target){
				this.moved=true;
				//moving ,not long press
				this.isInPressTime=true;
				//trigger touch move event
				var move=touchName+'move';
				EventManager.dispatch(target,move,e);
			},
			touchend:function(e,target){
				//remove event listener
				document.removeEventListener(MOVE_EV, this, false);
				document.removeEventListener(END_EV, this, false);
				var theEvent = null;
				this.moved=desktop ? false : this.moved;
				
				if(this.isInPressTime || this.moved){
					var up=touchName+'up'
					//trigger touch up event
					EventManager.dispatch(target,up,e);
				}
				if(this.isInPressTime && this.isInDelayTime && !this.moved){
					var on=touchName+'on';
					if(target === this.prevTarget && !this.triggered){
						this.isInDelayTime=false;//
					}
					//trigger touch on event
					EventManager.dispatch(target,on,e);
				}
	
				clearTimeout(this.pressTimeout);//clear long press time
				this.pressTimeout=null;
				this.triggered=true;
			}
		};
		//event bind
		TouchBind($);
		//add event listeners
		new TouchEvent(el);
	});
	// is empty object
	function isEmptyObject(obj){
		for(var name in obj){
			return false;
		}
		
		return true;
	};
	/*
	 * Event Manager
	 */
	function EventManager(el,name,fn){
		if(el === undefined || el === null){
			
			return ;
		}
		el[EventManager.expando]=el[EventManager.expando]||EventManager.gid++;
		
		EventManager.regist(el,name,fn);
	};
	//event regist
	EventManager.regist=function(el,name,fn){
		if(typeof fn !== 'function'){
			
			return ;
		}
		var gid=el[EventManager.expando];
		EventManager.Event[gid]=EventManager.Event[gid]||{};
		EventManager.Event[gid][name]=EventManager.Event[gid][name]||[];
		EventManager.Event[gid][name].push(fn);
	};
	//event remove
	EventManager.remove=function(el,name,fn){
		name='touch'+name;
		var gid=el[EventManager.expando],
			evt=EventManager.get(el,name,fn);
		if(evt && el){
			//to remove a group of events
			if(fn === undefined){
				if(EventManager.Event[gid] && EventManager.Event[gid][name]){
					delete EventManager.Event[gid][name];
				}
				evt.forEach(function(fun,index){
					el.removeEventListener(name,fun,false);
				});
				
				return ;
			}
			var i=evt['index'];
			//to remove an event
			EventManager.Event[gid][name].splice(i,1);
			el.removeEventListener(name,fn,false);
		}
	};
	//get the event object
	EventManager.get=function(el,name,fn){
		var gid=el[EventManager.expando];
		if(gid === undefined || gid === null){
			
			return ;
		}
		if(!(EventManager.Event[gid] && EventManager.Event[gid][name])){
			
			return ;
		}
		//returns a set of events
		if(fn === undefined){
			
			return EventManager.Event[gid][name];
		}
		//returns an event
		var i=0,
			len=EventManager.Event[gid][name].length;
		for(;i<len;i++){
			if(EventManager.Event[gid][name][i] === fn){
				
				return {index:i,fn:fn};
			}
		}
		
		return ;
	};
	//event dispatch
	EventManager.dispatch=function(el,type,e){
		var fn=EventManager.get(el,type);
		fn&&fn.forEach(function(fun,index){
			fun.call(el,e);
		});
	};
	//whether the event is in the Event Manager
	EventManager.isIn=function(el){
		var gid=el[EventManager.expando];
		
		return EventManager.Event[gid] ? true : false;
	};
	//event container
	/*
	 * event storage way
	   {
	   		gid:{
				touchname:[]
			}
	   }
	 */
	EventManager.Event={};
	//unique field attribute
	EventManager.expando='pmTouchEvent'+(''+Math.random()).replace( /\D/g,'');
	//global id
	EventManager.gid=1;
})();