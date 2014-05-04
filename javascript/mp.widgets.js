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
                });
            }
        };
    })
    .directive('mpDropdown', function($timeout) {
        "use strict";
        return {
            transclude: true,
            restrict: 'AEC',
            link: function(scope, element, attributes) {
                $timeout(element.dropdown.bind(element));
            }
        };
    });