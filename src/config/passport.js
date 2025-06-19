const { Strategy: JwtStrategy, ExtractJwt } = require('passport-jwt');
const config = require('./config');
// const { tokenTypes } = require('./tokens'); 
// const { User } = require('../models');
// console.log('sec at passport :', config.db);
const jwtOptions = {
  secretOrKey: config.jwt.secret,
  jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
};

const jwtVerify = async (payload, done) => {
  try {
    if (payload.type !== 'ACCESS') {
      throw new Error('Invalid token type');
    }
    const user = 'admin';
    if (!user) {
      return done(null, false);
    }
    done(null, user);
  } catch (error) {
    done(error, false);
  }
};

const jwtStrategy = new JwtStrategy(jwtOptions, jwtVerify);

module.exports = {
  jwtStrategy,
};