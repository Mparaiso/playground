/*global describe,beforeEach,inject,expect,spyOn,jasmine,angular,module,it,beforeEach*/
describe("api.parse", function() {
    "use strict";
    beforeEach(module('api.parse'));
    beforeEach(inject(function($injector,$q){
        this.$injector=$injector;
        this.$q=$q;
        this.Gist=this.$injector.get('Gist');   
        this.User=this.$injector.get('User');
        this.$rootScope=this.$injector.get('$rootScope');
        this.$timeout=this.$injector.get('$timeout');
        spyOn(Parse,'_ajax');
        spyOn(Parse,'initialize');
        Parse._ajax.and.callFake(function(){
            return Parse.Promise.when({id:'foo'});
        });
        Parse.initialize.and.callThrough(function(){
            console.log('initialize',arguments);
        });
        Parse.initialize("foo",'bar');
    }));

    describe("Gist", function() {
        beforeEach(function(){
            spyOn(this.User,'getCurrentUser').and.returnValue({});
            spyOn(this.User,'isAuthenticated').and.returnValue(true);
        });
        describe("#findLatest", function() {
            it('find latest gists', function(done) {
                this.Gist.findLatest().done(done);
            });
        });
        describe("#findGistById", function() {
            it('find gist by id', function(done) {
                this.Gist.findGistById("foo").then(done,done);
            });
        });
        describe('#create',function(){
            it('creates gist',function(done){
                spyOn(Parse.User,'current').and.returnValue({});
                this.Gist.create({id:'foo',public:true}).then(done)
            });
        });
        describe('#update',function(){
            it('creates gist',function(done){
                this.Gist.update('foo',{id:'foo',public:true}).then(done,function(err){
                    console.log('arguments',err);
                    done();
                });
            });
        });
        describe('#deleteById',function(){
            it('delete a gist',function(done){
                this.Gist.deleteById('foo').fail(done);
            })
        })
    });
    describe("User", function() {
        beforeEach(function() {
            var self = this;
            inject(function(User, Parse) {
                self.Parse = Parse;
                self.User = User;
            });
        });
        describe('getCurrentUser', function() {
            it('should be undefined', function() {
                spyOn(this.Parse.User,'current');
                expect(this.User.getCurrentUser()).toBeUndefined();
                expect(this.Parse.User.current).toHaveBeenCalled();
            });
        });
        describe("isAuthenticated", function() {
            it('should be false', function() {
                spyOn(this.Parse.User.prototype,'authenticated');
                this.Parse.User.prototype.authenticated.and.returnValue(false);
                expect(this.User.isAuthenticated()).toBeFalsy();
            });
        });
    });
    describe('Setting',function(){
        beforeEach(inject(function(Setting,$q){
            this.Setting=Setting;
            this.settings={};
            spyOn(Parse.User,'current').and.returnValue({
                toJSON:function(){return {settings:{}}},
                set:function(){},
                authenticated:function(){return true},
                save:function(){return $q.when(this.toJSON()); }
            });
        }));
        describe('#save',function(){
            it('when User saves settings',function(done){
                this.Setting.save(this.setting).then(done);
                this.$rootScope.$apply();
            });
        });
        describe('#get',function(){
            it('when User gets settings ',function(done){
                this.Setting.get().then(function(settings){
                    expect(settings).toBeDefined();
                })
                .then(done);
                this.$rootScope.$apply();
            });
        });
    });
});
