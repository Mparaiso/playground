/*jslint eqeq:true,node:true,es5:true,white:true,plusplus:true,nomen:true,unparam:true,devel:true,regexp:true */
/*global angular,beforeEach,CodeMirror,describe,it,expect,inject,module*/
describe('linter',function(){
    "use strict";
    beforeEach(function  () {
        window.CodeMirror={lint:{javascript:function(){},coffeescript:function(){}}};   // body...
    })
    beforeEach(module('linter'));
    beforeEach(inject(function(Linter){
        this.Linter=Linter;
    }));
    it('javascript',function(){
        expect(this.Linter.getLinter('javascript')).toEqual(CodeMirror.lint.javascript);
    });
    it('coffeescript',function(){
        expect(this.Linter.getLinter('coffeescript')).toEqual(CodeMirror.lint.coffeescript);
    });
    it('default',function(){
        expect(this.Linter.getLinter('html')).toEqual(false);
    });
});

