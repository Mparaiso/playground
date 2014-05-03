/*global describe,beforeEach,inject,expect,spyOn,jasmine,angular,module,it,beforeEach*/
describe("api.parse", function() {
	"use strict";
	console.log("jasmine version", jasmine.version);
	beforeEach(function() {
		angular.module('test', ['api.parse', 'Parse.mock']);
		module('test');
	});
	describe("Gist", function() {
		beforeEach(function() {
			var self = this;
			inject(function(Gist) {
				self.Gist = Gist;
			});
		});
		describe("findLatestGists", function() {
			it('should execute', function() {
				this.Gist.findLatestGists();
			});
		});
		describe("findGistById", function() {
			it('should execute', function() {
				var id = "foo";
				this.Gist.findGistById(id);
			});
		});
	});
	describe("User", function() {
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
				expect(this.User.getCurrentUser()).toBeUndefined();
				expect(this.Parse.User.current).toHaveBeenCalled();
			});
		});
		describe("isAuthenticated", function() {
			it('should be false', function() {
				this.Parse.User.authenticated.and.returnValue(false);
				expect(this.User.isAuthenticated()).toBeFalsy();
				expect(this.Parse.User.authenticated).toHaveBeenCalled();
			});
		});
	});
});