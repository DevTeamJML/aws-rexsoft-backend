const config = require('./config');
module.exports = {
  database: config.db_config.dbName,
  username: config.db_config.dbUser,
  password: config.db_config.dbPassword,
  options: {
    host: config.db_config.dbHost,
    dialect: config.db_config.dbDialect,
    logging: false,
  },
  pool: {
    max: config.db_config.dbMaxPool,
    min: config.db_config.dbMinPool,
    idle: config.db_config.dbIdle,
  },
};
