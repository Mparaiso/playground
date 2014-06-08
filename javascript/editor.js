/*jslint eqeq:true,node:true,es5:true,white:true,plusplus:true,nomen:true,unparam:true,devel:true,regexp:true */
/*global angular,define,CodeMirror,js_beautify,css_beautify,html_beautify */

/**
 * @description playground the web tech playground
 * @copyright 2014 mparaiso <mparaiso@online.fr>
 * @license GPL
 */
"use strict";
angular.module('editor', ["linter",'formatter'])
.constant('EditorEvent', {
    CURRENT_EDITOR_CHANGE: 'CURRENT_EDITOR_CHANGE',
    CURRENT_EDITOR_FORMAT: 'FORMAT',
    EDITOR_SETTINGS_CHANGE:'EditorEvent.EDITOR_SETTINGS_CHANGE'
})
.service('Editor', function(EditorSettings) {
    this.EditorSettings=EditorSettings;
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
        "monokai","default","eclipse","twilight","night",'cobalt',"midnight"
    ].sort();
    this.selectedTheme="default";
})
.directive('codeEditor', function($timeout, $compile,Linter, Formatter,EditorEvent, Editor,EditorSettings, EditorTypes) {
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
            placeholder: "=",
            configuration:"="
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
                    wrap:EditorSettings.lineWrapping,
                    autoCloseBrackets: true,
                    lineNumbers: true,
                    lint:Linter.getLinter(EditorTypes[$scope.language].lint),
                    foldGutter:true,
                    theme: EditorSettings.theme,
                    profile: EditorTypes[$scope.language].syntax,
                    matchBrackets: true,
                    matchTags: true,
                    highlightSelectionMatches: true,
                    extraKeys: {
                        "Ctrl-Space": "autocomplete",
                        "Ctrl-K": 'autocomplete',
                        "Ctrl-Q":'foldCode'
                    },
                    gutters: ["CodeMirror-linenumbers", "CodeMirror-foldgutter","CodeMirror-lint-markers"]
                });
                //Set font size
                /** on editor.value change modify the directive model */
                editor.on('change', function(editor, changeObj) {
                    $timeout.cancel(timeout);
                    timeout = $timeout(function() {
                        ngModel.$setViewValue(editor.getValue());
                    }, 500);
                });
                $timeout(function(){
                    editor.getWrapperElement().style.fontSize=EditorSettings.fontSize+"px";
                },500);
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
                /** watch configuration */
                $scope.$on(EditorEvent.EDITOR_SETTINGS_CHANGE,function(event,args){
                    editor.setOption('theme',args.theme);
                    editor.setOption('wrap',args.lineWrapping);
                    editor.getWrapperElement().style.fontSize=args.fontSize+"px";
                });
                /** watch for language change , modify editor mode accordingly */
                $scope.$watch('language', function(newValue, oldValue) {
                    if (newValue !== oldValue) {
                        CodeMirror.autoLoadMode(editor, EditorTypes[newValue].syntax);
                        /** if change then configure the editor accordingly */
                        editor.setOption('mode', EditorTypes[newValue].mode);
                        editor.setOption('syntax', EditorTypes[newValue].syntax);
                        editor.setOption('profile', EditorTypes[newValue].syntax);
                        $timeout(function  () {
                            editor.setOption('lint',Linter.getLinter(EditorTypes[newValue].lint));
                        },1000);
                    }
                }, true);
                /** on format event , format the editor content */
                $scope.$on(EditorEvent.CURRENT_EDITOR_FORMAT, function() {
                    if (!isCurrentEditor()) {
                        return;
                    }
                    var cursorPosition = editor.getCursor();
                    editor.setValue(Formatter.format(editor.getValue(),editor.getOption('syntax')));
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
        mode: 'javascript',
        lint:'javascript'
    },
    css: {
        syntax: 'css',
        mode: 'css',
        lint:'css'
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
        mode: 'coffeescript',
        lint:'coffeescript'
    },
    typescript: {
        syntax: 'javascript',
        mode: 'javascript',
        lint:'typescript'
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
        mode: 'javascript',
        lint:"javascript"
    },
    sass: {
        syntax: 'sass',
        mode: 'sass'
    }
});
