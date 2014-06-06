/*jslint eqeq:true,node:true,es5:true,white:true,plusplus:true,nomen:true,unparam:true,devel:true,regexp:true */
/*global angular,CodeMirror */
angular.module('linter',[])
.service('Linter',function(){
    this.getLinter=function(syntax){
        switch(syntax) {
            case 'javascript':
            case 'js':
                return CodeMirror.lint.javascript
            case 'coffeescript':
                return CodeMirror.lint.coffeescript
            default:
                return false
        }
    }
});
