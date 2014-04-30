/*global angular,define,CodeMirror,html_beautify */
angular.module('utils', [])
    .service('Utility', function () {
        "use strict";
        this.getContent = function (gist) {
            if (gist.files && gist.files['index.html']) {
                return gist.files['index.html'].content;
            } else {
                return "no content found";
            }
        };
        this.belongsToAccount = function (gist,accounInfo ) {
            return accounInfo.id.toString() === gist.owner.id.toString();
        };
    });
