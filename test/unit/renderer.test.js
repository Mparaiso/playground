/*jslint eqeq:true,node:true,es5:true,white:true,plusplus:true,nomen:true,unparam:true,devel:true,regexp:true */
/*global jasmine,angular,module,inject,spyOn,beforeEach,describe,it,jQuery*/

describe('renderer',function(){

    "use strict";
    var RendererService,Compiler,$rootScope,$compile;
    beforeEach(function(){
        module('renderer',function($provide){
            $provide.service('Compiler',function(){
                this.compile=jasmine.createSpy('compile');
            });
        });
    });
    beforeEach(inject(function($injector){
        Compiler=$injector.get('Compiler');
        RendererService=$injector.get('RendererService');
        $rootScope=$injector.get('$rootScope');
        $compile=$injector.get('$compile');
    }));
    describe('RendererService',function(){

        describe('#renderHTML',function(){

            beforeEach(function(){
                this.editors={};
                this.output=angular.element('<div>');
                jQuery(this.output).appendTo('body');
                Compiler.compile.and.returnValue('content');
            });
            it('should render the content in an iframe',function(){
                RendererService.renderHTML(this.output.get(0),this.editors);
                expect(this.output.html()).toContain('iframe');
            });
        });
    });
    describe('renderer',function(){
        beforeEach(function(){
            Compiler.compile.and.returnValue('<html><body>content</body></html>');
            this.element=angular.element('<div renderer></div>');
            this.element.appendTo('body');
            $compile(this.element)($rootScope);
            $rootScope.$digest();
        });
        it('should render the directive',function(){
            $rootScope.$broadcast('run',{});
            $rootScope.$digest();
            expect(this.element.html()).toContain("iframe");
        });
    });
});  
