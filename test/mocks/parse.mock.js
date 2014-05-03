/*global angular,jasmine*/
angular.module('Parse.mock', [])
	.factory('Parse', function() {
		"use strict";
		var Parse = {};
		Parse.User = jasmine.createSpyObj('User', ['authenticated', 'current']);
		return Parse;
	});