/*
 * @name Operating System
 * @desc
 		Currently  is only to userAgent
 */
(function(){
	if(module.declare === undefined){
		throw 'There is no global module.declare method!';
	}
	//userAgent regexp
	var Exp_USERAGENT={
		WEBKIT:/WebKit\/([\d.]+)/,
		OPERA:/Opera Mobi/,
		ANDROID:/(Android)\s+([\d.]+)/,
		IPAD:/(iPad).*OS\s([\d_]+)/,
		IPHONE:/(iPhone\sOS)\s([\d_]+)/,
		WEBOS:/(webOS|hpwOS)[\s\/]([\d.]+)/,
		TOUCHPAD:/TouchPad/,
		BLACKBERRY:/(BlackBerry).*Version\/([\d.]+)/,
		FENNEC:/fennec/i
	};
	//define os module
	module.declare('os',function(require,exports,module){
		function detect(ua){
			var os={},
				webkit = ua.match(Exp_USERAGENT.WEBKIT),
				android = ua.match(Exp_USERAGENT.ANDROID),
				ipad = ua.match(Exp_USERAGENT.IPAD),
				iphone = !ipad && ua.match(Exp_USERAGENT.IPHONE),
				webos = ua.match(Exp_USERAGENT.WEBOS),
				touchpad = webos && ua.match(Exp_USERAGENT.TOUCHPAD),
				blackberry = ua.match(Exp_USERAGENT.BLACKBERRY);

			if (android) os.android = true, os.version = android[2];
			if (iphone) os.ios = true, os.version = iphone[2].replace(/_/g, '.'), os.iphone = true;
			if (ipad) os.ios = true, os.version = ipad[2].replace(/_/g, '.'), os.ipad = true;
			if (webos) os.webos = true, os.version = webos[2];
			if (touchpad) os.touchpad = true;
			if (blackberry) os.blackberry = true, os.version = blackberry[2];
			if (!(android || iphone || ipad || webos || touchpad || blackberry)) os.desktop=true,os.version=null;
			
			return os;
		};
		
		return detect(navigator.userAgent);
	});
})();