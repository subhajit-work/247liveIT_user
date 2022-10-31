let _ = require('lodash');
let SocketFactory = require('./SocketFactory');

class AdminSocket {

	constructor(socket, query) {
		this.socket = socket;
		this.socket.user = query;
	}

	push() {
		adminSocketsContainer.push(this.socket);
	}

	pull() {
		_.pullAllWith(adminSocketsContainer, [{ id: this.socket.id }], _.isMatch);
		return console.log(this.length() + ' remains.');
	}

	length() {
		return adminSocketsContainer.length;
	}

	async pushIfNotExists() {
		let isSocketThere = await this.filter();
		if (isSocketThere.length > 0) {
			throw {message: 'You are already in socket with '+ this.socket.user.user_id};		
		}else{
			this.push();
		}
	}

	filter() {
		let userId = this.socket.user.user_id;
		let result = _.filter(adminSocketsContainer, function(socket) {
			return socket.user.user_id == userId;
		});
		return result;
	}

	async update(data) {
		let socket = await this.filter();
		for (var property in data) {
			socket[0].key = data[property];
		}
		return this;
	}
}

module.exports = AdminSocket;