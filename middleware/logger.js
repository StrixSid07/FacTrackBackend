const debug = require('debug')('app:logger');

const logger = (req, res, next) => {
  debug(`${req.method} ${req.url}`);
  next();
};

module.exports = logger;
