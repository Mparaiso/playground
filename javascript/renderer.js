/*global angular*/
/**
 * @description playground the web tech playground
 * @copyright 2014 mparaiso <mparaiso@online.fr>
 * @license GPL
 */
angular.module('renderer', [])
    .service('RendererService', function($document, $rootScope, Compiler) {
        "use strict";
        /**
         * render an html string in an iframe
         * @param {HTMLElement} output
         * @param {editors} editors
         */
        this.renderHTML = function(output, editors) {
            var content, temp, doc;
            var _editors = angular.copy(editors);
            try {
                content = Compiler.compile(_editors);
            } catch (error) {
                $rootScope.$broadcast("compilation_error", error);
            }
            output.innerHTML = '<iframe sandbox="allow-same-origin allow-scripts " frameborder="0"></iframe>';
            temp = output.querySelector('iframe');
            doc = temp.contentDocument || temp.contentWindow || temp.document;
            console.log(content);
            doc.open();
            doc.writeln(content);
            doc.close();
            doc.onerror = function(e) {
                console.warn('renderer error', e);
                return false;
            };
        };
    }).directive('renderer', function(RendererService) {
        "use strict";
        return {
            restrict: 'A',
            link: function($scope, el, attr) {
                $scope.$on('run', function(event, editors) {
                    RendererService.renderHTML(el.get(0), editors);
                });
            }
        };
    });