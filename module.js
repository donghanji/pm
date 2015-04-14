﻿/*
 * @name module.js
 * @version 0.0.2
 * @author 
        donghanji
        
 * @desc
		The aims of PM is that taking modules as the core to form a powerful plug-in library.
		This file is the core of PM,
		The future of the PM, you and I, we us grow together...
 *
 * @update
		https://github.com/donghanji/pm
 */
 
'use strict';

(function(global,undefined){
    if(global.module){
        
        return;
    }
    var document=global.document;
    var startPath = global.location.pathname;
    var class2type={};
    var toString=Object.prototype.toString;
    
    var REGX={
		'SLASHDIR':/^\//,
		'BASEDIR':/.*(?=\/.*$)/,
		'JSSUFFIX':/\.js(?:\?\w+\=\w+)?$/,
        'PARAMSUFFIX':/\.js\?\w+\=\w+$/,
		'COMMENT':/(\/\*([\s\S]*?)\*\/|([^:]|^)\/\/(.*)$)/mg,
		'REQUIRE':/(?:^|[^.$])\brequire\s*\(\s*(["'])([^"'\s\)]+)\1\s*\)/g,
		'REQUIRE_FUN':/^function\s*\(\w*\)/,
		'MODULENAME':/\/([\w.]+)?(?:\1)?$/,
		'PLACEHOLDER_DIR':/\{([^\}\{]+)?\}/g
	};
    var STATUS={
		'ERROR':-1,
		'BEGIN':0,
		'LOADING':1,
		'LOADED':2,
		'END':3
	};
    var _guid=1;
    
    var module={
        version:'0.0.2',
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
        }
    };
    //
    var util=module.util={};
    var path=module.path={};
    
    /*
     * @name module.util
     * @desc 
            
     */
    //
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
        
        return [util.now(),_guid++,Math.floor(Math.random()*1000000)].join('');
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
            }
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
                
                ret.push(p);
            }
        }
    
        return ret;
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
                v=util.path2name(v);
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
    
    /*
     * @name module.path
     * @desc
            
     *
     */
    path.dirname=function(uri){
        var s = uri.match(REGX.BASEDIR);
        
        return (s ? s[0] : '.') + '/';
    };
    //to real path
    path.realpath=function(uri){
        var base=module.options.base;
        
        //absolute
        if(uri.indexOf('//') === -1){
            uri=base+uri;
        }
        /*if(REGX.SLASHDIR.test(uri)){
            uri=uri.replace(REGX.SLASHDIR,'');
        }*/
        
        return uri;
    };
    
    /*
     * @name module
     * @desc
            
     *
     */
    //module global variable or cache,when debug mode opening
	var ModulesSet={};//module set
	var ModuleCachesQueue=[];//[{id:id,dependencies:[],factory:function,links:[]},{}]
	var StatusCacheQueue={};//{id:{status:0}}
    var options=module.options;
    //base
    options.base=path.dirname(startPath);
    
    /*
     * @name module.replace
     * @desc
        replace placeholders({modules},{plugins},{mobile},{pad} and {web}) for actual directory
        Don't separate ,jshint will be an error-"Don't make functions within a loop".
     *
     * @param {String} alias placeholder directory
     * @return {String} alias actual directory
     *
     */
    module.replace=function(dirs,res){
        var reg=REGX['PLACEHOLDER_DIR'];
        
        return res.replace(reg,function(){
            var args=arguments;
            if(args.length >=4){
                var a=args[1],
                    r=dirs[a]||a||'';
                
                return args[3].replace(args[3],r);
            }
            
            return args[3];
        });
    };
    /*
     * @name module.dirs
     * @desc
        replace placeholders({modules},{plugins},{mobile},{pad} and {web}) for actual directory
     *
     * @param {String} alias placeholder directory
     * @return {String} alias actual directory
     *
     */
    module.dirs=function(alias){
        alias=util.isObject(alias) ? alias : {};
        
        var dirs=options.dirs;
        //dirs
        for(var dir in dirs){
            
            dirs[dir]=module.replace(dirs,dirs[dir]);
        }
        //alias
        for(var alia in alias){
            
            alias[alia]=module.replace(dirs,alias[alia]);
        }
        
        return alias;
    };
    
    /*
     * @name module.config
     * @desc 
            module  configuration
       
     */
    module.config=function(conf){
        conf=util.isObject(conf) ? conf : {};
        options=util.extend(options,conf);
        
        //replace placeholder
        options.alias=module.dirs(options.alias);
        
        //add .
        var mined=options.mined,
            reg=/^\./;
        mined=(mined && !reg.test(mined)) ? '.'+mined : mined;
        options.mined=mined;
        
        //
        if(options.require === true){
            //require
            global.require=module.declare;
            //define
            global.define=module.declare;
            //define.remove
            global.define.remove=module.remove;
        }
        //
        if(options.debug === true){
            module.ModulesSet=ModulesSet;
            module.ModuleCachesQueue=ModuleCachesQueue;
            module.StatusCacheQueue=StatusCacheQueue;
            
            global.module=module;
        }
    };
    /*
     * @name module.alias
     * @desc
            setting module alias
     *
     * @param {Object}
     */
    module.alias=function(alias){
        if(util.isEmpty(alias)){
            
            return options.alias;
        }
        alias=util.isObject(alias) ? alias : {};
        alias=module.dirs(alias);
        
        options.alias=util.extend(alias,options.alias);
    };
    /*
     * @name module.files
     * @desc
            setting module files,in the files,said the file is not module,only a common file
     * @param {String/Array/Object}
            String:a file name
            Array:many file name
            Object:a or many file,and the file name will be in the module.alias
     */
    module.files=function(files){
        if(util.isEmpty(files)){
            
            return options.files;
        }
        if(util.isString(files)){
            files=[].concat(files);
        }
        if(util.isObject(files)){
            var arr=[];
            util.each(files,function(k,v){
                arr.push(k);
            });
            
            module.alias(files);
            files=arr;
        }
        
        options.files=util.unique(options.files.concat(files));
    };
    /*
     * @name module.globals
     * @desc
            global variables
            according to such as jquery,zepto,jqmobi $ variable
     *
     */
    module.globals=function(globals){
        if(util.isEmpty(globals)){
            
            return options.globals;
        }
        if(util.isString(globals)){
            
            return options.globals[globals]||'';
        }
        globals=util.isObject(globals) ? globals : {};
        
        options.globals=util.extend(globals,options.globals);
    };
    /*
     * @name module.defaults
     * @desc
            
     *
     */
    module.defaults=function(name,conf){
        if(util.isEmpty(name)){
            
            return options.defaults;
        }
        if(util.isObject(name)){
            for(var i in name){
                module.defaults(i,name[i]);
            }
            
            return;
        }
        name=module.aliasId(name);
        
        if(conf === undefined){
            
            return options.defaults[name]||{};
        }
        
        conf=util.isObject(conf) ? conf : {};
        options.defaults[name]=options.defaults[name]||{};
        
        options.defaults[name]=util.extend(conf,options.defaults[name]);
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
            aid=module.aliasId(id,'v'),
            src=path.realpath(aid);
        //add mined
        src=src+options.mined;
        //add .js suffix
        if(!REGX.JSSUFFIX.test(src)){
            src=src+'.js';
        }
        //add random time
        if(options.nocache && !REGX.PARAMSUFFIX.test(src)){
            src=[src,'?t=',util.now()].join('');
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
        util.each(module.scripts(),function(i,scriptNode) {
            if (scriptNode&&scriptNode.getAttribute('data-requiremodule') === name) {
                scriptNode.parentNode.removeChild(scriptNode);
                
                return true;
            }
        });
    };
    //script load success callback
    module.onScriptLoad=function(evt){
        var el=evt.currentTarget || evt.srcElement;
        if(evt.type === 'load' || (evt.type === 'readystatechange' && (el.readyState === 'loaded' || el.readyState === 'complete'))){
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
        util.each(uris,function(i,id){
            
            module.loadJS(id);
        });
    };
    // is module in the module.alias
    module.isInAlias=function(name){
        var alias=options.alias;
        for(var k in alias){
            var v=util.path2name(alias[k]);
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
        var files=options.files;
        var i=0,
            len=files.length;
        name=module.aliasId(name);
        
        for(;i<len;i++){
            if(files[i] === name){
                
                return true;
            }
        }
        
        return false;
    };
    // is module in the module.coms
    module.isInComs=function(name){
        var coms=options.coms,
            k=module.aliasId(name),
            v=module.aliasId(name,'v');
        for(var m in coms){
            if(k === m || util.isInArray(coms[m],k) || util.isInArray(coms[m],v)){
                
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
        util.each(dependencies,function(i,id){
            if(!module.isInModules(id)){
                
                arr.push(id);
            }
        });
        
        return arr;
    };
    /*
     * @name module.isRequire
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
        
        if(module.isInModules(id) && util.isFunction(factory)){
            if(module.isRequire(factory.toString())){
                
                return factory(this.declare);
            }
            
            throw 'module \"'+ id + '\" already defined!';
        }
        
        if(!util.isFunction(factory)){
            
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
        
        util.each(ModuleCachesQueue,function(index,json){
            if(!json){
                
                return;
            }
            var links=json['links']||[];
            
            if(!(util.isInArray(links,id) || util.isInArray(links,v))){
                
                return;
            }
            
            function deleteLink(){
                var i=0,
                    len=links.length;
                for(;i<len;i++){
                    if(links[i] === id){
                        links.splice(i,1);
                        
                        return module.compile(id);
                    }
                }
            }
            
            if(links.length <= 1){
                var uid=json['id']||util.uid(),
                    dependencies=json['dependencies']||[],
                    factory=json['factory']||'';
                    var ms=ModulesSet[id]||{},
                        dept=ms['dependencies']||[];
                    
                    dependencies=dependencies.concat(dept);
                    dependencies=util.unique(dependencies);
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
        if(util.isEmptyObject(module.exports)){
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
     * @name module.declare
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
        if(util.isArray(id)){
            factory=dependencies;
            dependencies=id;
            id='';
        }
        if(util.isFunction(dependencies)){
            factory=dependencies;
            dependencies=[];
        }
        
        if(util.isFunction(id)){
            factory=id;
            dependencies=util.parseDependencies(factory.toString())||[];
            id='';
        }
        
        //dependencies=id ? [].concat(id).concat(dependencies) : dependencies;
        //anonymous module
        id=id||util.uid();
        var items=module.noInModulesItems(dependencies);
        if(items&&items.length){
            var json={
                id:id,
                dependencies:dependencies,
                factory:factory,
                links:util.path2name(items)
            };
            
            ModuleCachesQueue.push(json);
            
            return module.load(dependencies);
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
    
    //global method
    var methods=['config','alias','files','globals','defaults','declare'];
    global.module=global.module||{};
    //
    util.each(methods,function(i,v){
        global.module[v]=module[v];
    });
})(window);