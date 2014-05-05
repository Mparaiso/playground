/*global angular,keypress*/
angular.module('shortcuts', [])
	.directive('shortcuts', function($rootScope, $timeout, $window) {
		"use strict";
		return {
			restrict: 'AEC',
			link: function() {
				$timeout(function() {
					var listener = new keypress.Listener();
					listener.simple_combo("ctrl s", function(e) {
						$rootScope.$broadcast('save');
					});
						listener.simple_combo("ctrl r", function(e) {
						$rootScope.$broadcast('doRun');
					});
				});

			}
		};
	});