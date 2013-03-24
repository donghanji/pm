/*
 * 表单验证器模块
 * 
 * 设计原则
 	1.提示方式分为：0:每个表单项指定位置提示(该方式只是显示图标，鼠标移上去之后才显示提示文字);1:固定位置提示;
	2.提供基本验证方法，比如不能为空，长度限制等，还提供自定义正则验证
	3.可以针对一个表单，进行多个验证
	4.提示方式0时，一次给出所有错误提示，而不是第一项；其他方式，只给出第一项错误提示
	5.提供了错误回调处理
 * 约束条件
	1.由于为了不破坏用户自定义的表单结构，只有用户在表单上添加了{id}_error，其中{id}对应需验证表单项，才会给出对应项的错误提示，否则需要用户自己在回调中处理
	2.提供回调处理方式，用户可以自己在回调中处理提示的显示方式
	3.用户需自定义错误提示标记样式，插件内部仅仅是将其显示或者隐藏。目前，只需要提供一种错误样式即可。
 * 使用举例
    1.自定义验证规则
	validator.customer([{
		//自定义验证规则
	}]);
	2.表单验证控件初始化
	validator.init([{
		//验证规则
	}]);
	3.是否验证通过，未通过时会进入回调函数，可以进行相应处理
	validator.validate(function(id,error){
		//回调处理，返回错误表单项id，以及错误信息error
	});
 */
(function(){
	//正则表达式
	var vregx={
		'email':/^([a-zA-Z0-9_\.\-])+\@(([a-zA-Z0-9\-])+\.)+([a-zA-Z0-9]{2,4})+$/
	},
	//默认的验证类型
	vtype={
		//空白
		blank:function(val){
			
			return val.length < 1 || val === '';
		},
		//最小长度
		minLength:function(val,len){
			
			return val.length >= len;
		},
		//最大长度
		maxLength:function(val,len){
			
			return val.length <= len;
		},
		//电子邮件
		email:function(val){
			var reg=vregx['email'];
			
			return reg.test(val);
		}
	},
	//默认的提示文字信息
	vtext={
		blankText:'',
		minLength:'',
		maxLength:'',
		emailText:''
	};
	module.alias({
		'jquery.me':'{modules}/jquery.me',
		'jquery.selector':'{mobile}/jquery.selector',
		'jquery.util':'{mobile}/jquery.util',
		'jquery.dom':'{mobile}/jquery.dom',
		'jquery.css':'{mobile}/jquery.css',
		'jquery.attr':'{mobile}/jquery.attr',
		'jquery.event':'{mobile}/jquery.event'
	});
	//默认$全局变量为jquery.selector
	module.globals({
		'$':'jquery.selector'
	});
	//获取$全局变量名
	var $name=module.globals('$'),
		dependencies=[$name];
	//解决代码冗余和文件重复加载
	if($name === 'jquery.selector'){
		dependencies=dependencies.concat(['jquery.util','jquery.dom','jquery.css','jquery.attr','jquery.event']);
	}
	//定义validator插件
	module.declare('validator',dependencies,function(require,exports){
		var $=require($name),//获取$对象
			_result=true,//全局验证返回
			_options=[];//缓存验证项
		//注册blur验证
		function regist_blur(options){
			var i=0,
				len=options.length;
			for(;i<len;i++){
				(function(i){
					var opt=options[i],
						id=opt['id'];
					//blur事件注册
					$(id).blur(function(){
						var res=validate(opt);//验证返回
						if(!res){
						
							return false;
						}
					});
				})(i);
			}
		};
		//注册验证规则
		function regist_rule(options,error){
			var i=0,
				len=options.length;
			for(;i<len;i++){
				
				var opt=options[i],
					id=opt['id'],
					res=validate(opt,error);//验证返回
				if(!res){
					
					return false;
				}
			}
			
			return true;
		};
		//验证
		function validate(opt,error){
			opt=opt||{};
			var id=opt['id'],
				allowBlank=opt['allowBlank'],
				val=$(id).val();
			val=val !== undefined ? val+'' : '';
			val=val.trim();//获取输入值
			if(allowBlank === false){//是否允许为空
				opt['allowBlank']='blank';
			}
			var reg=opt['regex'];//自定义正则验证
			if(reg){
				opt['regx']=function(val){
					
					return reg.test(val);
				}
			}
			var _item_result=true,//单项返回，恢复为true
				vt='';//错误提示文本信息
			//console.log(opt);
			//执行
			for(var k in opt){
				if(k === 'id'){//去除id项
					continue;
				}
				var vk=opt[k],
					fun=typeof vk === 'function' ? vk : vtype[vk];
				
				fun=typeof fun === 'function' ? fun :vtype[k];
				if(typeof  fun === 'function'){//获取验证规则函数
					var res=fun(val,vk),
						eobj=$(id+'_error');//获取对应验证项，错误显示对象
					res =(vk === 'blank' && (allowBlank === false  || allowBlank === 'blank')) ? !res : res;//为空的验证返回处理
					
					//全局验证返回
					_result=_result ? res : _result;
					//单项验证返回
					_item_result=_item_result ? res : _item_result;
					//错误提示信息
					vt=!res ? (opt[k+'Text']||opt[vk+'Text']||vtext[k+'Text']||vtext[vk+'Text']||'') : vt;
					//标记错误项
					//console.log(res);
					if(!_item_result){
						eobj.attr('title',vt)
							.css({'display':'inline-block'});//单项验证未通过，显示错误提示
					}else{
						eobj.hide();//单项验证通过，隐藏
					}
					if(error && !res){
						error(id,vt);//执行错误回调
						return false;
					}
				}
			}
			
			return _result;
		};
		/*
		 * @desc 验证初始化
		 * @param {Object} options:[{
			 	'id':'id',
				'allowBlank':true,
				'blankText':'',
				'maxLength':20,
				'maxLengthText':'',
				'vtype':'',
				'vtypeText':'',
				'regex':'',
				'regexText':''
			 }]
		 */
		exports.init=function(options){
			options=options||{};
			if(!$.isArray(options)){
				options=[].concat(options);
			}
			_result=true;
			//缓存验证选项
			_options=options;
			//注册blur验证
			regist_blur(options);
		};
		/*
		 * @desc 验证方法入口
		  
		 * @return {Boolean}
		 */
		exports.validate=function(callback){
			_result=true;
			//执行验证规则
			regist_rule(_options,callback);
			
			return _result;
		};
		/*
		 * @desc 自定义验证规则
		 * @param {Object} rules:[{
		 		'vtype':function(){
					
				},
				'vtypeText':''
		 	},{
				'ipAddress':function(){
					
				},
				'ipAddressText':''
			}]
		 */
		exports.customer=function(rules){
			rules=rules||{};
			if(!$.isArray(rules)){
				rules=[].concat(rules);
			}
			var i=0,
				len=rules.length;
			for(;i<len;i++){
				var json=rules[i];
				for(var k in json){
					typeof json[k] === 'function' ? vtype[k]=json[k] : vtext[k]=json[k];//将自定义验证规则和验证提示分别绑定到vtype和vtext
				}
			}
		};
	});
})();