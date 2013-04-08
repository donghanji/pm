/*
 * @name Cookies Module
 * @desc Cookies插件
	设计原则：
	|提供操作Cookies的几个基本方法get/set/remove,还提供一个cookie方法
	
	使用介绍：
	第一步，得到cookies模块API:
	cookies=require('cookies');
	第二步，操作cookie:
	1.设置cookie
	cookies.set('cookie_name','cookie_value');
	2.得到cookie
	cookies.get('cookie_name');
	3.移除cookie
	cookies.remove('cookie_name');
	
	补充说明：
	还可使用cookies.cookie('cookie_name','cookie_value','cookie_options')，进行更复杂的操作.
 */
(function(){
	if(module.declare === undefined){
		throw 'There is no global module.declare method!';
	}
	//扩展String trim方法
	if(String.prototype.trim === undefined){
		String.prototype.trim=function(){return this.replace(/^\s+/,'').replace(/\s+$/,'');};
	}
	//定义cookies插件
	module.declare('cookies',function(require,exports){
		function apply(){
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
		//from jquery.cookie
		exports.cookie=function(key,val,options){
			if (typeof val !== 'undefined') {//set cookie
				options = options || {};
				if (val === null) {//remove cookie
					val = '';
					options = apply({}, options);
					options.expires = -1;
				}
				var expires = '';
				if (options.expires && (typeof options.expires == 'number' || options.expires.toUTCString)) {
					var date;
					if (typeof options.expires == 'number') {
						date = new Date();
						date.setTime(date.getTime() + (options.expires * 24 * 60 * 60 * 1000));
					} else {
						date = options.expires;
					}
					expires = '; expires=' + date.toUTCString(); // use expires attribute, max-age is not supported by IE
				}
				
				var path = options.path ? '; path=' + (options.path) : '';
				var domain = options.domain ? '; domain=' + (options.domain) : '';
				var secure = options.secure ? '; secure' : '';
				document.cookie = [key, '=', encodeURIComponent(val), expires, path, domain, secure].join('');
			} else { //get cookie
				var cookieValue = null;
				if (document.cookie && document.cookie != '') {
					var cookies = document.cookie.split(';');
					for (var i = 0; i < cookies.length; i++) {
						var cookie = cookies[i].trim();
						if (cookie.substring(0, key.length + 1) == (key + '=')) {
							cookieValue = decodeURIComponent(cookie.substring(key.length + 1));
							break;
						}
					}
				}
				return cookieValue;
			}
		};
		exports.get=function(key){
			return exports.cookie(key);
		};
		exports.set=function(key,value,options){
			return exports.cookie(key,value,options);
		};
		exports.remove=function(key){
			return exports.cookie(key,null);
		};
	});
})();