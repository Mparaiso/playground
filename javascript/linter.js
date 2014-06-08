/*jslint eqeq:true,node:true,es5:true,white:true,plusplus:true,nomen:true,unparam:true,devel:true,regexp:true */
/*global angular,CodeMirror */
/*Copyright © 2014 mparaiso <mparaiso@online.fr>. All Rights Reserved.*/
angular.module('linter',[])
.service('Linter',function(){
    "use strict";
    this.getLinter=function(syntax){
        switch(syntax) {
            case 'javascript':
            case 'js':
                return CodeMirror.lint.javascript;
            case 'coffeescript':
                return CodeMirror.lint.coffeescript;
            case 'css':
                return CodeMirror.lint.css;
            default:
                return false;
        }
    };
});
