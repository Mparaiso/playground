/*global define,console*/
/**
 * javascript/database.js
 */
define(function (require, exports, module) {
    "use strict";
    var iframeTemplate = require('text!../templates/iframe.html');
    module.exports = {
        /**
         * render an html string in an iframe
         * @param {HTMLElement} output
         * @param {String} content
         */
        renderHTML: function (output, content) {
            var temp, doc;
            output.innerHTML = iframeTemplate;
            temp = output.querySelector('iframe');
            doc = temp.contentDocument || temp.contentWindow || temp.document;
            doc.open();
            doc.writeln(content);
            doc.close();
            doc.onerror=function(){
                console.warn('script error',e);
                return false;
            };
        }
    };
});