/*jslint eqeq:true,node:true,es5:true,white:true,plusplus:true,nomen:true,unparam:true,devel:true,regexp:true */
/*global angular */
"use strict";
angular.module('ng')
.filter("limitLinesTo",function(){
    return  function(input,lines){
        lines=lines || Infinity;
        return input.split("\n").slice(0,lines).join("\n");
    };
});
