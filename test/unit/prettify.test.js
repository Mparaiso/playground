/*jslint eqeq:true,node:true,es5:true,white:true,plusplus:true,nomen:true,unparam:true,devel:true,regexp:true */
/*global angular,define,describe,expect,css_beautify,module,beforeEach,it,inject */

describe('prettify',function(){
    "use strict";
    beforeEach(module('prettify'));
    it("prettify",inject(function($timeout,$injector,$compile,$rootScope) {
        var el=angular.element("<pre><code prettify>var x = 5;\nfunction foo(){};\n</code></pre>");
        $compile(el)($rootScope);
        $timeout.flush();
        $rootScope.$apply();
        expect(el.find('span').get(0)).toBeDefined();
    }));
});
