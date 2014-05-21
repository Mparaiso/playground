/*global describe,beforeEach,inject,expect,spyOn,jasmine,angular,module,it,beforeEach*/
describe("api.parse", function() {
    "use strict";
    //console.log("jasmine version", jasmine.version);
    beforeEach(function() {
        spyOn(Parse,'_ajax');
        spyOn(Parse,'initialize');
        Parse._ajax.and.callFake(function(){
            console.log('ajax',arguments);
        });
        Parse.initialize.and.callThrough(function(){
            console.log('initialize',arguments);
        })
        module('api.parse');
        inject(function($injector){
            self.$injector=$injector;
        });
    });
    describe("Gist", function() {

        beforeEach(function() {

            this.Gist=this.$injector.get('Gist');   
            this.$rootScope=this.$injector.get('$rootScope');
            this.$timeout=this.$injector.get('$timeout');
        });
        describe("findLatest", function() {
            it('should execute', function(done) {
                this.Gist.findLatest().then(done).catch(function(err){
                    console.log('fail',arguments);
                    done();
                });
                this.$rootScope.$apply();
                this.$timeout.flush();
            });
        });
        xdescribe("findGistById", function() {
            it('should execute', function() {
                var id = "foo";
                this.Gist.findGistById(id);
            });
        });
    });
    xdescribe("User", function() {
        beforeEach(function() {
            var self = this;
            module('test');
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
        xdescribe("isAuthenticated", function() {
            it('should be false', function() {
                spyOn(this.Parse.User.prototype,'authenticated');
                this.Parse.User.prototype.authenticated.and.returnValue(false);
                expect(this.User.isAuthenticated()).toBeFalsy();
                //expect(this.Parse.User.prototype.authenticated).toHaveBeenCalled();
            });
        });
    });
});
