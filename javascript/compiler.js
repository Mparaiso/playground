/*global angular*/
angular.module('compiler', [])
	.provider('Compiler', function() {
		"use strict";
		var tagCompilers = {}, scriptCompilers = {}, styleCompilers = {};
		return {
			addTagCompiler: function(language, _function) {

				tagCompilers[language] = _function;
			},
			addScriptCompiler: function(language, _function) {

				scriptCompilers[language] = _function;
			},
			addStyleCompiler: function(language, _function) {
				styleCompilers[language] = _function;
			},
			$get: function($document) {
				var document = $document.get(0);
				return {
					/* compile html */
					compileTags: function(language, value) {
						return tagCompilers[language] ? tagCompilers[language](value) : value;
					},
					/* compile script */
					compileScript: function(language, value) {
						return scriptCompilers[language] ? scriptCompilers[language](value) : value;
					},
					/* compile stylesheets */
					compileStyle: function(language, value) {
						return styleCompilers[language] ? styleCompilers[language](value) : value;
					},
					/** compile editor content into an html string */
					compile: function(editors) {
						var tags, script, style;
						editors.forEach(function(editor) {
							switch (editor.type) {
								case 'tags':
									tags = this.compileTags(editor.language, editor.value);
									break;
								case 'script':
									script = this.compileScript(editor.language, editor.value);
									break;
								case 'style':
									style = this.compileStyle(editor.language, editor.value);
									break;
							}
						}, this);
						var html = document.createElement('HTML');
						html.innerHTML = tags;
						html.normalize();
						if (style) {
							var head = html.querySelector('HEAD');
							var styleElement = document.createElement('STYLE');
							styleElement.innerHTML = style;
							head.appendChild(styleElement);
						}
						if (script) {
							var body = html.querySelector('BODY');
							var scriptElement = document.createElement('SCRIPT');
							scriptElement.innerHTML = "\n" + script;
							body.appendChild(scriptElement);
						}
						return html.innerHTML;
					}
				};
			}
		};
	});