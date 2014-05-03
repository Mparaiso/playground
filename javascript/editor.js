/*global angular,define,CodeMirror,html_beautify */
angular.module('codeMirror', [])
    .service('CmEditor', function () {
        "use strict";
        this.editor = {
            value: '',
            placeholder: "<!--start coding here-->",
            currentPage: {},
            script: {value: "", type: ''},
            html: {value: '', type: ''},
            css: {value: '', type: ''}
        };
    })
    .directive('cmEditor', function ($timeout, $compile) {
        "use strict";
        CodeMirror.commands.autocomplete = function (cm) {
            CodeMirror.showHint(cm, CodeMirror.hint.anyword);
        };
        return {
            restrict: 'A',
            require: 'ngModel',
            link: function ($scope, el, attr, ngModel) {
                //console.log(arguments);
                var editor, timeout;
                $timeout(function () {
                    editor = CodeMirror.fromTextArea(el.get(0), {
                        syntax: 'html',
                        lineNumbers: true,
                        theme: 'monokai',
                        profile: 'html',
                        matchBrackets: true,
                        matchTags: true,
                        highlightSelectionMatches: true,
                        extraKeys: {"Ctrl-Space": "autocomplete", "Ctrl-K": 'autocomplete'}
                    });
                    editor.on('change', function (editor, changeObj) {
                        $timeout.cancel(timeout);
                        timeout = $timeout(function () {
                            ngModel.$setViewValue(editor.getValue());
                        }, 500);
                    });
                    ngModel.$render = function () {
                        editor.setValue(ngModel.$viewValue);
                    };
                    $scope.$on('format', function () {
                        var cursorPosition = editor.getCursor();
                        editor.setValue(html_beautify(editor.getValue()));
                        editor.setCursor(cursorPosition);
                    });
                }, 100);
            }
        };
    });
