const isProduction = true;
module.exports = (err, req, res, next) => {
  // TODO: Delete
  console.log('Got error in handler');
  console.log(err);
  const {
    method, headers, ip, body, params, query, url,
  } = req;
  let { message = "Error doesn't has a message field" } = err;
  const statusCode = err.status || err.http_status || err.statusCode || 500;
  const { name: errorName = 'Unknown', errors } = err;

  const isUnknownError = statusCode >= 500;
  const meta = !isProduction ? {
    headers, ip, body, params, query,
  } : {};
  message = !isUnknownError ? message : 'Internal Service Error';
  const error = isProduction ? undefined : { ...err };
  return res.status(statusCode).json({
    message,
    method,
    url,
    name: !isUnknownError ? errorName : 'Unknown',
    meta,
    errors: {
      ...errors,
      error,
    },
  });
};
