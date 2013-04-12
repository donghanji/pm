/*
 * @name Slide Module
 * @desc 幻灯片模块
	设计原则：
	|目前该模块针对ihere进行设计，所以不属于通用插件
	|目前只支持静态数据
	|为了快速开发，依赖jquery插件
	|提供几种基本的动画，通过参数effect设置：effect:'scrollX|scrollY|fade|animate',其中animate允许你自定义动画，通过showIn:{},showOut:{}
	
	使用介绍：
	第0步，页面结构：
	<div id="slide_target">
		<div class="slide_box"><!--这一层，通常要设置：position:relative;overflow:hidden;width:400px;height:300px;-->
			<ul class="slide_con">
				<li></li>
				   ...
			</ul>
		</div>
		<ul class="slide_nav">
			<li></li>
			   ...
		</ul>
	</div>
	第一步，得到slide模块API：
	slide=require('slide');
	第二步，方法调用：
	slide.load({
		target:'',
		
	});
 *
 */
(function(){
	if(module.declare === undefined){
		throw 'There is no global module.declare method!';
	}
		//获取全局$对象名
	var $name=module.globals('$');
	if(!$name){
		
		throw 'There must be a $,such as jquery.';
	}
	var effectLoop={
		scroolLeft:function(contentObj,navObj,i,slideW,opts,callback){
			contentObj.animate({'left':-i*opts.steps*slideW},opts.speed,callback);
			if (navObj) {
				navObj.eq(i).addClass('on').siblings().removeClass('on');
			}
		},
		scroolRight:function(contentObj,navObj,i,slideW,opts,callback){
			contentObj.stop().animate({'left':0},opts.speed,callback);
		}
	},
	effect={
		//自定义动画
		animate:function(contentObj,navObj,i,slideW,opts){
			var zIndex=opts.zIndex+1,
				showIn=opts.showIn||{opacity:1},
				showOut=opts.showOut||{opacity: 0};
			contentObj.children().eq(i).stop().animate(showIn,opts.speed).css({'z-index': zIndex}).siblings().animate(showOut,opts.speed).css({'z-index':zIndex});
			navObj.eq(i).addClass('on').siblings().removeClass('on');
		},
		//fade动画
		fade:function(contentObj,navObj,i,slideW,opts){
			opts.showIn={opacity:1};
			opts.showOut={opacity:0};
			effect.animate(contentObj,navObj,i,slideW,opts);
		},
		//字体滚动
		scroolTxt:function(contentObj,undefined,i,slideH,opts){
			contentObj.animate({'margin-top':-opts.steps*slideH},opts.speed,function(){
                for( var j=0;j<opts.steps;j++){
                	contentObj.find('li:first').appendTo(contentObj);
                }
                contentObj.css({'margin-top':'0'});
            });
		},
		//水平滚动
		scrollX:function(contentObj,navObj,i,slideW,opts,callback){
			contentObj.stop().animate({'left':-i*opts.steps*slideW},opts.speed,callback);
			if (navObj) {
				navObj.eq(i).addClass('on').siblings().removeClass('on');
			}
		},
		//垂直滚动
		scrollY:function(contentObj,navObj,i,slideH,opts){
			contentObj.stop().animate({'top':-i*opts.steps*slideH},opts.speed);
			if (navObj) {
				navObj.eq(i).addClass('on').siblings().removeClass('on');
			}
		}
	};
	//define slide module
	module.declare('slide',[$name],function(require,exports){
		var $=require($name);
		function Slide(options){
			this.def={
				target:'',//最外层目标对象
				effect: 'scrollY',//动画效果
				auto:true,//是否自动
				speed: 'normal',//速度
				timer: 3000,//时间
				width:0,//目标对象宽度
				height:0,//目标对象高度，对于某些不能正常获取高宽度的情况，可使用该参数
				zIndex:1,//z-index
				clsNav:'slide_nav',//导航包裹层class
				clsCon:'slide_con',//内容包裹层class
				steps:1
			};
			options=options||{};
			this.opts=$.extend(this.def,options);
			this.target=options.target;
			if(!this.target){
				throw 'There must have a container object.';
			}
			this.target=typeof this.target === 'string' ? $(this.target) : this.target;//目标对象
			this.targetLi = this.target.find('.' + this.opts.clsNav).children();//目标导航对象
			this.clickNext = this.target.find('.' + this.opts.clsNav + ' .next');//点击下一个按钮
			this.clickPrev = this.target.find('.' + this.opts.clsNav + ' .prev');//点击上一个按钮
			this.ContentBox = this.target.find('.' + this.opts.clsCon );//滚动的对象
			this.ContentBoxNum=this.ContentBox.children().size();//滚动对象的子元素个数
			var slideH=this.opts.height||this.ContentBox.children().first().height(),//滚动对象的子元素个数高度，相当于滚动的高度
				slideW=this.opts.width||this.ContentBox.children().first().width();//滚动对象的子元素宽度，相当于滚动的宽度
			this.autoPlay=null;
			this.slideWH;
			this.zIndex=this.opts.zIndex||1;
			this.index=1;
			if(this.opts.effect === 'scrollY' || this.opts.effect === 'scroolTxt'){
				this.slideWH=slideH;
			}else if(this.opts.effect === 'scrollX' || this.opts.effect === 'scroolLoop'){
				this.ContentBox.css('width',this.ContentBoxNum*slideW);
				this.slideWH=slideW;
			}else if(this.opts.effect === 'fade' || this.opts.effect === 'animate'){
				this.ContentBox.children().css({'position':'absolute'});
				this.ContentBox.first().css('z-index',this.zIndex);
			}
			var $this=this.target,
				_this=this;
			//滚动函数
			this.doPlay=function(){
				effect[_this.opts.effect](_this.ContentBox, _this.targetLi, _this.index, _this.slideWH, _this.opts);
				_this.index++;
				if (_this.index*_this.opts.steps >= _this.ContentBoxNum) {
					_this.index = 0;
				}
			};
			//下一条
			_this.clickNext.click(function(event){
				effectLoop.scroolLeft(_this.ContentBox, _this.targetLi, _this.index, _this.slideWH, _this.opts,function(){
					for(var i=0;i<_this.opts.steps;i++){
	                    _this.ContentBox.find('li:first',$this).appendTo(_this.ContentBox);
	                }
	                _this.ContentBox.css({'left':'0'});
				});
				event.preventDefault();
			});
			//上一条
			_this.clickPrev.click(function(event){
				for(var i=0;i<_this.opts.steps;i++){
	                _this.ContentBox.find('li:last').prependTo(_this.ContentBox);
	            }
	          	_this.ContentBox.css({'left':-_this.index*_this.opts.steps*slideW});
				effectLoop.scroolRight(_this.ContentBox, _this.targetLi, _this.index, _this.slideWH, _this.opts);
				event.preventDefault();
			});
			//自动播放
			if (_this.opts.auto) {
				_this.autoPlay = setInterval(_this.doPlay, _this.opts.timer);
				_this.ContentBox.hover(function(){
					if(_this.autoPlay){
						clearInterval(_this.autoPlay);
					}
				},function(){
					if(_this.autoPlay){
						clearInterval(_this.autoPlay);
					}
					_this.autoPlay=setInterval(_this.doPlay, _this.opts.timer);
				});
			}
			if(_this.clickNext.length || _this.clickPrev.length){
				
				return;
			}
			//目标事件
			_this.targetLi&&_this.targetLi.hover(function(){
				if(_this.autoPlay){
					clearInterval(_this.autoPlay);
				}
				_this.index=_this.targetLi.index(this);
				window.setTimeout(function(){effect[_this.opts.effect](_this.ContentBox, _this.targetLi, _this.index, _this.slideWH, _this.opts);},200);
			},function(){
				if(this.autoPlay){
					clearInterval(_this.autoPlay);
				}
				_this.autoPlay = setInterval(_this.doPlay, _this.opts.timer);
			});
		};
		exports.load=function(options){
			
			return new Slide(options);
		};
	});
})();