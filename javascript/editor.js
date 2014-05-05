/*global angular,define,CodeMirror,js_beautify,css_beautify,html_beautify */
/**
 * @description playground the web tech playground
 * @copyright 2014 mparaiso <mparaiso@online.fr>
 * @license GPL
 */
angular.module('editor', [])
    .service('Editor', function() {
        "use strict";
        /**
         * Manage editor data
         */
        this.selected = "tags";
        /**
         * editor configurations
         */
        var defaultEditorValues = [{
            active: true,
            type: "tags",
            language: "html",
            placeholder: "<!-- START CODING HERE-->",
            value: ""
            }, {
            type: "script",
            language: "javascript",
            placeholder: '/** START SCRIPTING HERE*/',
            value: ""
            }, {
            type: "style",
            language: "css",
            value: "",
            placeholder: '/** START STYLING HERE*/'
        }];
        this.getDefaultEditorValues = function() {
            return angular.copy(defaultEditorValues);
        };
        this.isEmpty = function() {
            return this.editors.every(function(editor) {
                return editor.value === '';
            });
        };
        /**
         * available languages
         */
        this.editorMenus = [
            {
                type: "tags",
                submenus: [{
                    language: "html",
                    hint:'HTML5'
                    }, {
                    language: "markdown",
                    hint:'markdown'
                    }]
                }, {
                type: "script",
                submenus: [{
                    language: 'javascript',
                    hint:'ecmascript 5'
                    }, {
                    language: 'coffeescript',
                    hint:'coffeescript'
                    }, {
                    language: 'traceur',
                    hint:'ecmascript 6'
                    },{
                    language: 'opal',
                    hint:'a implementation of the ruby language'
                    }]
                }, {
                type: 'style',
                submenus: [{
                    language: 'css',
                    hint:'cascading stylesheets'
                    }, {
                    language: 'less',
                    hint:'lesscss a language that compiles to css'
                    }]
                }];
        this.editor = {
            value: '',
            placeholder: "<!--start coding here-->"
        };

    })
    .directive('codeEditor', function($timeout, $compile) {
        "use strict";
        /**
         * DIRECTIVE FOR CODEMIRROR EDITOR
         */
        /** register a command for autocomplete */
        CodeMirror.commands.autocomplete = function(cm) {
            CodeMirror.showHint(cm, CodeMirror.hint.anyword);
        };
        return {
            restrict: 'AEC',
            require: 'ngModel',
            scope: {
                type: "=",
                language: "=",
                placeholder: "="
            },
            link: function($scope, el, attr, ngModel) {
                var change_selected, editor, timeout, types = {
                        javascript: 'javascript',
                        css: 'css',
                        less: 'text/x-less',
                        html: 'htmlmixed',
                        coffeescript: 'coffeescript',
                        typescript: 'typscript',
                        markdown: 'markdown',
                        jade: "jade",
                        haml: 'haml',
                        opal:'ruby',
                        traceur: 'javascript',
                        sass: 'sass'
                    };
                $timeout(function() {
                    editor = CodeMirror.fromTextArea(el.get(0), {
                        mode: types[$scope.language],
                        syntax: types[$scope.language],
                        placeholder: $scope.placeholder,
                        lineNumbers: true,
                        theme: 'monokai',
                        profile: $scope.language,
                        matchBrackets: true,
                        matchTags: true,
                        highlightSelectionMatches: true,
                        extraKeys: {
                            "Ctrl-Space": "autocomplete",
                            "Ctrl-K": 'autocomplete'
                        }
                    });
                    /** on editor.value change modify the directive model */
                    editor.on('change', function(editor, changeObj) {
                        $timeout.cancel(timeout);
                        timeout = $timeout(function() {
                            ngModel.$setViewValue(editor.getValue());
                        }, 500);
                    });
                    ngModel.$render = function() {
                        editor.setValue(ngModel.$viewValue);
                    };
                    //refresh editor once when showed , to avoid a codeMirror bug
                    //@see http://stackoverflow.com/questions/8349571/codemirror-editor-is-not-loading-content-until-clicked
                    change_selected = $scope.$on('change_selected', function(e, value) {
                        console.log(arguments);
                        if (value === $scope.type) {
                            $timeout(editor.refresh.bind(editor));
                            change_selected();
                        }
                    });
                    /** watch for language change , modify editor mode accordingly */
                    $scope.$watch('language', function(newValue, oldValue) {
                        //console.log(arguments);
                        if (newValue !== oldValue) {
                            /** if change then configure the editor accordingly */
                            editor.setOption('mode', types[newValue]);
                            editor.setOption('syntax', types[newValue]);
                            editor.setOption('profile', types[newValue]);
                        }
                    }, true);
                    /** on format event , format the editor content */
                    $scope.$on('format', function() {
                        var cursorPosition = editor.getCursor();
                        switch (editor.getOption('syntax')) {
                            case 'html':
                                editor.setValue(html_beautify(editor.getValue()));
                                break;
                            case 'javascript':
                                editor.setValue(js_beautify(editor.getValue()));
                                break;
                            case 'less':
                            case 'css':
                                editor.setValue(css_beautify(editor.getValue()));
                                break;
                        }
                        editor.setCursor(cursorPosition);
                    });
                });
            }
        };
    });
