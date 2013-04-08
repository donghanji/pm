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
		var def={
			target:'',//最外层目标对象
			effect: 'scrollY',//动画效果
			autoPlay:true,//是否自动
			speed: 'normal',//速度
			timer: 3000,//时间
			width:0,//目标对象宽度
			height:0,//目标对象高度，对于某些不能正常获取高宽度的情况，可使用该参数
			zIndex:1,//z-index
			clsNav:'slide_nav',//导航包裹层class
			clsCon:'slide_con',//内容包裹层class
			steps:1
		};
		exports.load=function(options){
			options=options||{};
			var opts=$.extend(def,options),
				target=options.target;
			if(!target){
				throw 'There must have a container object.';
			}
			target=typeof target === 'string' ? $(target) : target;//目标对象
			var targetLi = target.find('.' + opts.clsNav).children(),//目标导航对象
				clickNext = target.find('.' + opts.clsNav + ' .next'),//点击下一个按钮
				clickPrev = target.find('.' + opts.clsNav + ' .prev'),//点击上一个按钮
				ContentBox = target.find('.' + opts.clsCon ),//滚动的对象
				ContentBoxNum=ContentBox.children().size(),//滚动对象的子元素个数
				slideH=opts.height||ContentBox.children().first().height(),//滚动对象的子元素个数高度，相当于滚动的高度
				slideW=opts.width||ContentBox.children().first().width();//滚动对象的子元素宽度，相当于滚动的宽度
			var autoPlay,
				slideWH,
				zIndex=opts.zIndex||1,
				index=1;
			if(opts.effect === 'scrollY' || opts.effect === 'scroolTxt'){
				slideWH=slideH;
			}else if(opts.effect === 'scrollX' || opts.effect === 'scroolLoop'){
				ContentBox.css('width',ContentBoxNum*slideW);
				slideWH=slideW;
			}else if(opts.effect === 'fade' || opts.effect === 'animate'){
				ContentBox.children().css({'position':'absolute'});
				ContentBox.first().css('z-index',zIndex);
			}
			var $this=target;
			//滚动函数
			var doPlay=function(){
				effect[opts.effect](ContentBox, targetLi, index, slideWH, opts);
				index++;
				if (index*opts.steps >= ContentBoxNum) {
					index = 0;
				}
			};
			//下一条
			clickNext.click(function(event){
				effectLoop.scroolLeft(ContentBox, targetLi, index, slideWH, opts,function(){
					for(var i=0;i<opts.steps;i++){
	                    ContentBox.find('li:first',$this).appendTo(ContentBox);
	                }
	                ContentBox.css({'left':'0'});
				});
				event.preventDefault();
			});
			//上一条
			clickPrev.click(function(event){
				for(var i=0;i<opts.steps;i++){
	                ContentBox.find('li:last').prependTo(ContentBox);
	            }
	          	ContentBox.css({'left':-index*opts.steps*slideW});
				effectLoop.scroolRight(ContentBox, targetLi, index, slideWH, opts);
				event.preventDefault();
			});
			//自动播放
			if (opts.autoPlay) {
				autoPlay = setInterval(doPlay, opts.timer);
				ContentBox.hover(function(){
					if(autoPlay){
						clearInterval(autoPlay);
					}
				},function(){
					if(autoPlay){
						clearInterval(autoPlay);
					}
					autoPlay=setInterval(doPlay, opts.timer);
				});
			}
			
			//目标事件
			targetLi.hover(function(){
				if(autoPlay){
					clearInterval(autoPlay);
				}
				index=targetLi.index(this);
				window.setTimeout(function(){effect[opts.effect](ContentBox, targetLi, index, slideWH, opts);},200);
			},function(){
				if(autoPlay){
					clearInterval(autoPlay);
				}
				autoPlay = setInterval(doPlay, opts.timer);
			});
		};
	});
})();