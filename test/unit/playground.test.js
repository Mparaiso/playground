/*jslint eqeq:true,node:true,es5:true,white:true,plusplus:true,nomen:true,unparam:true,devel:true,regexp:true */
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
    describe('HelpCtrl',function(){
        it('HelpCtrl is defined',inject(function($controller,$rootScope){
            this.scope=$rootScope.$new();
            this.HelpCtrl=$controller('HelpCtrl',{$scope:this.scope});
        }));
    });
    describe('GistCreatCtrl',function  () {
        beforeEach(inject(function  ($controller,$rootScope) {
            this.scope=$rootScope.$new();
            this.GistCreateCtrl=$controller('GistCreateCtrl',{$scope:this.scope});
        }));
        it('$scope.current.public should be true',function  () {
            expect(this.scope.Editor).toBeDefined();
        });
    });
    describe('GistListCtrl',function  () {
        beforeEach(inject(function($controller){
            this.scope=this.$rootScope.$new();
            this.scope.gists=[];
            while(this.scope.gists.length<15){
                this.scope.gists.push({});
            }
            this.GistListCtrl=$controller('GistListCtrl',{$scope:this.scope});
        }));
        it('#!hasPrevious',function  () {
            expect(this.scope.hasPrevious()).toBe(false);
        });
        it('#hasNext',function(){
            expect(this.scope.hasNext()).toBe(true);
        });
        it('shouldnt throw',function  () {
            this.scope.previous();
            this.scope.next();
        });
    });
    describe('SearchCtrl',function(){
        beforeEach(function(){
            this.$routeParams=this.$injector.get('$routeParams');
            this.$routeParams.query="foo";
            this.gists=[];
            this.$scope=this.$rootScope.$new();
            //spyOn(Parse.Query.prototype,'find').and.returnValue(Parse.Promise.when([new Parse.Collection()]));
            this.SearchCtrl=this.$controller('SearchCtrl',{$scope:this.$scope,gists:this.gists});
        });
        it('has query',function(){
            expect(this.$scope.query).toBeDefined();
        });
    });
    describe('EditorCtrl',function(){
        beforeEach(function(){
            this.EditorCtrl=this.$controller('EditorCtrl',{$scope:this.$rootScope});
        });
        it('it doesnt throw',function(){
            expect(this.$rootScope.Editor).toBeDefined();
        });
    });
    describe('AccountCtrl',function(){
        beforeEach(function(){
            this.gists=[];
            this.AccountCtrl=this.$controller('AccountCtrl',{gists:this.gists,$scope:this.$rootScope});
        });
        it('it doesnt throw',function(){
            expect(this.$rootScope.gists).toBeDefined();
        });
    });
    describe('EditorSettingsCtrl',function(){
        beforeEach(function(){
            this.EditorSettingsCtrl=this.$controller('EditorSettingsCtrl',{$scope:this.$rootScope});
        });
        it('it doesnt throw',function(){
            expect(this.$rootScope.EditorSettings).toBeDefined();
        });
    });
    describe('EditorMenuCtrl',function(){
        beforeEach(function(){
            this.EditorMenuCtrl=this.$controller('EditorMenuCtrl',{$scope:this.$rootScope});
        });
        it('it doesnt throw',function(){
            expect(this.$rootScope.Editor).toBeDefined();
        });
    });
    describe('EditorMenuCtrl',function(){
        beforeEach(function(){
            this.EditorMenuCtrl=this.$controller('EditorMenuCtrl',{$scope:this.$rootScope});
        });
        it('it doesnt throw',function(){
            expect(this.$rootScope.Editor).toBeDefined();
        });
    });
    describe('ExploreCtrl',function(){
        beforeEach(function(){
            this.gists=[];
            this.ExploreCtrl=this.$controller('ExploreCtrl',{gists:this.gists,$scope:this.$rootScope});
        });
        it('gists  ',function(){
            expect(this.$rootScope.gists).toBeDefined();
        });
    });
});
