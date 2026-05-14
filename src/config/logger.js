// src/config/logger.js
const winston = require('winston');
const config = require('./config'); // make sure this exports config.env

const enumerateErrorFormat = winston.format((info) => {
  if (info instanceof Error) {
    info.message = info.stack;
  }
  return info;
});

const formats = [
  enumerateErrorFormat(),
  winston.format.timestamp({ format: 'YYYY-MM-DD HH:mm:ss' }),
  winston.format.splat(),
  // colorize only in development (for console)
  config.env === 'development' ? winston.format.colorize() : winston.format.uncolorize(),
  winston.format.printf(({ timestamp, level, message }) => `${timestamp} ${level}: ${message}`)
];

const transports = [];

// console transport (always safe)
transports.push(
  new winston.transports.Console({
    stderrLevels: ['error'],
    handleExceptions: true,
  })
);

// add file transport in production (example)
if (config.env === 'production') {
  transports.push(
    new winston.transports.File({
      filename: 'logs/error.log',
      level: 'error',
      handleExceptions: true,
      maxsize: 10 * 1024 * 1024, // 10MB
      maxFiles: 5,
      tailable: true,
    })
  );

  transports.push(
    new winston.transports.File({
      filename: 'logs/combined.log',
      level: 'info',
      maxsize: 10 * 1024 * 1024,
      maxFiles: 5,
      tailable: true,
    })
  );
}

const logger = winston.createLogger({
  level: config.env === 'development' ? 'debug' : 'info',
  format: winston.format.combine(...formats),
  transports,
  exitOnError: false,
});

module.exports = logger;
