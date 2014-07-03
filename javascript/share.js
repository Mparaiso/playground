/*jslint eqeq:true,node:true,es5:true,white:true,plusplus:true,nomen:true,unparam:true,devel:true,regexp:true */
/*global angular,url*/
/*Copyright © 2014 mparaiso <mparaiso@online.fr>. All Rights Reserved.*/
(function  () {
    "use strict";
    angular.module('share',['backend','renderer'])
    .config(function(CompilerProvider){
        CompilerProvider
        .addScriptCompiler('coffeescript', function(value) {
            return CoffeeScript.compile(value);
        })
        .addStyleCompiler('less', function(value) {
            var parser,result;
            parser = new less.Parser();
            parser.parse(value, function(a, b) {
                if(b){
                    result = b.toCSS();
                }else{
                    result="";
                }
            });
            return result;
        })
        .addTagCompiler('markdown', function(value) {
            return markdown.toHTML(value);
        })
        .addAppendScriptStrategy("traceur", function(html, value) {
            var traceurScript,optionScript,userScript;
            traceurScript = '<script src="//traceur-compiler.googlecode.com/git/bin/traceur.js"' +
                'type="text/javascript"></script>\n' +
                '<script src="//traceur-compiler.googlecode.com/git/src/bootstrap.js"' +
                'type="text/javascript"></script>\n';
            optionScript = '<script>traceur.options.experimental = true;</script>';
            userScript = '<script type="module">\n' + value + '\n</script>';
            html.innerHTML += traceurScript + optionScript + userScript;
        })
        .addAppendScriptStrategy('ruby', function(html, value) {
            var script = '<script src="vendor/opal.js"></script>\n' +
                '<script src="vendor/opal-parser.js"></script>\n' +
                '<script type="text/ruby">\n' + value + '\n</script>';
            html.innerHTML += script;
        })
        .addAppendScriptStrategy('typescript', function(html, value) {
            html.innerHTML += '<script type="text/typescript">\n' + value + '\n</script>\n' +
                '<script src="//niutech.github.io/typescript-compile/js/typescript.min.js"></script>' +
                '<script src="//niutech.github.io/typescript-compile/js/typescript.compile.min.js"></script>';
        })
        .addAppendScriptStrategy('scheme', function(html, value) {
            html.innerHTML += '<script type="text/scheme">' + value + '</script>';
            html.innerHTML += '<script src="vendor/outlet.js"></script>';
            html.innerHTML += '<script src="vendor/outlet-eval.js"></script>';
        });
    })
    .controller('ShareCtrl',function($scope,$location,$window,$rootScope,Gist){
        $scope.makeEditName=function(gistId){
           return $window.location.origin+$window.location.pathname.replace('share.htm','')+"#gist/"+gistId;
        };
        $scope.request=Gist.findGistById(url.id)
        .then(function(gist){
            $scope.gist=gist;
            console.log(gist);
            $rootScope.$broadcast("run",gist.files);
            $scope.$apply();
        },function(err){
            $scope.error=["Gist with id '",url.id||"undefined","' not found"].join('');
            $scope.$apply();
        });
    })
    .controller('MenuCtrl',angular.noop);
}());

