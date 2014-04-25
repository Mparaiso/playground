/*jslint browser:true*/
/*global window,CodeMirror*/
/* emmet plugin https://github.com/emmetio/codemirror/tree/cm4 */
window.onload = function() {
	"use strict";
	var el /*HTMLElement*/ ,
		editor /*CodeMirror*/ ,
		lint /*HTMLElement*/ ,
		renderHTML /*Function*/ ,
		main /*Function*/ ,
		bodyClicked /*Function*/ ,
		iframeHTML /*String*/ ,
		renderButton /*HTMLElement*/ ,
		output /*HTMLElement*/ ;
	/* render the content of editor in an iframe */
	renderHTML = function(output /*HTMLElement*/ , content /*String*/ ) /*Void*/ {
		var temp, doc;
		output.innerHTML = iframeHTML;
		temp = output.querySelector('iframe');
		doc = temp.contentDocument || temp.contentWindow || temp.document;
		doc.open();
		doc.writeln(content);
		doc.close();
	};
	/* on body clicked */
	bodyClicked = function(ev /*Event*/ ) /*Boolean*/ {
		switch (ev.target) {
			case renderButton:
				console.log('render');
				renderHTML(output, editor.getValue());
				break;
			case lint:
				console.log('lint');
				break;
		}
		return false;
	};
	/* entry point */
	main = function() /*Void*/ {
		el = document.querySelector('#code');
		lint = document.querySelector('#lint');
		renderButton = document.querySelector('#renderButton');
		output = document.querySelector('#output');
		iframeHTML = "<iframe frameborder='0' class='output'></iframe>";
		editor = CodeMirror.fromTextArea(el, {
			syntax: 'html',
			lineNumbers: true,
			theme: 'monokai',
			profile: 'html'
		});
		editor.setSize(null, '100%');
		window.addEventListener('click', bodyClicked, false);
	};
	main();
};