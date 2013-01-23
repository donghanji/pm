/*
 * 
 * @name Unit Test Module
 * @desc
		This version is still not perfect,
		I need you to participate in ...
 *
 */
;(function(){
	if(module.declare === undefined){
		throw 'There is no global module.declare method!';
	}
	
	var toString=Object.prototype.toString,
		class2type = {};
	/*
	 * @name Util Class
	 *
	 */
	function Util(){};
	Util.prototype={
		type:function(value){
			return value == null ?
				String(value) :
				class2type[toString.call(value)] || 'object';
		},
		isString:function(value){
			return this.type(value) === 'string';
		},
		isNumeric:function(value){
			return !isNaN(parseFloat(value)) && isFinite(value);
		},
		isFunction:function(value){
			return this.type(value) === 'function';
		},
		isObject:function(value){
			return this.type(value) === 'object';
		},
		isArray:function(value){
			return this.type(value) === 'array';
		},
		isDate:function(value){
			return this.isObject(value) && (value instanceof Date);
		},
		/**
		 * Returns true if it is a primitive `value`. (null, undefined, number,
		 * boolean, string)
		 * @examples
		 *    isPrimitive(3) // true
		 *    isPrimitive("foo") // true
		 *    isPrimitive({ bar: 3 }) // false
		 */
		isPrimitive:function(value){
			return !(this.isFunction(value) || this.isObject(value) || this.isArray(value));
		},
		each:function(object,callback){
			var i=0,
				len=object.length,
				isObj = len === undefined ||this.isFunction(object);
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
		},
		keys:Object.keys||function(o){
			var ret=[];
			for (var p in o) {
			  if (o.hasOwnProperty(p)) {
				ret.push(p)
			  }
			}
		
			return ret
		},
		extend:function(){
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
		}
	};
	var $util=new Util();
	$util.each("Boolean,Number,String,Function,Array,Date,RegExp,Object".split(","), function(i, name) {
		class2type[ "[object " + name + "]" ] = name.toLowerCase();
	});
	
	window.onerror=function(error,path,line){
		
		return false;
	};
	/* @private
	 * @name Equivalent
	 * @desc
	 		equality any JavaScript type,not perfected
	 */
	function equiv(a,b){
		//console.log('identical values');
		if(a === b){
			
			return true;
		}
		//console.log('Primitive');
		if($util.isPrimitive(a) || $util.isPrimitive(b)){
			
			return a === b;
		}
		//console.log('Date ');
		if($util.isDate(a) && $util.isDate(b)){
			
			return a.getTime() === b.getTime();
		}
		//console.log('Error');
		if((a instanceof Error) && (b instanceof Error)){
			return  
				a.message === b.message &&
           		a.type === b.type &&
           		a.name === b.name &&
           		(a.constructor && b.constructor &&
            	a.constructor.name === b.constructor.name)
		}
		//console.log('Object and Array');
		var _a=$util.keys(a).sort(),
			_b=$util.keys(b).sort();
		if(_a.length === _b.length){
			var i=0,
				len=_a.length;
			for(;i<len;i++){
				if(_a[i] !==_b[i]){
					
					return false;
				}
				if(!equiv(a[_a[i]],b[_b[i]])){
					
					return false;
				}
			}
			
			return true;
		}
		
		return false;
	};
	//See Qunit extractStracktrace
	//See https://developer.mozilla.org/en/JavaScript/Reference/Global_Objects/Error/Stack
	function extractStacktrace(e,offset ) {
		offset=offset === undefined ? 3 : offset;
		var stack;
		if(e.stacktrace){//Opera
			return e.stacktrace.split('\n')[offset+3];
		}
		if(e.stack){//Mozilla,Chrome
			stack=e.stack.split('\n');
			if(/^error$/i.test(stack[0])){
				stack.shift();
			}
			
			return stack[offset];
		}
		if(e.sourceURL){//Safari
			if(/unit.module.js$/.test(e.sourceURL)){
				return 'Safari doesn\'t provide the line and file arguments.';
			}
			
			return e.sourceURL+':'+e.line;
		}
		
		return '';
	}
	function sourceFromStacktrace(offset){
		try{
			throw new Error();
		}catch(e){
			return extractStacktrace(e,offset );
		}
	};
	/*
	 * Handle Dom
	 */
	var $create=function(name){
			name=name||'div';
			
			return document.createElement(name);
		},
		$id=function(id){
			
			return document.getElementById(id);
		},
		$html=function(el,value){
			if (value !== undefined && el.nodeType === 1 ) {
				el.innerHTML=value;
			}else{
				return el.innerHTML;
			}
		},
		$css=function(el,css){
			if($util.type(css) === 'object'){
				for(var key in css){
					el.style[key]=css[key];
				}
			}
		},
		$empty=function(el){
			while(el.firstChild){
				el.removeChild(el.firstChild);
			}
		},
		$remove=function(el){
			if(el.parentNode){
				el.parentNode.removeChild(el);
			}
		},
		$append=function(dom,el){
			dom.appendChild(el);
		},
		$hasClass=function(el,cls){
			if(el.nodeType === 1 && (' '+el.className+' ').replace(/[\n\t\r]/g,'').indexOf(cls) > -1){
				
				return true;
			}
			return false;
		},
		$addClass=function(el,cls){
			if(el.nodeType === 1 && !$hasClass(el,cls)){
				el.className=(el.className+' '+cls).trim();
			}
		},
		$removeClass=function(el,cls){
			if(el.nodeType === 1){
				el.className=((' '+el.className+' ').replace(cls,' ')).trim();
			}
		};
	/*
	 * @name UnitUI Class
	 */
	function UnitUI(){
		var container=$create('div'),
			header=$create('h1'),
			banner=$create('h2'),
			toolbar=$create('div'),
			result=$create('p'),
			output=$create('ol');
		
		container.id='unit';
		header.id='unit-header';
		banner.id='unit-banner';
		toolbar.id='unit-toolbar';
		result.id='unit-result';
		output.id='unit-output';
		
		$html(header,'Unit Test Suite');
		$html(toolbar,'<input type="checkbox" id="unit-filter-pass" name="unit-filter-pass"/><label for="unit-filter-pass">Hide passed tests</label><span id="unit-modulefilter-container"><label for="unit-modulefilter">Module: </label><select id="unit-modulefilter" name="unit-modulefilter"><option value="0">All Modules</option></select></span>');
		
		$append(container,header);
		$append(container,banner);
		$append(container,toolbar);
		$append(container,result);
		$append(container,output);
		
		$append(document.body,container);
		
		this.addEvent();
	};
	UnitUI.prototype={
		addEvent:function(){
			var _this=this;
			$id('unit-filter-pass').addEventListener('click',function(){
				if(this.checked){
					$addClass($id('unit-output'),'hidepass');
				}else{
					$removeClass($id('unit-output'),'hidepass');
				}
			});
			$id('unit-output').addEventListener('click',function(e){
				var target=e.target;
				if($hasClass(target,'unit-name')){
					var ol=target.parentNode.parentNode.lastChild;
					$hasClass(ol,'unit-collapsed') ? $removeClass(ol,'unit-collapsed') : $addClass(ol,'unit-collapsed');
				}
			});
			$id('unit-modulefilter').addEventListener('change',function(e){
				var val=this.options[this.selectedIndex].value;
				_this.modulesHS(val);
			});
		},
		fail:function(){
			$addClass($id('unit-banner'),'failed');
		},
		modulesName:function(index,name){
			
			return 'Module '+index+':<span>'+name+'</span>';
		},
		modulesFilter:function(val,txt){
			var container=$id('unit-modulefilter');
			var option=$create('option');
			option.value=val;
			$html(option,txt);
			$append(container,option);
		},
		//show or hidden by module
		modulesHS:function(index){
			var output=$id('unit-output'),
				children=output.children;
			index=index+'';
			var i=0,
				len=children.length;
			var block=index === '0' ? 'block' : 'none';
			for(;i<len;i++){
				children[i].style.display=block;
			}
			if(index !== '0'){
				index=parseInt(index);
				children[index-1].style.display='block';
			}
		},
		unitsFail:function(detail){
			var container=$create('div');
			var expected=detail['expected']||'',
				result=detail['result'],
				actual=detail['actual']||'',
				source=detail['source']||'';
			//expected
			if(expected !== ''){
				var _expected=$create('div'),
					_label=$create('label'),
					_span=$create('span');
				$addClass(_expected,'unit-assert-expected unit-assert-container');
				$html(_label,'Expected:');
				$html(_span,expected);
				$append(_expected,_label);
				$append(_expected,_span);
				$append(container,_expected);
			}
			//result
			if(result !== ''){
				var _result=$create('div'),
					_label=$create('label'),
					_span=$create('span');
				$addClass(_result,'unit-assert-result unit-assert-container');
				$html(_label,'Result:');
				$html(_span,result);
				$append(_result,_label);
				$append(_result,_span);
				$append(container,_result);
			}
			//diff
			var diff=module.declare('diff.module');
			if(diff){
				var _diff=$create('div'),
					_label=$create('label'),
					_span=$create('span'),
					res=diff.diffString2(expected+'',actual+'');
				$addClass(_diff,'unit-assert-diff unit-assert-container');
				$css(_span,{'width':'auto','display':'inline-block'});
				$html(_label,'Diff:');
				$html(_span,res['o'].trim()+res['n'].trim());
				$append(_diff,_label);
				$append(_diff,_span);
				$append(container,_diff);
			}
			//source
			if(source !== ''){
				var _source=$create('div'),
					_label=$create('label'),
					_span=$create('span');
				$addClass(_source,'unit-assert-source unit-assert-container');
				$html(_label,'Source:');
				$html(_span,source);
				$append(_source,_label);
				$append(_source,_span);
				$append(container,_source);
			}
			return container;
		},
		unitsName:function(name){
			var span=$create('span');
			$html(span,name);
			$addClass(span,'unit-name');
			
			return span;
		},
		assertsName:function(name){
			var span=$create('span');
			name=Test.Config.unitAssertions+'.'+name;
			$html(span,name);
			$addClass(span,'assert-name');
			
			return span;
		},
		unitsResult:function(record){
			var _result=$id('unit-result');
			var counts=record['counts']||0,
				failed=record['failed']||0,
				passed=record['passed']||0;
			
			var html='Tests completed.<br><span>'+counts+'</span> assertions of <span class="total">'+passed+'</span> passed, <span class="failed">'+failed+'</span> failed.';
			
			$html(_result,html);
		},
		unitsCounts:function(record,id){
			var counts=record['counts']||0,
				failed=record['failed']||0,
				passed=record['passed']||0;
			var b=id&&$id(id)? $id(id) : $create('b');
			$html(b,'(<b style="color:#710909;">'+failed+'</b>, <b style="color:#5E740B">'+passed+'</b>, '+counts+'</b>)');
			
			return b;
		},
		createLi:function(content){
			var li=$create('li');
			$append(li,content);
			
			return li;
		},
		failLi:function(detail){
			var message=detail['message']||'',
				source=detail['source']||'';
			var content=this.assertsName(message);
			
			var li=this.createLi(content);
			$addClass(li,'fail');
			
			source && $append(li,this.unitsFail(detail));
			
			return li;
		},
		passLi:function(detail){
			var message=detail['message']||'';
			var content=this.assertsName(message);
			
			var li=this.createLi(content);
			$addClass(li,'pass');
			
			return li;
		},
		append:function(details){
			var result=details['result'],
				module=details['module'],
				name=details['name'],
				source=details['source'];
			var unitModule=this.unitModule(module),
				unitName=this.unitName(module,name),
				unitAssert=this.unitAssert(module,name),
				li=result ? this.passLi(details) : this.failLi(details);
			if(!result){
				$removeClass(unitName,'pass');
				$addClass(unitName,'fail');
			}
			$ui.unitsCounts({
				'counts':Test.Config.unitAssertions,
				'failed':Test.Config.unitFailAssertions,
				'passed':Test.Config.unitAssertions-Test.Config.unitFailAssertions},'unit-test-counts'+Test.Config.unitCount)
			
			$ui.unitsResult({
				'counts':Test.Config.unitTotalAssertions,
				'failed':Test.Config.unitTotalFailAssertions,
				'passed':Test.Config.unitTotalAssertions-Test.Config.unitTotalFailAssertions});
			
			$append(unitAssert,li);
		},
		unitModule:function(module){
			var unitModule=UnitUI.UnitModule[module] ? UnitUI.UnitModule[module] : UnitUI.UnitModule[module]=$create('li');
			$addClass(unitModule,'unit-module-list');
			
			return unitModule;
		},
		unitContainer:function(module){
			var unitContainer=UnitUI.UnitContainer[module] ? UnitUI.UnitContainer[module] : UnitUI.UnitContainer[module]=$create('ol');
			$addClass(unitContainer,'unit-tests-list');
			
			return unitContainer;
		},
		unitName:function(module,name){
			var unitModule=UnitUI.UnitName[module]? UnitUI.UnitName[module]:UnitUI.UnitName[module]={},
				unitName=unitModule[name] ? unitModule[name] : unitModule[name]=$create('li');
			if(!$hasClass(unitName,'fail')){
				$addClass(unitName,'pass');
			}
			return unitName;
		},
		unitAssert:function(module,name){
			var unitModule=UnitUI.UnitAssert[module]? UnitUI.UnitAssert[module]:UnitUI.UnitAssert[module]={},
				unitAssert=unitModule[name] ? unitModule[name] : unitModule[name]=$create('ol');
			$addClass(unitAssert,'unit-assert-list');
			$addClass(unitAssert,'unit-collapsed');
			
			return unitAssert;
		}
	};
	UnitUI.UnitModule={};//{moduleName:$create('li')}
	UnitUI.UnitContainer={};//{moduleName:$create('ol')}
	UnitUI.UnitName={};//{moduleName:{unitName:$create('li')}}
	UnitUI.UnitAssert={};//{moduleName:{unitAssert:$create('ol')}}
	
	var $ui=new UnitUI();
	/*
	 * @name Test Class
	 */
	function Test(options){
		var module='';
		if(Test.Config.moduleCount === 0){
			module=Test.Config.moduleName||Test.Config.moduleDefaultName
		}
		module=module||Test.Config.moduleName;
		$util.extend(this,options,{module:module});
	};
	Test.prototype={
		run:function(){
			var callback=this.callback;
			var module=this.module,
					name=this.name,
					unitModule=$ui.unitModule(module),
					unitContainer=$ui.unitContainer(module),
					unitName=$ui.unitName(module,name),
					unitAssert=$ui.unitAssert(module,name);
						
			//unit module	
			if(!(Test.Config.current && Test.Config.current.module === this.module)){
				Test.Config.moduleCount++;
				var _module=$create('div');
				$html(_module,$ui.modulesName(Test.Config.moduleCount,module));
				$addClass(_module,'unit-module-name');
				$append(unitModule,_module);
				//unit name container
				$append(unitModule,unitContainer);
				//unit module container
				$append($id('unit-output'),unitModule);
				
				$ui.modulesFilter(Test.Config.moduleCount,module);
			}
			$append(unitContainer,unitName);
			
			Test.Config.unitCount++;
			//unit name
			var _name=$create('div'),
				id='unit-test-num'+Test.Config.unitCount,
				counts='unit-test-counts'+Test.Config.unitCount;
			_name.id=id;
			$append(_name,$ui.unitsName(Test.Config.unitCount+'.'+name));
			$append(unitName,_name);
			//unit assert container
			$append(unitName,unitAssert);
			//unit assertions counts
			var _counts=$ui.unitsCounts({});
			_counts.id=counts;
			$append(_name,_counts);
			
			if(!(Test.Config.current && Test.Config.current.module === this.module && Test.Config.current.name === this.name)){
				Test.Config.unitAssertions=0;
				Test.Config.unitFailAssertions=0;
			}
			Test.Config.current=this;
			callback&&callback();
			
			return this;
		}
	};
	Test.Config={
		moduleDefaultName:'Running all tests',
		moduleCount:0,
		unitCount:0,
		unitAssertions:0,
		unitTotalAssertions:0,
		unitFailAssertions:0,
		unitTotalFailAssertions:0,
		moduleName:'',
		current:null
	};
	/*
	 * @name Unit Class
	 */
	function Unit(){};
	Unit.prototype={
		push:function(result,actual,expected,message){
			var current=Test.Config.current;
			if(!current){
				throw new Error('Assertion Error, was'+ sourceFromStacktrace());
			}
			message=message || (result ? 'okay' : 'failed');
			var source,
				details={
					module:current.module,
					name:current.name,
					result:result,
					actual:actual,
					expected:expected,
					message:message
				};
			Test.Config.unitAssertions++;
			Test.Config.unitTotalAssertions++;
			if(!result){
				source=sourceFromStacktrace();
				details.source=source;
				
				Test.Config.unitFailAssertions++;
				Test.Config.unitTotalFailAssertions++;
				$ui.fail();
			}
			
			$ui.append(details);
		}
	};
	var $unit=new Unit();
	/*
	 * @name Unit Assert
	 */
	function Assert(){
		var exports={};
		exports.ok=function(guard,message){
			$unit.push(guard,'','',message);
		};
		exports.equal=function(actual,expected,message){
			$unit.push(actual == expected,actual,expected,message);
		};
		exports.notEqual=function(actual,expected,message){
			$unit.push(actual != expected,actual,expected,message);
		};
		exports.deepEqual=function(actual,expected,message){
			$unit.push(equiv(actual,expected),actual,expected,message);
		};
		exports.notDeepEqual=function(actual,expected,message){
			$unit.push(!equiv(actual,expected),actual,expected,message);
		};
		exports.strictEqual=function(actual,expected,message){
			$unit.push(actual === expected,actual,expected,message);
		};
		exports.notStrictEqual=function(actual,expected,message){
			$unit.push(actual !== expected,actual,expected,message);
		};
		exports.AssertionError=function(message,actual,expected){
			
		};
		exports['throws']=function(block,error,message){
			
		};
		
		return exports;	
	};
	
	/*==============*/
	
	module.sets('unit.module',{
		'diff':false//
	});
	var $sets=module.sets('unit.module');
	var dependencies=[];
	if($sets['diff']){
		module.alias({
			'diff.module':'{modules}/diff.module'
		});
		dependencies.push('diff.module');
	}
	//define unit module
	module.declare('unit.module',dependencies,function(require,exports){
		exports.assert=new Assert();
		exports.run=function(units,callback){
			if(units === undefined){
				
				return;
			}
			if($util.isString(units) && callback === undefined){
				Test.Config.moduleName=units;//module name
				
				return;
			}
			if($util.isString(units)){
				new Test({
					name:units,
					callback:callback
				}).run();
			}
			if($util.isObject(units)){
				$util.each(units,function(k,v){
					exports.run(k,v);
				});
			}
		};
	});
})();