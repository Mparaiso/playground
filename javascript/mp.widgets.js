/*jslint eqeq:true,node:true,es5:true,white:true,plusplus:true,nomen:true,unparam:true,devel:true,regexp:true */
/*global angular,$ */
/**
 * @description playground the web tech playground
 * @copyright 2014 mparaiso <mparaiso@online.fr>
 * @license GPL
 */
"use strict";
angular.module('mp.widgets', [])
.directive('stopPropagation', function() {
    return {
        scope:{
            stopPropagation:"@"
        },
        link: function(scope, element) {
            element.on(scope.stopPropagation,function(e){
                e.stopPropagation();
            });
        }
    };
})
.directive('mpTooltip', function($timeout) {
    return {
        link: function(scope, element, attrs) {
            $timeout(function() {
                element.tooltip({
                    placement: 'auto'
                });
            });
        }
    };
})
.directive('mpNavTabs', function($timeout) {
    return {
        restrict: 'AEC',
        link: function(scope, element, attributes) {
            $timeout(function() {
                element.addClass('nav-tabs');
                element.tab();
                element.on('shown.bs.tab', function() {
                    scope.$emit('shown.bs.tab', this);
                });
            });
        }
    };
})
.directive('mpDropdown', function($timeout) {
    return {
        transclude: true,
        restrict: 'AEC',
        scope: {
            'ignoreClick': "@"
        },
        link: function(scope, element, attributes) {
            $timeout(function() {
                element.dropdown();
            });
        }
    };
});
