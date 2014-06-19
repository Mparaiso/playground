/*jslint eqeq:true,node:true,es5:true,white:true,plusplus:true,nomen:true,unparam:true,devel:true,regexp:true */
/*global angular,url*/
/*Copyright © 2014 mparaiso <mparaiso@online.fr>. All Rights Reserved.*/
(function  () {
    "use strict";
    angular.module('share',['backend','renderer'])
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

