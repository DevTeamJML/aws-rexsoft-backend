const httpStatus = require('http-status');
const config = require('../config/config');
const logger = require('../config/logger');
const ApiError = require('../utils/ApiError');

const errorConverter = (err, req, res, next) => {
  console.log(err);
  let error = err;
  if (!(error instanceof ApiError)) {
    const statusCode = error.statusCode || httpStatus.INTERNAL_SERVER_ERROR;
    const code = error.code || httpStatus[statusCode];
    error = new ApiError(statusCode, code);
  }
  next(error);
};

// eslint-disable-next-line no-unused-vars
const errorHandler = (err, req, res, next) => {
  let { statusCode, code, description } = err;

  res.locals.errorDescription = err.description;

  const response = {
    code,
    description,
  };

  if (config.env === 'development') {
    logger.error(err);
  }

  const newStatusCode = statusCode || 500;

  res.status(newStatusCode).send(response);
};

module.exports = {
  errorConverter,
  errorHandler,
};
