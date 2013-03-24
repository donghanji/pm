/*
 * @name jQuery.attr Module
 * @desc
		jQuery Attribute to realize
 *
 */

(function(global,undefined){
	if(module.declare === undefined){
		throw 'There is no global module.declare method!';
	}
	module.alias({
		'jquery.selector':'{mobile}/jquery.selector'
	});
	//define jquery.attr module
	module.declare('jquery.attr',['jquery.selector'],function(require,exports,module){
		var $=require('jquery.selector');
		var Exp_OTHER={
			SPACE:/\s+/,
			NTR:/[\n\t\r]/g,
			NUM:/^[\-+]?(?:\d*\.)?\d+$/i
		};
		$.fn.extend({
			html:function(value){
				return this.access(this,function(key,value){
					if (value !== undefined && this.nodeType === 1 ) {
						this.innerHTML=value;
					}else{
						return this.innerHTML;
					}
				},null,value);
			},
			text:function(value){
				return this.access(this,function(key,value){
					if (value !== undefined && this.nodeType === 1 ) {
						this.textContent=value;
					}else{
						return this.textContent;
					}
				},null,value);
			},
			val:function(value){
				return this.access(this,function(key,value){
					if (value !== undefined && this.nodeType === 1 ) {
						this.value=value;
					}else{
						return this.value;
					}
				},null,value);
			},
			attr:function(key,value){
				return this.access(this,function(key,value){
					if($.type(key) === 'string' && $.type(value) !== 'string'){
						return this.getAttribute(key);
					}else{
						if($.type(key) === 'string'){
							this.setAttribute(key,value);
						}
						if($.type(key) === 'object'){
							value=key;
							for(var key in value){
								this.setAttribute(key,value[key]);
							}
						}
					}
				},key,value,arguments.length);
			},
			removeAttr:function(value){
				return this.access(this,function(key,value){
					if (this.nodeType === 1) {
						var attrName=(value || '').split(Exp_OTHER.SPACE),
							l=attrName.length,
							i=0;
						for(;i<l;i++){
							this.removeAttribute(attrName[i]);
						}
					}
				},null,value,arguments.length);
			},
			addClass:function(value){
				return this.clsAccess(this,function(cls){
					if(this.nodeType === 1){
						this.className=(this.className+cls).trim();
					}
				},value,false);
			},
			removeClass:function(value){
				return this.clsAccess(this,function(cls){
					if(this.nodeType === 1){
						this.className=((' '+this.className+' ').replace(cls,' ')).trim();
					}
				},value,false);
			},
			hasClass:function(value){
				return this.clsAccess(this,function(cls){
					if(this.nodeType === 1 && (' '+this.className+' ').replace(Exp_OTHER.NTR).indexOf(cls) > -1){
						return true;
					}
					return false;
				},value,true);
			},
			clsAccess:function(elems,callback,value,r){
				var i=0,
					l=elems.length,
					v=value.replace(Exp_OTHER.NTR).trim().split(Exp_OTHER.SPACE),
					vl=v.length,
					re=true;
				
				for(;i<l;i++){
					re=true;
					for(j=0;j<vl;j++){
						re=callback.call(this[i],' '+v[j]+' ') && re;
					}
				}
				
				return r ? re : this;
			}
		});
	});
})(this);