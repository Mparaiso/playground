/*global angular,keypress*/
/**
 * @description playground the web tech playground
 * @copyright 2014 mparaiso <mparaiso@online.fr>
 */
angular.module('shortcuts', [])
	.constant('ShortCutsEvent', {
		SHORTCUTS_SAVE: 'SHORTCUTS_SAVE',
		SHORTCUTS_RUN: 'SHORTCUTS_RUN',
		SHORTCUTS_FORMAT: 'SHORTCUTS_FORMAT'
	})
	.directive('shortcuts', function($rootScope, ShortCutsEvent, $timeout, $window) {
		"use strict";
		return {
			restrict: 'AEC',
			link: function() {
				$timeout(function() {
                    console.log('shortcuts');
					var listener = new keypress.Listener();
					listener.simple_combo("ctrl s", function(e) {
						$rootScope.$emit(ShortCutsEvent.SHORTCUTS_SAVE);
					});
					listener.simple_combo("ctrl r", function(e) {
						$rootScope.$emit(ShortCutsEvent.SHORTCUTS_RUN);
					});
					listener.simple_combo("ctrl shift f", function(e) {
						$rootScope.$emit(ShortCutsEvent.SHORTCUTS_FORMAT);
					});
				});

			}
		};
	});
