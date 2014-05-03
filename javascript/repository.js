/*global angular,Parse*/
angular.module('repository', ['ngResource'])
/** deals with fetching/persisting gists from github gist api */
    .provider('ParseData',function(){
        "use strict";
        return {
            $get:function(){
                return {};
            }
        };
    });
