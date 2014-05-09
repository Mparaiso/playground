/*global angular,$ */
/**
 * @description playground the web tech playground
 * @copyright 2014 mparaiso <mparaiso@online.fr>
 * @license GPL
 */
angular.module('mp.widgets', [])
    .directive('stopPropagation', function() {
        "use strict";
        return {
            scope:{
                stopPropagation:"@"
            },
            link: function(scope, element) {
                console.log(scope.stopPropagation);
                element.on(scope.stopPropagation,function(e){
                        e.stopPropagation();
                        e.preventDefault();
                        return false;
                });
            }
        };
    })
    .directive('mpTooltip', function($timeout) {
        "use strict";
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
        "use strict";
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
        "use strict";
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