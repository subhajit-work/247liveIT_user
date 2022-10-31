let _ = require('lodash');

exports.inspectQueryInput = (inputs)=> {
	return {
		id: `${inputs.role}:${inputs.user_id}`,
		userId: parseInt(inputs.user_id),
		email: inputs.email,
		name: inputs.name,
		mobile: inputs.mobile,
		role: inputs.role,
	};
}


exports.filterByUserId = (id)=> {
	
	let result = _.find(socketsContainer, function(socket) {
		return socket.user.user_id == id;
	});

	if(result === undefined){
		throw {'message': 'target socket is not online'};	
	}else{
		return result;
	}
}

exports.filterById = (id)=> {
	
	let result = _.find(container, function(socket) {
		return socket.user.id == id;
	});

	if(result === undefined){
		throw {'message': 'target socket is not online'};	
	}else{
		return result;
	}
}