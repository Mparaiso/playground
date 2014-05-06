/*jslint browser:true*/
/*global oppo*/
window.addEventListener('load', function() {
	"use strict";
        [].slice.call(document.querySelectorAll("script[type='text/lisp']"))
		.forEach(function(script) {
			var code = script.textContent;
			var ast = oppo.read(code);
			var js = oppo.compile(ast);
			(new Function(js))();
		});
});