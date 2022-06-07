const notFoundEntrypoint = require('./not-found-route');
const errorHandler = require('./error-handler');
const requireRole = require('./require-role');

module.exports = {
  notFoundEntrypoint,
  errorHandler,
  requireRole,
};
