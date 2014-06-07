/*global xdescribe,describe,angular,it,spyOn,inject,expect,jasmine,beforeEach */
describe("playground", function() {
    "use strict";
    beforeEach(function() {
        angular.module('test', ['playground', 'Parse.mock']);
        module('test');
        inject(function($injector, $controller,$rootScope) {
            this.$injector = $injector;
            this.$controller = $controller;
            this.$rootScope=$rootScope;
            this.scope=this.$rootScope.$new();
        });
    });
    describe('MainCtrl',function(){
        beforeEach(function(){
            this.scope=this.$rootScope.$new();
            this.MainCtrl=this.$controller('MainCtrl',{$scope:this.scope});
        });
        it('Notification is defined',function(){
            expect(this.scope.Notification).toBeDefined();
        });
    });
    describe('SignUpCtrl', function() {
        beforeEach(function() {
            this.$scope = this.$injector.get('$rootScope').$new();
            this.SignUpCtrl = this.$controller('SignUpCtrl',{$scope:this.$scope});
        });
        describe('#signUp', function() {
            it('is a function', function() {
                expect(this.$scope.signUp instanceof Function).toBe(true);
            });
        });
    });
    describe('SignInCtrl',function(){
        beforeEach(inject(function($controller,$rootScope){
            this.SignInCtrl=$controller('SignInCtrl',{$scope:this.scope});
        }));
        it('credentials',function(){
            expect(this.scope.credentials).toBeDefined();
        });
    });
    describe('MenuCtrl',function(){
        beforeEach(function(){
            this.User=this.$injector.get('User');
            spyOn(this.User,'getCurrentUser').and.returnValue({});
            this.MenuCtrl=this.$controller('MenuCtrl',{$scope:this.scope});
        });
        it('user',function(){
            expect(this.scope.user).toBeDefined();
        });
    });
    describe("LibraryCtrl", function() {
        beforeEach(function() {
            this.$httpBackend = this.$injector.get('$httpBackend');
            this.$timeout = this.$injector.get('$timeout');
            this.$httpBackend.when('GET', /(.*)/).respond([]);
            this.$scope = {};
            this.Library = this.$injector.get('Library');
            spyOn(this.Library, 'query').and.callThrough();
            this.LibraryCtrl = this.$controller('LibraryCtrl', {
                $scope: this.$scope
            });
        });
        describe("#query", function() {
            it("should return search results", function(done) {
                var self = this;
                this.$scope.query('jquery').then(function() {
                    expect(self.Library.query).toHaveBeenCalledWith('jquery');
                }).then(done);
                this.$timeout.flush();
                this.$httpBackend.flush();

            });
        });
    });

});
