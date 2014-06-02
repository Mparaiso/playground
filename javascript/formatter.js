/*jslint eqeq:true,node:true,es5:true,white:true,plusplus:true,nomen:true,unparam:true,devel:true,regexp:true */
/*global angular,define,CodeMirror,js_beautify,css_beautify,html_beautify */
/**
 * Copyright © 2014 mparaiso <mparaiso@online.fr>. All Rights Reserved.
 */
/**
* Manage prettifying process
* */
angular.module('formatter', [])
.service('Formatter', function() {
    "use strict";
    /** 
     * format a string
     * @param {string} content
     * @param {string} syntax
     */
    this.format=function(content,syntax){
        switch (syntax) {
            case 'htmlmixed':
                case 'html':
                return html_beautify(content);
            case 'traceur':
                case 'text/typescript':
                case 'javascript':
                return js_beautify(content);
            case 'text/x-less':
                case 'css':
                return css_beautify(content);
            default:
                return content;
        }
    };
});
