/*global define,CodeMirror*/
define(function () {
    "use strict";
    return {
        Editor: function (el) {
            var editor = CodeMirror.fromTextArea(el, {
                syntax: 'html',
                lineNumbers: true,
                theme: 'monokai',
                profile: 'html'
            });
            editor.setSize(null, '100%');
            return editor;
        }
    };
});
