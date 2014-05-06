/*global angular,define,CodeMirror,js_beautify,css_beautify,html_beautify */
/**
 * @description playground the web tech playground
 * @copyright 2014 mparaiso <mparaiso@online.fr>
 * @license GPL
 */
angular.module('formatter', [])
	.service('Format', function(editor, isCurrentEditor) {
		"use strict";
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