let _ = require('lodash');

class SupervisorSocket {

	constructor(socket, query) {
		this.socket = socket;
		this.socket.user = query;
	}

	push() {
		supervisorSocketsContainer.push(this.socket);
	}

	pull() {
		_.pullAllWith(supervisorSocketsContainer, [{ id: this.socket.id }], _.isMatch);
		return console.log(this.length() + ' remains.');
	}

	length() {
		return supervisorSocketsContainer.length;
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
		let result = _.filter(supervisorSocketsContainer, function(socket) {
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

module.exports = SupervisorSocket;