/*jslint eqeq:true,node:true,es5:true,white:true,plusplus:true,nomen:true,unparam:true,devel:true,regexp:true */
/*global angular,describe,it,expect,inject,module,beforeEach*/
describe('filters',function(){
    "use strict";
    beforeEach(inject(function($filter){
        this.limit=2;
        this.text="this\nis\na\ntext";
    }));
    describe('limitLinesTo',function(){
        it('it limits to 2 lines',inject(function($filter){
            expect($filter('limitLinesTo')(this.text,2)).toEqual("this\nis");
        }));
    });
});

