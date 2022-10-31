// let sk = require('./helpers/Socket');

// module.exports = {
// 	socket: null,
//     start: function(io) {
//     	io.sockets.on('connection', 
//     		socketioJwt.authorize({
//     			secret: appConfig.jwt.secret,
//     			timeout: appConfig.jwt.timeout,
//     			callback: appConfig.jwt.callbackt
//     		})
//     	);
//     };

//     start: function(io) {
//     	io.on('connection', function(socket) {
//     		socket.on('message', function(message) {
//     			logger.log('info',message.value);
//     			socket.emit('ditConsumer',message.value);
//     			console.log('from console',message.value);
//     		});
//     	});
//     };

//     end: function(socket) {
//     	socket.on('disconnect', () => {
//     		skObj.pull(socket);
//     	});
//     }
// }