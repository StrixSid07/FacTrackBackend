const debug = require('debug')('app:errorHandler');

const errorHandler = (err, req, res, next) => {
  debug(`Error: ${err.message}`);
  res.status(err.status || 500).json({
    error: {
      message: err.message || 'Internal Server Error',
    },
  });
};

module.exports = errorHandler;
