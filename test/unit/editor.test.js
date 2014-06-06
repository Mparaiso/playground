/*jslint eqeq:true,node:true,es5:true,white:true,plusplus:true,nomen:true,unparam:true,devel:true,regexp:true */
/*global angular,describe,beforeEach,inject,it,module*/

describe('editor',function(){
    "use strict";
    beforeEach(module('editor'));
    beforeEach(inject(function  (EditorEvent,Editor,EditorSettings) {
        this.EditorSettings=EditorSettings;
        this.Editor=Editor;
        this.EditorEvent=EditorEvent;
        this.Editor.editors=this.Editor.getDefaultEditorValues();
    }))
    describe('Editor',function  () {

        it('#isEmpty',function(){
            expect(this.Editor.isEmpty()).toBe(true);
        });
    })
    describe('codeEditor',function(){
        beforeEach(function  () {
            spyOn(CodeMirror,'requireMode').and.callFake(function(syn,cb){
                cb();
            });
        });
        beforeEach(inject(function  ($injector,$timeout,$compile,$rootScope) {
            this.$timeout=$timeout;
            this.el=angular.element('<textarea language="language"  data-ng-model="foo"  ></textarea>');
            this.el.addClass('code-editor');
            this.el.appendTo('body')
            this.scope=$rootScope.$new();
            this.scope.foo="";
            this.scope.language="javascript";
            this.el= $compile(this.el)(this.scope);
            this.scope.$digest();
            this.scope.$digest();
            this.$timeout.flush();
        }));
        it('should exist',function(){
            this.scope.language="traceur";
            this.scope.$digest();
            this.scope.$broadcast(this.EditorEvent.CURRENT_EDITOR_FORMAT);
            this.scope.$broadcast('EditorSettingsChange',{theme:'foo',fontSize:23});
            this.scope.foo="bar";
            this.scope.$digest();
            console.log(this.el);
        });
    });
});
