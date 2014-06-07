/*jslint eqeq:true,node:true,es5:true,white:true,plusplus:true,nomen:true,unparam:true,devel:true,regexp:true */
/*global beforeEach,angular,describe,expect,it,jasmine,module,inject*/
describe('compiler',function  () {
    "use strict";
    beforeEach(module('compiler',function(CompilerProvider){
        CompilerProvider.addTagCompiler("html",angular.identity);
        CompilerProvider.addScriptCompiler("javascript",angular.identity);
        CompilerProvider.addStyleCompiler("css",angular.identity);
    }));
    beforeEach(inject(function(Compiler,$injector){
        this.Compiler=Compiler;
        this.editors=[{type:'style',language:"css",value:"foo"}
    ,{type:'script',language:"javascript",value:"bar"}
    ,{type:'tags',language:"html",value:"baz"}
        ];
    }));
    it('should compile ',function  () {
        var result=this.Compiler.compile(this.editors);
        ['foo','bar','baz'].forEach(function(value){
            expect(result).toContain(value);
        });
    });
});

