/*
 * @name module.js
 * @author donghanji
 
 * @datetime 2013-01-07,2013-09-07,2013-10-26
 *
 * @desc
		//The aims of PM is that taking modules as the core to form a powerful plug-in library.
		//This file is the core of PM,Modules.
		
		//This is the first version of PM.
		
		//The future of the PM, you and I, we us grow together...
 *
 * @update
 		https://github.com/donghanji/pm
 */
;(function(global,undefined){
	//location pathname
	var startPath = window.location.pathname,
		//private property
		class2type={},
		toString=Object.prototype.toString;
	
	//module object
	var module={
		options:{
			'require':false,//whether open require mode
			'nocache':false,
			'debug':false,//whether open debug mode
			'timeout':7000,//.ms
			'mined':'',//''/min/..
			'base':'',//base path
			'dirs':{},//directories,include modules,plugins,mobile,pad,web
			'alias':{},//module alias
			'files':[],//not a module,a common file,there is no define method in it
			'coms':{},//one file ,multiple modules,as a component
            'defaults':{},//plugins default setting
			'globals':{}//global variables	
		},
		util:{},
		path:{}
	};
	
	//regx
	var REGX={
		'SLASHDIR':/^\//,
		'BASEDIR':/.*(?=\/.*$)/,
		'JSSUFFIX':/\.js$/,
		'COMMENT':/(\/\*([\s\S]*?)\*\/|([^:]|^)\/\/(.*)$)/mg,
		'REQUIRE':/(?:^|[^.$])\brequire\s*\(\s*(["'])([^"'\s\)]+)\1\s*\)/g,
		'REQUIRE_FUN':/^function \(\w*\)/,
		'MODULENAME':/\/([\w.]+)?(?:\1)?$/,
		'PLACEHOLDER_DIR':/\{(\S+)?\}(?:\1)?/
	},
	//status
	STATUS={
		'ERROR':-1,
		'BEGIN':0,
		'LOADING':1,
		'LOADED':2,
		'END':3
	};
	
	/* 
	 * @name util
	 * @desc 
	 		the private utilities,internal use only.
	 *
	 */
	(function(util){
		util.extend=function(){
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
		//is* method,element attribute is *
		util.extend({
			type:function(value){
				return value == null ?
				String(value) :
				class2type[toString.call(value)] || 'object';
			},
			isNumeric:function(value){
				return !isNaN(parseFloat(value)) && isFinite(value);
			},
			isString:function(value){
				return util.type(value) === 'string';
			},
			isFunction:function(value){
				return util.type(value) === 'function';
			},
			isObject:function(value){
				return util.type(value) === 'object';
			},
			isArray:function(value){
				return util.type(value) === 'array';
			}
		});
		//now time
		util.now=function(){
			
			return new Date().getTime();
		};
		//unique id
		util.uid=function(){
			
			return util.now()+''+Math.floor(Math.random()*1000000);
		};
		//is empty
		util.isEmpty=function(val){
			if(val === '' || val === undefined || val === null){
			
				return true;
			}
			if((util.isArray(val))){
				
				return val.length ? false : true;
			}
			if(util.isObject(val)){
				
				return util.isEmptyObject(val);
			}
			
			return false;
		};
		//is a empty object
		util.isEmptyObject=function(obj){
			for(var name in obj){
				return false;
			}
			
			return true;
		};
		//traverse object or array
		util.each=function(object,callback){
			var i=0,
				len=object.length,
				isObj = len === undefined ||util.isFunction(object);
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
		};
		//class2type object
		util.each("Boolean,Number,String,Function,Array,Date,RegExp,Object".split(","), function(i, name) {
			class2type[ "[object " + name + "]" ] = name.toLowerCase();
		});
		//get object all key,composed of an array
		util.keys=Object.keys||function(o){
			var ret=[];
			for (var p in o) {
			  if (o.hasOwnProperty(p)) {
				ret.push(p)
			  }
			}
		
			return ret
		};
		//Remove an array of the same
		util.unique=function(arr){
			var o={};
			util.each(arr,function(i,v){
				o[v]=1;
			});
			
			return util.keys(o);
		};
		util.isInArray=function(arr,val){
			if(!util.isArray(arr)){
				return false;
			}
			var i=0,	
				len=arr.length;
			for(;i<len;i++){
				if(arr[i] === val){
					return true;
				}
			}
			
			return false;
		};
		//get the dependencies
		util.parseDependencies=function(code){
			code=code.replace(REGX.COMMENT,'');//empty comment
			var ret = [], match,
			reg=REGX.REQUIRE;
			reg.lastIndex=0;
			
			while(match = reg.exec(code)){
				if(match[2]){
					ret.push(match[2]);
				}
			}
			
			return util.unique(ret);
		};
		// path to name
		util.path2name=function(id){
			if(util.isArray(id)){
				var arr=[];
				util.each(id,function(i,v){
					var v=util.path2name(v);
					arr.push(v);
				});
				
				return arr;
			}
			var reg=REGX.MODULENAME,
				ret=reg.exec(id);
			if(ret&& ret.length > 1){
				id=ret[1].replace(REGX.JSSUFFIX,'');
			}
			
			return id;
		};
	})(module.util);
	
	//path
	(function(path){
		//to dir name
		path.dirname=function(uri){
			var s = uri.match(REGX.BASEDIR);
			
    		return (s ? s[0] : '.') + '/';
		};
		//to real path
		path.realpath=function(uri){
			var base=module.options.base;
			
			//absolute
			if(!(uri.indexOf('//') > -1)){
				uri=base+uri;
			}
			/*if(REGX.SLASHDIR.test(uri)){
				uri=uri.replace(REGX.SLASHDIR,'');
			}*/
			
			return uri;
		};
	})(module.path);
	
	//config base
	(function(config){
		var _path=module.path,
			_config=module.options;
		
		var base=_path.dirname(startPath);
		
		_config.base=base;
	})(module.options);
	
	//module global variable or cache,when debug mode opening
	var ModulesSet={},//module set
		ModuleCachesQueue=[],//[{id:id,dependencies:[],factory:function,links:[]},{}]
		StatusCacheQueue={};//{id:{status:0}}
	//module method
	(function(){
		var _config=module.options,
			_util=module.util,
			_path=module.path;
		/*
		 * @private
		 * @desc
		 		replace placeholders({modules},{plugins},{mobile},{pad} and {web}) for actual directory
		 *
		 * @param {String} alias placeholder directory
		 * @return {String} alias actual directory
		 *
		 */
		module.dirs=function(alias){
			alias=_util.isObject(alias) ? alias : {};
			
			var dirs=_config.dirs,
				reg=REGX['PLACEHOLDER_DIR'];
			for(var dir in alias){
				var ret=reg.exec(alias[dir]),
					res=alias[dir];
				if(ret&& ret.length > 1){
					var r=dirs[ret[1]]||ret[1]||'';
					res=res.replace(ret[0],r);
				}
				
				alias[dir]=res;
			}
			
			return alias;
		};
		/*
		 * @public
		 * @desc module initialization,module config
		 * 
		 * @param {Object} conf,reeference module.options
		 		seting module.options,
				whether open require mode,
				whether open debug mode
		 */
		module.init=function(conf){
			conf=_util.isObject(conf) ? conf : {};
			
			_config=_util.extend(_config,conf);
			//replace placeholder
			_config.alias=module.dirs(_config.alias);
			
			//add .
			var mined=_config.mined,
				reg=/^\./;
			mined=(mined && !reg.test(mined)) ? '.'+mined : mined;
			_config.mined=mined;
			
			if(_config.require === true){
				//require
				global.require=module.declare;
				//define
				global.define=module.declare;
				//define.remove
				global.define.remove=module.remove;
			}
			if(_config.debug === true){
				module.ModulesSet=ModulesSet;
				module.ModuleCachesQueue=ModuleCachesQueue;
				module.StatusCacheQueue=StatusCacheQueue;
				global.module=module;
				global.module.config=module.init;
			}
		};
		/*
		 * @method
		 * @public
		 * @desc 
		 		setting module alias
		 *
		 * @param {Object}
		 */
		module.alias=function(alias){
			if(_util.isEmpty(alias)){
				
				return _config.alias;
			}
			alias=_util.isObject(alias) ? alias : {};
			alias=module.dirs(alias);
			
			_config.alias=_util.extend(alias,_config.alias);
		};
		/*
		 * @method
		 * @public
		 * @desc 
		 		setting module files,in the files,said the file is not module,only a common file
		 * @param {String/Array/Object}
		 		String:a file name
				Array:many file name
				Object:a or many file,and the file name will be in the module.alias
		 */
		module.files=function(files){
			if(_util.isEmpty(files)){
				
				return _config.files;
			}
			if(_util.isString(files)){
				files=[].concat(files);
			}
			if(_util.isObject(files)){
				var arr=[];
				_util.each(files,function(k,v){
					arr.push(k);
				});
				
				module.alias(files);
				files=arr;
			}
			
			_config.files=_util.unique(_config.files.concat(files));
		};
		/*
		 * @method
		 * @public
		 * @desc
		 		global variables
				according to such as jquery,zepto,jqmobi $ variable
		 *
		 */
		module.globals=function(globals){
			if(_util.isEmpty(globals)){
				
				return _config.globals;
			}
			if(_util.isString(globals)){
				
				return _config.globals[globals]||'';
			}
			globals=_util.isObject(globals) ? globals : {};
			
			_config.globals=_util.extend(globals,_config.globals);
		};
        module.defaults=function(name,conf){
			if(_util.isEmpty(name)){
				
				return _config.defaults;
			}
			if(_util.isObject(name)){
				for(var i in name){
					module.defaults(i,name[i]);
				}
				
				return;
			}
			name=module.aliasId(name);
			
			if(conf === undefined){
				
				return _config.defaults[name]||{};
			}
			
			conf=_util.isObject(conf) ? conf : {};
			_config.defaults[name]=_config.defaults[name]||{};
			
			_config.defaults[name]=_util.extend(conf,_config.defaults[name]);
		};
		//get all scripts
		module.scripts=function(){
			
			return document.getElementsByTagName('script');
		};
		//create script
		module.createScript=function(name,async){
			async=async===undefined || async ? true : false;
			
			var node=document.createElement('script');
			node.setAttribute('data-requiremodule',name);
			node.type='text/javascript';
            node.charset='utf-8';
            node.async=async;
			
			return node;
		};
		// get script data
		module.getScriptData=function(evt){
			var node = evt.currentTarget || evt.srcElement;
			if(node.detachEvent){
				node&&node.detachEvent('onreadystatechange',module.onScriptLoad);
				node&&node.detachEvent('error',module.onScriptError);
			}else{
				node&&node.removeEventListener('load',module.onScriptLoad,false);
            	node&&node.removeEventListener('error',module.onScriptError,false);
			}
			
			return{
				node:node,
				id:node&&node.getAttribute('data-requiremodule')
			};
		};
		//load javascript
		module.loadJS=function(id){
			var m=module.isInComs(id);
			id=m !== null ? m : id;
			if(module.getStatus(id) > STATUS.BEGIN){
				return;
			}
			module.statusSet(id,STATUS.LOADING);
			var head=document.getElementsByTagName('head')[0],
				node=module.createScript(id),
				id=module.aliasId(id,'v'),
				src=_path.realpath(id);
			//add mined
			src=src+_config.mined;
			//add .js suffix
			if(!REGX.JSSUFFIX.test(src)){
				src=src+'.js';
			}
			if(_config.nocache){
				src=src+'?t='+_util.now();//add random time
			}
			node.src=src;
			head.appendChild(node);
			if(node.attachEvent){
				node.attachEvent('onreadystatechange',module.onScriptLoad);
				node.attachEvent('onerror',module.onScriptError);
			}else{
				node.addEventListener('load',module.onScriptLoad,false);
           		node.addEventListener('error',module.onScriptError,false);
			}
		};
		//remove javascript by the data-requiremodule attribute
		module.removeJS=function(name){
			name=module.aliasId(name);
			_util.each(module.scripts(),function(i,scriptNode) {
				if (scriptNode&&scriptNode.getAttribute('data-requiremodule') === name) {
					scriptNode.parentNode.removeChild(scriptNode);
					
					return true;
				}
			});
		};
		//script load success callback
		module.onScriptLoad=function(evt){
			var el=evt.currentTarget || evt.srcElement;
			if(evt.type === 'load' || (evt.type == 'readystatechange' && (el.readyState === 'loaded' || el.readyState === 'complete'))){
				var data=module.getScriptData(evt),
					id=data['id'];
				module.statusSet(id,STATUS.LOADED);
				
				if(module.isInFiles(id)){
					
					module.compile(id);
					module.complete(id,[],function(){return {};});
				}
				//module.removeJS(id);	
			}
		};
		//script load error callback
		module.onScriptError=function(evt){
			var data=module.getScriptData(evt),
				id=data['id'];
			module.statusSet(id,STATUS.ERROR);
			module.compile(id);
			
			module.removeJS(id);
		};
		// set module status
		module.statusSet=function(id,status){
			id=module.aliasId(id);
			
			if(!StatusCacheQueue[id]){
				StatusCacheQueue[id]={};
			}
			
			StatusCacheQueue[id]['status']=status;
		};
		// get module status
		module.getStatus=function(id){
			id=module.aliasId(id);
			
			return StatusCacheQueue[id]&&StatusCacheQueue[id]['status']||STATUS.BEGIN;
		};
		//load module
		module.load=function(uris){
			_util.each(uris,function(i,id){
				
				module.loadJS(id);
			});
		};
		// is module in the module.alias
		module.isInAlias=function(name){
			var alias=_config.alias;
			for(var k in alias){
				var v=_util.path2name(alias[k]);
				if(k === name || v === name || alias[k] === name){
					
					return {k:k,v:alias[k]};
				}
			}
			
			return null;
		};
		//get alias id
		module.aliasId=function(id,type){
			type=type||'k';
			var	aid=module.isInAlias(id);
			id=aid&&aid[type]||id;
			
			return id;
		};
		//is module in the module.files
		module.isInFiles=function(name){
			var files=_config.files,
				name=module.aliasId(name);
			var i=0,
				len=files.length;
			for(;i<len;i++){
				if(files[i] === name){
					
					return true;
				}
			}
			
			return false;
		};
		// is module in the module.coms
		module.isInComs=function(name){
			var coms=_config.coms,
				k=module.aliasId(name),
				v=module.aliasId(name,'v');
			for(var m in coms){
				if(k === m || _util.isInArray(coms[m],k) || _util.isInArray(coms[m],v)){
					
					return m;	
				}
			}
			
			return null;
		};
		//is module already in the module set
		module.isInModules=function(id){
			id=module.aliasId(id);
			
			return ModulesSet[id];
		};
		//separating a module which has not been in the module set
		module.noInModulesItems=function(dependencies){
			var arr=[];
			_util.each(dependencies,function(i,id){
				if(!module.isInModules(id)){
					
					arr.push(id);
				}
			});
			
			return arr;
		};
		/*
		 * @private
		 * @desc
				is require a module, not define a module
				such as
				module.declare(id,dependencies,function(){})
				module.declare(id,dependencies,function(require){})
				
				return true
				such as
				module.declare(id,dependencies,function(require,exports){})
				module.declare(id,dependencies,function(require,exports,module){})
				
				return false
		 *
		 */
		module.isRequire=function(code){
			if(code){
				return REGX.REQUIRE_FUN.test(code);	
			}
			
			return false;
		};
		//set module
		module.moduleSet=function(id,dependencies,factory){
			id=module.aliasId(id);
			
			if(module.isInModules(id) && _util.isFunction(factory)){
				if(module.isRequire(factory.toString())){
					factory(this.declare);
					return;
				}
				throw 'module \"'+ id + '\" already defined!';
			}
			
			if(!_util.isFunction(factory)){
				
				return;
			}
			ModulesSet[id]={
				id:id,
				dependencies:dependencies,
				factory:factory
			};
		};
		//compile module
		module.compile=function(id){
			id=module.aliasId(id);
			var v=module.aliasId(id,'v');
			
			_util.each(ModuleCachesQueue,function(index,json){
				if(!json){
					return;
				}
				var links=json['links']||[];
				
				if(!(_util.isInArray(links,id) || _util.isInArray(links,v))){
					
					return;
				}
				
				function deleteLink(){
					var i=0,
						len=links.length;
					for(;i<len;i++){
						if(links[i] === id){
							links.splice(i,1);
							module.compile(id);
							return;
						}
					}
				};
				
				if(links.length <= 1){
					var uid=json['id']||_util.uid(),
						dependencies=json['dependencies']||[],
						factory=json['factory']||'';
						var ms=ModulesSet[id]||{},
							dept=ms['dependencies']||[];
						
						dependencies=dependencies.concat(dept);
						dependencies=_util.unique(dependencies);
						ModuleCachesQueue.splice(index,1);
						module.complete(uid,dependencies,factory);
				}
				//delete loaded dependency
				deleteLink();
			});
		};
		//complete a module,return exports
		module.complete=function(id,dependencies,factory){
			module.moduleSet(id,dependencies,factory);
			
			var exports=module.exports(id);
			module.compile(id);
			
			return exports; 
		};
		//buile a module
		module.build=function(module){
			var factory=module.factory;
			module.exports={};
			delete module.factory;
			var moduleExports=factory(this.declare,module.exports,module);
			//jQuery direct return
			if(_util.isEmptyObject(module.exports)){
				module.exports=moduleExports||{};
			}
			
			return module.exports;
		};
		//module's exports
		module.exports=function(id){
			//module in ModulesSet
			if(module.isInModules(id)){
				id=module.aliasId(id);
				var exports=ModulesSet[id].factory ? module.build(ModulesSet[id]) : ModulesSet[id].exports;
				
				return exports;
			}
			
			return null;
		};
		/*
		 * @method
		 * @public
		 * @desc
		 		the main method,define or require a module
		 *
		 * @param {String} id : module id,not necessary
		 * @param {Array} dependencies : the module dependencies,necessary
		 * @param {Function} : a callback or module factory,is necessary
		 * 
		 * @return 
		 		return a exports or null,when asynchronous loading return null,require a module return module.exports
		 */
		module.declare=function(id,dependencies,factory){
			dependencies=dependencies||[];
			if(_util.isArray(id)){
				factory=dependencies;
				dependencies=id;
				id='';
			}
			if(_util.isFunction(dependencies)){
				factory=dependencies;
				dependencies=[];
			}
			
			if(_util.isFunction(id)){
				factory=id;
				dependencies=_util.parseDependencies(factory.toString())||[];
				id='';
			}
			
			//dependencies=id ? [].concat(id).concat(dependencies) : dependencies;
			//anonymous module
			id=id||_util.uid();
			var items=module.noInModulesItems(dependencies);
			if(items&&items.length){
				var json={
					id:id,
					dependencies:dependencies,
					factory:factory,
					links:_util.path2name(items)
				};
				
				ModuleCachesQueue.push(json);
				module.load(dependencies);
				return;
			}
			
			return module.complete(id,dependencies,factory);
		};
		//remove a module,only in open require mode
		module.remove=function(id){
			id=module.aliasId(id);
			if(!id){
				
				return;
			}
			//remove javascript
			module.removeJS(id);
			//delete status
			delete StatusCacheQueue[id];
			//delete module
			delete ModulesSet[id];
		};
	})();
	
	//global method
	global.module=global.module||{};
	global.module.config=module.init;
	global.module.alias=module.alias;
	global.module.files=module.files;
	global.module.globals=module.globals;
    global.module.defaults=module.defaults;
	global.module.declare=module.declare;
})(this);