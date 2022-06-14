module.exports = function (req, res, err) {
  if (res.headersSent) {
    this.logger.warn('Headers have already sent');
    return {};
  }

  if (!err || !(err instanceof Error)) {
    res.writeHead(500);
    res.end('Internal Server Error');
    return {};
  }
  // Return with the error as JSON object
  res.setHeader('Content-type', 'application/json; charset=utf-8');

  let code = +err.code || 500;

  if (code < 100 || code > 599) {
    this.logger.error(`Unknown HTTP STATUS CODE ${code}! Sending 500 instead: %o`, err);
    code = 500;
  }

  res.writeHead(code);

  const errObj = ['name', 'message', 'code', 'type', 'data'].reduce((acc, key) => {
    acc[key] = err[key];
    return acc;
  }, {});
  res.end(JSON.stringify(errObj, null, 2));
  return {};
};
