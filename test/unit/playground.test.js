/*global describe,angular,it,inject,expect,jasmine,beforeEach */
xdescribe("playground", function() {
	"use strict";
	beforeEach(function() {
		angular.module('test', ['playground','Parse.mock']);
		module('test');
	});
	describe('SignUpCtrl', function() {
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
});
