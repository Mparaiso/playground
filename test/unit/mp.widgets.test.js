/*jslint eqeq:true,node:true,es5:true,white:true,plusplus:true,nomen:true,unparam:true,devel:true,regexp:true */
/*global angular,describe,$,it,beforeEach,expect,module,inject*/
describe('mp.widgets',function(){
    "use strict";
    beforeEach(module('mp.widgets'));
    describe('mpTooltip',function  () {
        beforeEach(inject(function($compile,$rootScope,$timeout){
            this.el=angular.element('<p title="foo" mp-tooltip>bar</p>');
            $compile(this.el)($rootScope);
            $rootScope.$digest();
            $timeout.flush();
            this.el.appendTo('body');
            this.el.trigger($.Event('mouseover'));
        }));
        it('on mouseover tooltip shows',function(){
            expect($('body').find('.tooltip').html()).toContain('foo');
        });
    });
    describe('stopPropagation',function(){
        it('stops propagation',inject(function($compile,$rootScope){
            this.el=angular.element('<p stop-propagation="click"></p>');
            $compile(this.el)($rootScope);
            $rootScope.$digest();
            this.el.trigger($.Event('click'));
        }));
    });
});

