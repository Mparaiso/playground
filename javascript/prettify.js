/*global angular,define,CodeMirror,js_beautify,css_beautify,html_beautify */
/**
 * @description playground the web tech playground
 * @copyright 2014 mparaiso <mparaiso@online.fr>
 * @license GPL
 */
angular.module('prettify', [])
	.directive("prettify", function($window, $timeout) {
		"use strict";
		return {
			restrict:'AEC',
			link: function(scope, element) {
				$timeout(function() {
					element.text($window.hljs.highlightBlock(element.get(0)));
				},100);
			}
		};
	});