/*global angular,define,CodeMirror,js_beautify,css_beautify,html_beautify */
/**
 * @description playground the web tech playground
 * @copyright 2014 mparaiso <mparaiso@online.fr>
 * @license GPL
 */
angular.module('editor', [])
    .constant('EditorEvent', {
        CURRENT_EDITOR_CHANGE: 'CURRENT_EDITOR_CHANGE',
        FORMAT: 'FORMAT'
    })
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
                    hint: 'HTML5'
                    }, {
                    language: "markdown",
                    hint: 'markdown'
                    }]
                }, {
                type: "script",
                submenus: [{
                    language: 'javascript',
                    hint: 'ecmascript 5'
                    }, {
                    language: 'coffeescript',
                    hint: 'coffeescript'
                    }, {
                    language: 'typescript',
                    hint: 'typescript '
                    }, {
                    language: 'traceur',
                    hint: 'ecmascript 6'
                    }, {
                    language: 'ruby',
                    hint: 'through opal a ruby like language that compiles to js'
                    }, {
                    language: 'lisp',
                    hint: 'through oppo a lisp like language that compiles to js'
                    }]
                }, {
                type: 'style',
                submenus: [{
                    language: 'css',
                    hint: 'cascading stylesheets'
                    }, {
                    language: 'less',
                    hint: 'lesscss a language that compiles to css'
                    }]
                }];
    })
    .directive('codeEditor', function($timeout, $compile, EditorEvent, Editor) {
        "use strict";
        /**
         * DIRECTIVE FOR CODEMIRROR EDITOR
         */
        /** register a command for autocomplete */
        CodeMirror.commands.autocomplete = function(cm) {
            CodeMirror.showHint(cm, CodeMirror.hint.anyword);
        };
        CodeMirror.modeURL = "bower_components/codemirror/mode/%N/%N.js";
        var types = {
            javascript: 'javascript',
            css: 'css',
            less: 'css',
            html: 'htmlmixed',
            coffeescript: 'coffeescript',
            typescript: 'javascript',
            markdown: 'markdown',
            jade: "jade",
            haml: 'haml',
            opal: 'ruby',
            ruby: 'ruby',
            lisp: 'commonlisp',
            traceur: 'javascript',
            sass: 'sass'
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
                var change_selected, editor, timeout;

                function isCurrentEditor() {
                    return Editor.selected === $scope.type;
                }
                $timeout(CodeMirror.requireMode.bind(CodeMirror, types[$scope.language], function() {
                    editor = CodeMirror.fromTextArea(el.get(0), {
                        mode: types[$scope.language],
                        syntax: types[$scope.language],
                        placeholder: $scope.placeholder,
                        autoCloseBrackets: true,
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
                    change_selected = $scope.$on(EditorEvent.CURRENT_EDITOR_CHANGE, function(e, value) {
                        // console.log(arguments);
                        if (value === $scope.type) {
                            $timeout(editor.refresh.bind(editor));
                            change_selected();
                        }
                    });
                    /** watch for language change , modify editor mode accordingly */
                    $scope.$watch('language', function(newValue, oldValue) {
                        //console.log(arguments);
                        if (newValue !== oldValue) {
                            CodeMirror.autoLoadMode(editor, types[newValue]);
                            /** if change then configure the editor accordingly */
                            editor.setOption('mode', types[newValue]);
                            editor.setOption('syntax', types[newValue]);
                            editor.setOption('profile', types[newValue]);
                        }
                    }, true);
                    /** on format event , format the editor content */
                    $scope.$on(EditorEvent.FORMAT, function() {
                        if (!isCurrentEditor()) {
                            return;
                        }
                        // console.log('format', editor.getOption('syntax'));
                        var cursorPosition = editor.getCursor();
                        switch (editor.getOption('syntax')) {
                            case 'htmlmixed':
                            case 'html':
                                editor.setValue(html_beautify(editor.getValue()));
                                break;
                            case 'traceur':
                            case 'text/typescript':
                            case 'javascript':
                                editor.setValue(js_beautify(editor.getValue()));
                                break;
                            case 'text/x-less':
                            case 'css':
                                editor.setValue(css_beautify(editor.getValue()));
                                break;
                        }
                        editor.setCursor(cursorPosition);
                    });
                }));
            }
        };
    });