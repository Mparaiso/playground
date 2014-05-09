/*global inject,requirejs,describe,it,expect,beforeEach*/
xdescribe('repository', function() {
	"use strict";
	beforeEach(function() {
		module('repository');
	});
	describe("ParseData", function() {
		beforeEach(function() {
			var self = this;
			inject(function(ParseData) {
				self.ParseData = ParseData;
			});
		});
		it('shouldnt throw an error', function() {
			expect(this.ParseData).toBeDefined();
		});
	});
});
