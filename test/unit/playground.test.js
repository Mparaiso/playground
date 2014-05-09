/*global xdescribe,describe,angular,it,spyOn,inject,expect,jasmine,beforeEach */
describe("playground", function() {
	"use strict";
	beforeEach(function() {
		angular.module('test', ['playground', 'Parse.mock']);
		module('test');
		var self = this;
		inject(function($injector, $controller) {
			self.$injector = $injector;
			self.$controller = $controller;
		});
	});
	xdescribe('SignUpCtrl', function() {
		beforeEach(function() {
			var self = this;
			this.scope = {};
			inject(function($controller) {
				self.SignUpCtrl = $controller('SignUpCtrl', {
					$scope: self.scope
				});
			});
		});
		describe('#signUp', function() {
			it('is a function', function() {
				expect(this.scope.signUp).toBeDefined();
			});
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