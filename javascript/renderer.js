/*global angular*/
/**
 * @description playground the web tech playground
 * @copyright 2014 mparaiso <mparaiso@online.fr>
 * @license GPL
 */
angular.module('renderer', [])
    .constant('RendererEvent', {
        COMPILATION_ERROR: 'COMPILATION_ERROR',
        RENDERER_ERROR: 'RENDERER_ERROR'
    })
    .service('RendererService', function($document, $rootScope, Compiler, RendererEvent) {
        "use strict";
        var iframe;
        /**
         * render an html string in an iframe
         * @param {HTMLElement} output
         * @param {editors} editors
         */
        this.renderHTML = function(output, editors) {
            // console.log('compile');
            var content, doc;
            var _editors = angular.copy(editors);
            try {
                content = Compiler.compile(_editors);
            } catch (error) {
                console.error(error);
                $rootScope.$broadcast(RendererEvent.COMPILATION_ERROR, error);
            }
            angular.element(iframe).remove();
            iframe = angular.element('<iframe>', {
                sandbox: 'allow-same-origin allow-scripts',
                frameborder: '0'
            }).get(0);
            output.appendChild(iframe);
            doc = iframe.contentDocument || iframe.contentWindow || iframe.document;
            doc.open();
            iframe.contentWindow.addEventListener('error', function(e) {
                /** listen for errors in the iframe @see  http://stackoverflow.com/questions/6327128/can-i-catch-exception-of-iframe-in-parent-window-of-iframe */
                $rootScope.$broadcast(RendererEvent.RENDERER_ERROR, [e.lineno, ':', e.colno, ' ', e.message].join(''));
            },false);
            doc.writeln(content);
            doc.close();
            //sconsole.clear();
            console.log(content);
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