const jwt = require('express-jwt');
const { secret } = require('../config');

function getTokenFromHeader(req) {
  const { authorization } = req.headers;

  if (!authorization || !authorization.startsWith('Bearer')) {
    return null;
  }
  const [_type, value] = authorization.split(' ') || [];
  return value;
}

const auth = {
  required: jwt({
    secret,
    userProperty: 'payload',
    getToken: getTokenFromHeader,
  }),
  optional: jwt({
    secret,
    userProperty: 'payload',
    credentialsRequired: false,
    getToken: getTokenFromHeader,
  }),
};

module.exports = auth;
