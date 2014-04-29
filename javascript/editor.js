/*global define,CodeMirror*/
define(function (require, exports) {
    "use strict";
    exports.Editor = function (el) {
        var editor = new CodeMirror(el, {
            syntax: 'html',
            lineNumbers: true,
            theme: 'monokai',
            profile: 'html'
        });
        editor.setSize(null, '480px');
        return editor;
    };
});
