// Dependencies
var express = require('express');
var crypto = require('crypto');
 
var app = require('express')();
var http = require('http').Server(app);
var io = require('socket.io')(http);

var port = process.env.PORT || 5000;

app.use(express.static('public'));

http.listen(port, function(){
  console.log('listening on *:'+port);
});

