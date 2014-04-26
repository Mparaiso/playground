/*jslint browser:true*/
/*global define,window,CodeMirror,console,requirejs*/
/* emmet plugin https://github.com/emmetio/codemirror/tree/cm4 */
define(function (require, exports, module) {
    "use strict";
    var bootstrap = require('bootstrap');
    var editor = require('./editor');
    var iframeHTML = require('text!./../templates/iframe.html');
    var view = require('./view');
    var route = require('./route');
    var github = require('./github');
    /* entry point */
    var main = function () /*Void*/ {
        var editorEl /*HTMLElement*/ = document.querySelector('#code');
        var codeEditor /*CodeMirror*/ = new editor.Editor(editorEl);
        var client = new github.Client();
        var rightMenuView = new view.RightMenu({client: client});
        var leftMenuView = new view.LeftMenu({client: client});
        var output = new view.Output();
        var mainRouter = new route.Main({
            view: {
                rightMenu: rightMenuView,
                leftMenu: leftMenuView,
                codeEditor: codeEditor,
                output: output
            }
        });
    };
    main();
});