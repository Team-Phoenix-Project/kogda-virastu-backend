const HttpResponse = require('es6-http-response');

module.exports = (req, res, next) => {
  const { path } = req;
  next(HttpResponse.NotFound(`Entrypoint handler for  ${path} doesn't exist`));
};
