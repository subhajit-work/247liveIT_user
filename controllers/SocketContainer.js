const express = require('express');
const app     = express();
const http    = require('http').Server(app);
const io      = require('socket.io')(http);
var socketioJwt   = require("socketio-jwt");
let appConfig = require('../config/app');

io.sockets.on('connection', 
	socketioJwt.authorize({
		secret: appConfig.jwt.secret,
		timeout: appConfig.jwt.timeout,
		callback: appConfig.jwt.callbackt
	})
);

io.sockets.on('authenticated', function(socket) {
console.log('connection--');

  let userId    = parseInt(socket.handshake.query.user_id);
  let username  = socket.handshake.query.username;
  let role      = socket.handshake.query.role;

  // console.log(socket.decoded_token, ' => ', io.engine.clientsCount);
  console.log(`{\n\tname: ${username}, \n\tsocket_id: ${socket.id}, \n\tuser_id: ${userId}, \n\trole: ${role}\n}`);
  if (!userId || !username || !role) {
    socket.emit('error_found', {error_message: 'you dont have passed all required params.'});
    console.log('Error. you dont have passed all required params.');
  }
});

exports.io = io;