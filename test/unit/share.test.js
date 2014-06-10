/*jslint eqeq:true,node:true,es5:true,white:true,plusplus:true,nomen:true,unparam:true,devel:true,regexp:true */
/*global xdescribe,describe,angular,it,spyOn,inject,expect,jasmine,beforeEach */
describe('share',function(){
    beforeEach(module('share'));
    beforeEach(inject(function($q,Gist,$controller,$injector,$rootScope){
        this.$controller=$controller;
        this.$rootScope=$rootScope;
        this.$q=$q;
        this.Gist=Gist;
    }));
    describe('ShareCtrl',function(){
        describe('#gist',function(){
            beforeEach(inject(function($q){
                var gist={files:[]};
                spyOn(this.Gist,'findGistById').and.returnValue({then:function(a){a(gist);}});
                this.scope=this.$rootScope.$new();
                this.spy=jasmine.createSpy('spy');
                this.ShareCtrl=this.$controller('ShareCtrl',{$scope:this.scope});
            }));
            it('found a gist',function  () {
                expect(this.Gist.findGistById).toHaveBeenCalled();
                expect(this.scope.gist).toBeDefined();
            })
        });
    });
    describe('MenuCtrl',function(){
        beforeEach(function(){
            this.MenuCtrl=this.$controller('MenuCtrl',{$scope:this.$rootScope});
        });
        it('defined',function(){
            expect(this.MenuCtrl).toBeDefined();
        });
    });
});

