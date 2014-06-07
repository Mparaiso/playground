/*global angular*/
/**
 * @description playground the web tech playground
 * @copyright 2014 mparaiso <mparaiso@online.fr>
 * @license GPL
 */
angular.module('compiler', [])
	.provider('Compiler', function() {
		"use strict";
		/** compile scripts,styles and styles */
		var tagCompilers = {}, scriptCompilers = {}, styleCompilers = {},
			appendScriptStrategies = {}, appendStyleStrategies = {}, appendTagsStrategies = {};
		return {
			/**
			 * addTagCompiler
			 * @param {String} language
			 * @param {function(value:String)} _function
			 */
			addTagCompiler: function(language, _function) {
				tagCompilers[language] = _function;
				return this;
			},
			addScriptCompiler: function(language, _function) {
				scriptCompilers[language] = _function;
				return this;
			},
			addStyleCompiler: function(language, _function) {
				styleCompilers[language] = _function;
				return this;
			},
			/** 
			 * add a strategy to append tags
			 * @param {String} language
			 * @param {function(html:Element,value:String)} _function
			 */
			addAppendTagsStrategy: function(language, _function) {
				appendTagsStrategies[language] = _function;
				return this;
			},
			/**
			 * add a strategy to append scripts
			 * @param {String} language
			 * @param {function(html:Element,value:String)} _function
			 */
			addAppendScriptStrategy: function(language, _function) {
				appendScriptStrategies[language] = _function;
				return this;
			},
			/**
			 * add a strategy to append styles
			 * @param {String} language
			 * @param {function(html:Element,value:String)} _function
			 */
			addAppendStyleStrategy: function(language, _function) {
				appendStyleStrategies[language] = _function;
				return this;
			},
			$get: function($document, $rootScope) {
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
					/**
					 * manage how html tags are appended
					 * @param  {String} language
					 * @param  {Element} htmlElement
					 * @param  {String} value
					 * @return {Void}
					 */
					appendTags: function(language, htmlElement, value) {
						if (appendTagsStrategies[language]) {
							appendTagsStrategies[language](htmlElement, value);
						} else {
							htmlElement.normalize();
							htmlElement.innerHTML+=value;
							htmlElement.normalize();
						}
					},
					/**
					 * manage how scripts are appended
					 * @param  {String} language
					 * @param  {Element} htmlElement
					 * @param  {String} value
					 * @return {Void}
					 */
					appendScript: function(language, htmlElement, value) {
                        if (appendScriptStrategies[language]) {
                            appendScriptStrategies[language](htmlElement, value);
                        } else {
                            //default strategy
                            var body = htmlElement.querySelector('BODY');
                            if(!body){
                                body= document.createElement('BODY');
                                htmlElement.appendChild(body);
                            }
                            var scriptElement = document.createElement('SCRIPT');
                            scriptElement.innerHTML = "\n" + value;
                            body.appendChild(scriptElement);
                        }
					},
					/**
					 * manage how styles are appended
					 * @param  {String} language
					 * @param  {Element} htmlElement
					 * @param  {String} value
					 * @return {Void}
					 */
					appendStyle: function(language, htmlElement, value) {
                        var styleElement;
						if (appendStyleStrategies[language]) {
							appendStyleStrategies[language](htmlElement, value);
						} else {
							var head = htmlElement.querySelector('HEAD');
                            if(!head){
                                htmlElement.appendChild(document.createElement('HEAD'));
                                head=htmlElement.querySelector('HEAD');
                            }
                            styleElement=document.createElement('STYLE');
							styleElement.innerHTML = value;
							head.appendChild(styleElement);
						}
					},
					/** compile editor content into an html string */
					compile: function(editors) {
						var tags, script, style;
						var html = document.createElement('HTML');
						editors.sort(function(a, b) {
							//sort editors so tags editors appear first
							return a.type === "tags" ? false : true;
						}).forEach(function(editor) {
							switch (editor.type) {
								case 'tags':
									tags = this.compileTags(editor.language, editor.value);
									this.appendTags(editor.language, html, tags);
									html.normalize();
									break;
								case 'script':
									script = this.compileScript(editor.language, editor.value);
									this.appendScript(editor.language, html, script);
									break;
								case 'style':
									style = this.compileStyle(editor.language, editor.value);
									this.appendStyle(editor.language, html, style);
									break;
							}
						}, this);
						return html.innerHTML;
					}
				};
			}
		};
	});
