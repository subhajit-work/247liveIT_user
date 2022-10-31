const express 	= require('express');
const Router 	= express.Router();
const Joi 		= require('@hapi/joi');

const User 		= require('../models/User');
var database 	= require('../config/database');
var app 		= require('../config/app');


exports.login = (req, res)=> {
	const schema = Joi.object().keys({
		credentials: Joi.object().required(),
	});
	
	Joi.validate(req.body, schema, async function (error, value) {
		if (error) {
			return res.status(500).send({message: error.message});
		}else if(!user){
			return res.status(500).send({message: 'You have provided invalid credentials.'});
		}else {
			User.findOne(criteria, '_id name password', function(err, user) {
				if (err) {
					return res.status(500).send({message: err.message});
				}else{
					var token = jwt.sign({id:user.id,name: user.name}, config.secret, {expiresIn: '10h'});
					return res.send({token: token});
				}
			});
		}
	});
}