/*jslint eqeq:true,node:true,es5:true,white:true,plusplus:true,nomen:true,unparam:true,devel:true,regexp:true */
/*global module, inject,it,beforeEach,expect,spyOn,describe*/
"use strict";
describe('formatter',function(){
    var Formatter;
    beforeEach(module('formatter'));
    beforeEach(inject(function($injector){
        Formatter=$injector.get('Formatter');
    }));
    describe('Formatter',function(){
        describe('format',function(){
            it('returns a string',function(){
                var string="foo";
                expect(Formatter.format(string)).toEqual(string);
            });
            it('formats html',function(){
                var html="<div>foo</div>";
                expect(Formatter.format(html,'html')).toContain("foo");
            });
            it('formats js ',function(){
                var js="function foo(){ return 'foo'}";
                expect(Formatter.format(js,'javascript')).toContain('foo'); 
            });
            it('formats css ',function(){
                var css="body{ color:#FFF; }";
                expect(Formatter.format(css,'css')).toContain('color'); 
            });
        });
    });
});
