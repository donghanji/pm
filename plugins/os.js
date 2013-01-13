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
		WEBKIT:/webkit[\/]([\w.]+)/,
		ANDROID:/(android)\s+([\d.]+)/,
		IPAD:/(ipad).*os\s([\d_]+)/,
		IPHONE:/(iphone\sos)\s([\d_]+)/,
		WEBOS:/(webos|hpwos)[\s\/]([\d.]+)/,
		TOUCHPAD:/touchpad/,
		BLACKBERRY:/(blackberry).*version\/([\d.]+)/,
		FENNEC:/fennec/i,
		MOZILLA:/(mozilla)(?:.*? rv:([\w.]+)|)/,
		CHROME:/(chrome)[\/]([\w.]+)/,
		OPERA:/(opera)(?:.*version|)[\/]([\w.]+)/,
		SAFARI:/(safari)(?:.*version|)[\/]([\w.]+)/,
		MSIE:/(msie) ([\w.]+)/
	};
	//define os module
	module.declare('os',function(require,exports,module){
		function detect(ua){
			var os={},
				//mobile
				webkit = ua.match(Exp_USERAGENT.WEBKIT),
				android = ua.match(Exp_USERAGENT.ANDROID),
				iphone = !ipad && ua.match(Exp_USERAGENT.IPHONE),
				webos = ua.match(Exp_USERAGENT.WEBOS),
				blackberry = ua.match(Exp_USERAGENT.BLACKBERRY),
				//pad
				ipad = ua.match(Exp_USERAGENT.IPAD),
				touchpad = webos && ua.match(Exp_USERAGENT.TOUCHPAD),
				//web
				chrome = ua.match(Exp_USERAGENT.CHROME),
				opera = ua.match(Exp_USERAGENT.OPERA),
				msie = ua.match(Exp_USERAGENT.MSIE),
				safari = (ua+ua.replace(Exp_USERAGENT.SAFARI,'')).match(Exp_USERAGENT.SAFARI),//modify the jquery bug
				mozilla = ua.match(Exp_USERAGENT.MOZILLA);
			if (android) os.android = true, os.version = android[2];
			if (iphone) os.ios = true, os.version = iphone[2].replace(/_/g, '.'), os.iphone = true;
			if (ipad) os.ios = true, os.version = ipad[2].replace(/_/g, '.'), os.ipad = true;
			if (webos) os.webos = true, os.version = webos[2];
			if (touchpad) os.touchpad = true,os.version='';
			if (blackberry) os.blackberry = true, os.version = blackberry[2];
			if (!(android || iphone || ipad || webos || touchpad || blackberry)) os.desktop=true,os.version='';
			
			if (webkit) os.webkit=true;
			if(os.desktop){
				var match=chrome||safari||opera||msie||ua.indexOf('compatible') < 0 && mozilla;
				os[match[1]] = true;
				os['browser']=match[1];
				os['version'] = match[2];
			}
			
			return os;
		};
		
		return detect(navigator.userAgent.toLowerCase());
	});
})();