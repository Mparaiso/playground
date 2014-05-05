/*global angular,keypress*/
/**
 * @description playground the web tech playground
 * @copyright 2014 mparaiso <mparaiso@online.fr>
 * @license GPL
 */
angular.module('shortcuts', [])
	.directive('shortcuts', function($rootScope, $timeout, $window) {
		"use strict";
		return {
			restrict: 'AEC',
			link: function() {
				$timeout(function() {
					var listener = new keypress.Listener();
					listener.simple_combo("ctrl s", function(e) {
						$rootScope.$emit('doSave');
					});
					listener.simple_combo("ctrl r", function(e) {
						$rootScope.$emit('doRun');
					});
				});

			}
		};
	});