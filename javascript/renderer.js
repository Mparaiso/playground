/*global angular*/
/**
 * @description playground the web tech playground
 * @copyright 2014 mparaiso <mparaiso@online.fr>
 * @license GPL
 */
angular.module('renderer', [])
    .service('RendererService', function($document, Compiler) {
        "use strict";
        /**
         * render an html string in an iframe
         * @param {HTMLElement} output
         * @param {editors} editors
         */
        this.renderHTML = function(output, editors) {
            var temp, doc;
            var _editors = angular.copy(editors);
            var content = Compiler.compile(_editors);
            output.innerHTML = '<iframe frameborder="0"></iframe>';
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