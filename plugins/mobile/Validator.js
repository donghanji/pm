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
	validator.custom([{
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
;(function(){
    if(module.declare === undefined){
		
        throw 'There is no global module.declare method!';
	}
    
	// $ global object
	var $name=module.globals('$');
    
	// define validator plugin
	module.declare('Validator',[$name],function(require,exports){
        var $=require($name),//get the $ object
            Validator=function(){
                // regular expressions
                var vregx={
                    'email':/^([a-zA-Z0-9_\.\-])+\@(([a-zA-Z0-9\-])+\.)+([a-zA-Z0-9]{2,4})+$/
                };
                return function(){
                    this.result=true;//validate result
                    this.options=[];//validate options
                    // default validate type
                    this.vtype={
                        // blank
                        blank:function(val){
                            
                            return val.length < 1 || val === '';
                        },
                        // minLength
                        minLength:function(val,len){
                            
                            return val.length >= len;
                        },
                        // maxLength
                        maxLength:function(val,len){
                            
                            return val.length <= len;
                        },
                        // email
                        email:function(val){
                            var reg=vregx['email'];
                            
                            return reg.test(val);
                        }
                    };
                    // default validate tips text
                    this.vtext={
                        blankText:'',
                        minLength:'',
                        maxLength:'',
                        emailText:''
                    };
                    //regist blur event
                    this._rb=function(options){
                        var _this=this;
                        var i=0,
                            len=options.length;
                        for(;i<len;i++){
                            (function(i){
                                var opt=options[i],
                                    id=opt['id'];
                                //blur event
                                $(id).blur(function(){
                                    var res=_this._v(opt);//return result
                                    if(!res){
                                    
                                        return false;
                                    }
                                });
                            })(i);
                        }
                    };
                    //rules
                    this._r=function(options,error){
                        var i=0,
                            len=options.length;
                        for(;i<len;i++){
                            
                            var opt=options[i],
                                id=opt['id'],
                                res=this._v(opt,error);//
                            if(!res){
                                
                                return false;
                            }
                        }
                        
                        return true;
                    };
                    //private validate
                    this._v=function(opt,error){
                        opt=opt||{};
                        var id=opt['id'],
                            allowBlank=opt['allowBlank'],
                            val=$(id).val();
                        val=val !== undefined ? val+'' : '';
                        val=val.trim();//get the value
                        if(allowBlank === false){//allow blank
                            opt['allowBlank']='blank';
                        }
                        var reg=opt['regex'];//customer regex
                        if(reg){
                            opt['regx']=function(val){
                                
                                return reg.test(val);
                            }
                        }
                        var _item_result=true,//
                            vt='';//error tips text
                        //console.log(opt);
                        //
                        for(var k in opt){
                            if(k === 'id'){//remove the id item
                                continue;
                            }
                            var vk=opt[k],
                                fun=typeof vk === 'function' ? vk : this.vtype[vk];
                            
                            fun=typeof fun === 'function' ? fun : this.vtype[k];
                            if(typeof  fun === 'function'){//get the validate method
                                var res=fun(val,vk),
                                    eobj=$(id+'_error');//TODO,get the error object
                                res =(vk === 'blank' && (allowBlank === false  || allowBlank === 'blank')) ? !res : res;//
                                
                                //
                                this.result=this.result ? res : this.result;
                                //
                                _item_result=_item_result ? res : _item_result;
                                //error tips text
                                vt=!res ? (opt[k+'Text']||opt[vk+'Text']||this.vtext[k+'Text']||this.vtext[vk+'Text']||'') : vt;
                                //error item
                                //console.log(res);
                                if(!_item_result){
                                    eobj.attr('title',vt)
                                        .css({'display':'inline-block'});//show error item
                                }else{
                                    eobj.hide();//hide error item
                                }
                                if(error && !res){
                                    error(id,vt);//
                                    return false;
                                }
                            }
                        }
                        
                        return this.result;
                    };
                    /*
                     * @desc validate init
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
                    this.init=function(options){
                        options=options||{};
                        if(!$.isArray(options)){
                            options=[].concat(options);
                        }
                        this.result=true;
                        // cache the validate options
                        this.options=options;
                        // to regist the blur event
                        this._rb(this.options);
                    };
                    /*
                     * @desc custom to define validation rules 
                     * @param {Object} rules:[{
                            'vtype':function(){
                                
                                //return true or false;
                            },
                            'vtypeText':''
                        },{
                            'ipAddress':function(){
                                
                                //return true or false;
                            },
                            'ipAddressText':''
                        }]
                     */
                    this.custom=function(rules){
                        rules=rules||{};
                        if(!$.isArray(rules)){
                            rules=[].concat(rules);
                        }
                        var i=0,
                            len=rules.length;
                        for(;i<len;i++){
                            var json=rules[i];
                            for(var k in json){
                                typeof json[k] === 'function' ? this.vtype[k]=json[k] : this.vtext[k]=json[k];//bind the vtype and vtext
                            }
                        }
                    };
                    this.validate=function(callback){
                        this.result=true;
                        
                        return this._r(this.options,callback);
                    };
                }
            };
        
        return new Validator();//Validator class
	});
})();