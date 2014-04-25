/*global console*/
/**
 * using express 4 !
 */
"use strict";
var express=require('express');
var http=require('http');
var app=express();
var PORT = 3000;
app.use(express.static(__dirname+"/../"));

http.createServer(app).listen(PORT,function(){
	console.log('listening on '+PORT);
});
