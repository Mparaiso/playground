/*global angular,jasmine*/
angular.module('Parse.mock', [])
	.factory('Parse', function() {
		"use strict";
        spyOn(Parse,'_ajax');
		return Parse;
	});
