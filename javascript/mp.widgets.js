/*global angular, */
angular.module('mp.widgets', [])
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
                    if (scope.ignoreClick) {
                        $('.dropdown-menu').on('click', function(e) {
                            e.stopPropagation();
                        });
                    }

                });
            }
        };
    });