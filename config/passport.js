const JwtStrategy = require('passport-jwt').Strategy;
const ExtractJwt = require('passport-jwt').ExtractJwt;
var User = require('../models/User');
var config = require('./config');

module.exports = function(passport) {
  var opts = {};
  opts.jwtFromRequest = ExtractJwt.fromAuthHeaderAsBearerToken();
  opts.secretOrKey = config.secret;

  passport.use(new JwtStrategy(opts, function(jwt_payload, done) {

    User.findOne({_id: jwt_payload.id}, function(err, user) {
          
          if (err) {
            console.log('error is being generated while processing the user in passport.');
            return done(err, false);
          }

          if (user) {
            console.log('user has been verified by the passport.');
            return done(null, user);
          } else {
            console.log('user not found');
            return done(null, false);
          }
      });
  }));
};