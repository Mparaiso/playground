/*jslint eqeq:true,node:true,es5:true,white:true,plusplus:true,nomen:true,unparam:true,devel:true,regexp:true */
/*global angular,keypress,module,$,inject,it,expect,describe,beforeEach*/
/*Copyright © 2014 mparaiso <mparaiso@online.fr>. All Rights Reserved.*/
/* test/unit/shortcuts.test.js */
describe('shortcuts',function(){
    "use strict";
    beforeEach(module('shortcuts'));
    it('shouldnt throw',inject(function($compile,$rootScope,$timeout,ShortCutsEvent){
        this.$compile=$compile;
        this.$rootScope=$rootScope;
        this.el=angular.element('<div shortcuts></div>');
        this.ShortCutsEvent=ShortCutsEvent;
        $compile(this.el)($rootScope);
        $rootScope.$digest();
        $timeout.flush();
    }));
    /** @todo figure out how to test keypress */
});
