/*global angular*/
angular.module('renderer', [])
    .service('RendererService',function () {
        "use strict";
        /**
         * render an html string in an iframe
         * @param {HTMLElement} output
         * @param {String} content
         */
        this.renderHTML = function (output, content) {
            var temp, doc;
            output.innerHTML = '<iframe frameborder="0"></iframe>';
            temp = output.querySelector('iframe');
            doc = temp.contentDocument || temp.contentWindow || temp.document;
            doc.open();
            doc.writeln(content);
            doc.close();
            doc.onerror = function (e) {
                console.warn('renderer error', e);
                return false;
            };
        };
    }).directive('renderer', function (RendererService) {
        "use strict";
        return{
            restrict: 'A',
            link: function ($scope, el, attr) {
                $scope.$on('run', function (event,content) {
                   // console.log('run', arguments);
                    RendererService.renderHTML(el.get(0), content);
                });
            }
        };
    });