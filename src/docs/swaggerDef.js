const { version } = require('../../package.json');
const config = require('../config/config');

const swaggerDef = {
  openapi: '3.1.0',
  info: {
    title: 'Rexsoft API documentation',
    version,
  },
  servers: [
    {
      url: `http://localhost:${config.port}/v1`,
    },
  ],
};

module.exports = swaggerDef;
