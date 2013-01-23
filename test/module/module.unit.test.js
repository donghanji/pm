/*
 * @name module.js unit test
 * @desc
 		unit test for module.js
 *
 */
(function(){
	if(module.declare === undefined){
		throw 'There is no global module.declare method!';
	}
	module.config({
		debug:true
	});
	module.alias({
		'unit':'{modules}/unit.module'
	});
	module.declare('module.unit.test',['unit'],function(require,exports){
		var assert=require('unit').assert,
			run=require('unit').run;
		return {
			'module.config':function(){
				assert.ok(true,'module.config');
				
				var options=module.options;
				assert.strictEqual(typeof module.config === 'function',true,'module.config is a function.');
				assert.strictEqual(typeof options,'object','module.options is a object');
				assert.ok(options.debug,'Current is in the debug mode');
				
				//alias,isInAlias,aliasId
				module.alias({'test':'test/test.file'});
				var _alias=module.isInAlias('test/test.file'),
					_alias2=module.isInAlias('test.file');
				assert.strictEqual(typeof _alias === 'object',true,'module.isInAlias,return an object instead of true');
				assert.strictEqual(typeof _alias2 === 'object',true);
				assert.strictEqual(_alias['k'],'test','In alias,k:test');
				assert.strictEqual(_alias['k'],_alias2['k']);
				assert.strictEqual(_alias['v'],'test/test.file','In alias,v:test.file');
				assert.strictEqual(_alias['v'],_alias2['v']);
				assert.deepEqual(_alias,{'k':'test','v':'test/test.file'},'test is test.file\'s alias');
				assert.deepEqual(_alias2,{'k':'test','v':'test/test.file'});
				
				assert.equal(module.isInAlias('xx.test'),null,'xx.test is not in alias,return null');
				
				//the test alias was already define,this setting is no effect
				module.alias({
					'test':'xx_test/test.file'
				});
				var _alias=module.isInAlias('test');
				assert.notStrictEqual(_alias['v'],'xx_test/test.file');
				
				var _k1=module.aliasId('test'),
					_k2=module.aliasId('xx'),
					_k3=module.aliasId('test/test.file'),
					_k4=module.aliasId('test.file'),
					_v1=module.aliasId('test','v'),
					_v2=module.aliasId('xx','v');
				assert.strictEqual(_k1,'test');
				assert.strictEqual(_v1,'test/test.file');
				assert.strictEqual(_k2,'xx');
				assert.strictEqual(_v2,'xx');
				assert.strictEqual(_k3,'test');
				assert.strictEqual(_k4,'test');
				
				//dirs,alias
				module.config({
					dirs:{'xx':'xx_test'}
				});
				var _alias={'test.file':'{xx}/test.file','no_test.file':'{no_xx}/no_test.file'}
				module.alias(_alias);
				module.dirs(_alias);
				var _alias=options.alias;
				assert.strictEqual(_alias['test.file'],'xx_test/test.file','in alias ,{xx} was instead of xx_test');
				assert.notStrictEqual(_alias['no_test.file'],'no_xx_test/test.file','in alias ,{no_xx} was not instead of no_xx_test');
				assert.strictEqual(_alias['no_test.file'],'/no_test.file','in alias ,{no_xx} was not instead of \'\'');
				
				//files,isInFiles
				module.config({
					files:['xx_test']
				});
				assert.ok(module.isInFiles('xx_test'),'xx_test is in files');
				module.files('xx_test2');
				assert.ok(module.isInFiles('xx_test2'),'xx_test2 is in files');
				module.files(['xx_test3','xx_test4']);
				assert.ok(module.isInFiles('xx_test3') && module.isInFiles('xx_test4'),'xx_test3 and xx_test4 are in files');
				module.files({
					'xx_test5':'test/xx_test5'
				});
				assert.ok(module.isInFiles('xx_test5'),'xx_test5 is in files');
				var _alias=module.isInAlias('xx_test5');
				assert.strictEqual(_alias['v'],'test/xx_test5','xx_test5 is in alias, too');
				
				//globals
				module.config({
					globals:{
						'$':'jquery.module'
					}
				});
				var $name=module.globals('$');
				assert.equal($name,'jquery.module','global $ is from jquery.module');
				module.globals({
					'$':'zepto.module'
				});
				var $name=module.globals('$');
				assert.notEqual($name,'zepto.module','global $ is from jquery.module, not zepto.module');
				module.globals({
					'$$':'prototype.module'
				});
				var $name=module.globals('$$');
				assert.equal($name,'prototype.module','global $$ is from prototype.module');
				
				//sets
				module.config({
					sets:{
						'xxmodule':{
							'time':300
						}
					}
				});
				var _sets=options.sets;
				assert.deepEqual(_sets,module.sets());
				var $set=module.sets('xxmodule');
				assert.equal($set['time'],300,'xxmodule\' time is 300');
				module.sets({
					'xxmodule':{
						'time':400
					}
				});
				var $set=module.sets('xxmodule');
				assert.notEqual($set['time'],400,'xxmodule\' time is not 400');
			},
			'module.declare':function(){
				//module.declare
				module.declare('xx_test_module',function(){
					return {
						add:function(){
							
							return 'test';
						}
					}
				});
				var _test_module=require('xx_test_module');
				assert.ok(module.isInModules('xx_test_module'),'xx_test_module is a module');
				assert.equal(typeof _test_module.add,'function','xx_test_module has add api');
				assert.equal(_test_module.add(),'test','xx_test_module has add api,return "test"');
				
				module.declare('xx_test_module',function(require){
					_test_module=require('xx_test_module');
					assert.ok(module.isInModules('xx_test_module'));
					assert.equal(typeof _test_module.add,'function');
					assert.equal(_test_module.add(),'test');
				});
			}
		};
	});
})();