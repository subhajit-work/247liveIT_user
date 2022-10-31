let _ = require('lodash');

class Socket {

	constructor(socket, input, contextContainer) {
		this.socket = socket;
		this.socket.user = input;
		this.container = contextContainer;
	}

	push() {
		this.container.push(this.socket);
	}

	pull() {
		_.pullAllWith(this.container, [{ id: this.socket.id }], _.isMatch);
		return console.log(this.length() + ' remains.');
	}

	length() {
		return this.container.length;
	}

	async pushIfNotExists() {
		let isSocketThere = await this.filter();
		if (isSocketThere.length > 0) {
			throw {message: 'You are already in socket with '+ this.socket.user.id};		
		}else{
			this.push();
		}
	}

	filter() {
		let uniqueId = this.socket.user.id;
		let result = _.filter(this.container, function(socket) {
			return socket.user.id == uniqueId;
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

module.exports = Socket;