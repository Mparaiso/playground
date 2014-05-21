/*jslint eqeq:true,node:true,es5:true,white:true,plusplus:true,nomen:true,unparam:true,devel:true,regexp:true */
/*global angular,define,CodeMirror,js_beautify,css_beautify,html_beautify */

/**
 * @description playground the web tech playground
 * @copyright 2014 mparaiso <mparaiso@online.fr>
 * @license GPL
 */
angular.module('editor', [])
.constant('EditorEvent', {
    CURRENT_EDITOR_CHANGE: 'CURRENT_EDITOR_CHANGE',
    CURRENT_EDITOR_FORMAT: 'FORMAT'
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
            language: 'scheme',
            hint: 'scheme provided by outlet'
        }]
    }, {
        type: 'style',
        submenus: [{
            language: 'css',
            hint: 'cascading stylesheets'
        }, {
            language: 'less',
            hint: 'less'
        }]
    }];
    this.themes=[
        "monokai","default","eclipse","twilight"
    ].sort();
    this.selectedTheme="default";
})
.directive('codeEditor', function($timeout, $compile, EditorEvent, Editor, EditorTypes) {
    "use strict";
    /**
    * DIRECTIVE FOR CODEMIRROR EDITOR
    */
    /** register a command for autocomplete */
    CodeMirror.commands.autocomplete = function(cm) {
        CodeMirror.showHint(cm, CodeMirror.hint.anyword);
    };
    CodeMirror.modeURL = "bower_components/codemirror/mode/%N/%N.js";
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
            $timeout(CodeMirror.requireMode.bind(CodeMirror, EditorTypes[$scope.language].syntax, function() {
                editor = CodeMirror.fromTextArea(el.get(0), {
                    mode: EditorTypes[$scope.language].mode,
                    syntax: EditorTypes[$scope.language].syntax,
                    placeholder: $scope.placeholder,
                    autoCloseBrackets: true,
                    lineNumbers: true,
                    theme: 'monokai',
                    profile: EditorTypes[$scope.language].syntax,
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
                        CodeMirror.autoLoadMode(editor, EditorTypes[newValue].syntax);
                        /** if change then configure the editor accordingly */
                        editor.setOption('mode', EditorTypes[newValue].mode);
                        editor.setOption('syntax', EditorTypes[newValue].syntax);
                        editor.setOption('profile', EditorTypes[newValue].syntax);
                    }
                }, true);
                /** on format event , format the editor content */
                $scope.$on(EditorEvent.CURRENT_EDITOR_FORMAT, function() {
                    console.log('format');
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
})
.service('EditorSettings',function(){
    this.theme="default";
    this.tabSize=4;
    this.fontSize=15;
    this.lineWrapping=false;
    this.refreshInterval=2000;
    this.autoRefresh=false;
})
/** match editor types with codeMirror syntax and modes */
.constant('EditorTypes', {
    javascript: {
        syntax: 'javascript',
        mode: 'text/typescript'
    },
    css: {
        syntax: 'css',
        mode: 'css'
    },
    less: {
        syntax: 'css',
        mode: "text/x-less"
    },
    html: {
        syntax: 'htmlmixed',
        mode: 'htmlmixed'
    },
    coffeescript: {
        syntax: 'coffeescript',
        mode: 'coffeescript'
    },
    typescript: {
        syntax: 'javascript',
        mode: 'javascript'
    },
    markdown: {
        syntax: 'markdown',
        mode: 'markdown'
    },
    jade: {
        syntax: "jade",
        mode: "jade"
    },
    haml: {
        syntax: 'haml',
        mode: 'haml'
    },
    ruby: {
        syntax: 'ruby',
        mode: 'ruby'
    },
    scheme: {
        syntax: 'scheme',
        mode: 'scheme'
    },
    traceur: {
        syntax: 'javascript',
        mode: 'javascript'
    },
    sass: {
        syntax: 'sass',
        mode: 'sass'
    }
});
