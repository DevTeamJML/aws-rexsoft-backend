// const Joi = require('joi');

// const envVarsSchema = Joi.object()
//   .keys({
//     // General
//     NODE_ENV: Joi.string().valid('production', 'development', 'test').required(),
//     PORT: Joi.any().required(),
//     LOCAL_IP: Joi.any(),
//     // Firebase & Firebase Admin
//     API_KEY: Joi.string().required().description('Firebase API key'),
//     AUTH_DOMAIN: Joi.string().required().description('Firebase auth domain'),
//     STORAGE_BUCKET: Joi.string().required().description('Firebase storage bucket'),
//     MESSAGING_SENDER_ID: Joi.string().required().description('Firebase messaging sender ID'),
//     APP_ID: Joi.string().required().description('Firebase app ID'),
//     // MEASUREMENT_ID: Joi.string().required().description('Firebase measurement ID'),
//     // ADMIN_PROJECT_ID: Joi.string().required().description('Firebase Project ID'),
//     // ADMIN_PRIVATE_KEY: Joi.string().required().description('FIrebase Private Key'),
//     // ADMIN_CLIENT_EMAIL: Joi.string().required().description('Firebase Client Email'),
//     // ADMIN_DATABASE_URL: Joi.string().required().description('Firebase db URL'),
//     // Mysql Local
//     DB_HOST: Joi.string().required().description('Database Host - Local'),
//     DB_USER: Joi.string().required().description('Database User - Local'),
//     DB_PASSWORD: Joi.string().allow(null, '').description('Database Password - Local'),
//     DB_NAME: Joi.string().required().description('Database Name - Local'),
//     DB_DIALECT: Joi.string().required().description('Database Dialect - Local'),
//     DB_MAX_POOL: Joi.number().required().description('Database Max Pool Connection - Local'),
//     DB_MIN_POOL: Joi.number().required().description('Database Min Pool Connection - Local'),
//     DB_IDLE: Joi.number().required().description('Database Connection Idle - Local'),
//     // SMTP Mailer
//     SMTP_HOST: Joi.string().description('server that will send the emails'),
//     SMTP_PORT: Joi.number().description('port to connect to the email server'),
//     SMTP_USERNAME: Joi.string().description('username for email server'),
//     SMTP_PASSWORD: Joi.string().description('password for email server'),
//     EMAIL_FROM: Joi.string().description('the from field in the emails sent by the app'),
//     // Currency Exchange Rate API
//     CURRENCY_EXCHANGE_RATE_API: Joi.string().description('api to get currency exchange rate'),
//     CURRENCY_EXCHANGE_RATE_API_HEADER: Joi.string().description('api accepted header to get currency exchange rate'),
//   })
//   .unknown();

// const { value: envVars, error } = envVarsSchema.prefs({ errors: { label: 'key' } }).validate(process.env);

// if (error) {
//   throw new Error(`Config validation error: ${error.message}`);
// }

// module.exports = {
//   env: envVars.NODE_ENV,
//   port: envVars.PORT,
//   localIP: envVars.LOCAL_IP,
//   firebase_config: {
//     apiKey: envVars.API_KEY,
//     authDomain: envVars.AUTH_DOMAIN,
//     databaseURL: envVars.ADMIN_DATABASE_URL,
//     projectId: envVars.ADMIN_PROJECT_ID,
//     storageBucket: envVars.STORAGE_BUCKET,
//     messagingSenderId: envVars.MESSAGING_SENDER_ID,
//     appId: envVars.APP_ID,
//     measurementId: envVars.MEASUREMENT_ID,
//   },
//   firebase_admin: {
//     credential: {
//       projectId: envVars.ADMIN_PROJECT_ID,
//       privateKey: envVars.ADMIN_PRIVATE_KEY,
//       clientEmail: envVars.ADMIN_CLIENT_EMAIL,
//     },
//     databaseURL: envVars.ADMIN_DATABASE_URL,
//   },
//   db_config: {
//     dbHost: envVars.DB_HOST,
//     dbUser: envVars.DB_USER,
//     dbPassword: envVars.DB_PASSWORD,
//     dbName: envVars.DB_NAME,
//     dbDialect: envVars.DB_DIALECT,
//     dbMaxPool: envVars.DB_MAX_POOL,
//     dbMinPool: envVars.DB_MIN_POOL,
//     dbIdle: envVars.DB_IDLE,
//   },
//   jwt: {
//     secret: envVars.JWT_SECRET,
//     accessExpirationMinutes: envVars.JWT_ACCESS_EXPIRATION_MINUTES,
//     refreshExpirationDays: envVars.JWT_REFRESH_EXPIRATION_DAYS,
//     resetPasswordExpirationMinutes: envVars.JWT_RESET_PASSWORD_EXPIRATION_MINUTES,
//     verifyEmailExpirationMinutes: envVars.JWT_VERIFY_EMAIL_EXPIRATION_MINUTES,
//   },
//   email: {
//     smtp: {
//       host: envVars.SMTP_HOST,
//       port: envVars.SMTP_PORT,
//       auth: {
//         user: envVars.SMTP_USERNAME,
//         pass: envVars.SMTP_PASSWORD,
//       },
//     },
//     from: envVars.EMAIL_FROM,
//   },
//   currency_api: {
//     api: envVars.CURRENCY_EXCHANGE_RATE_API,
//     header: envVars.CURRENCY_EXCHANGE_RATE_API_HEADER,
//   },
// };

module.exports = {
  env: process.env.NODE_ENV || 'development',
  port: process.env.PORT || 8081,
  localIP: process.env.LOCAL_IP || '0.0.0.0',

  firebase_config: {
    apiKey: process.env.API_KEY,
    authDomain: process.env.AUTH_DOMAIN,
    databaseURL: process.env.ADMIN_DATABASE_URL,
    projectId: process.env.ADMIN_PROJECT_ID,
    storageBucket: process.env.STORAGE_BUCKET,
    messagingSenderId: process.env.MESSAGING_SENDER_ID,
    appId: process.env.APP_ID,
    measurementId: process.env.MEASUREMENT_ID,
  },

  firebase_admin: {
    credential: {
      projectId: process.env.ADMIN_PROJECT_ID,
      privateKey: process.env.ADMIN_PRIVATE_KEY,
      clientEmail: process.env.ADMIN_CLIENT_EMAIL,
    },
    databaseURL: process.env.ADMIN_DATABASE_URL,
  },

  db_config: {
    dbHost: process.env.DB_HOST,
    dbUser: process.env.DB_USER,
    dbPassword: process.env.DB_PASSWORD,
    dbName: process.env.DB_NAME,
    dbDialect: process.env.DB_DIALECT,
    dbMaxPool: Number(process.env.DB_MAX_POOL),
    dbMinPool: Number(process.env.DB_MIN_POOL),
    dbIdle: Number(process.env.DB_IDLE),
  },

  jwt: {
    secret: process.env.JWT_SECRET,
    accessExpirationMinutes: process.env.JWT_ACCESS_EXPIRATION_MINUTES,
    refreshExpirationDays: process.env.JWT_REFRESH_EXPIRATION_DAYS,
    resetPasswordExpirationMinutes: process.env.JWT_RESET_PASSWORD_EXPIRATION_MINUTES,
    verifyEmailExpirationMinutes: process.env.JWT_VERIFY_EMAIL_EXPIRATION_MINUTES,
  },

  email: {
    smtp: {
      host: process.env.SMTP_HOST,
      port: process.env.SMTP_PORT,
      auth: {
        user: process.env.SMTP_USERNAME,
        pass: process.env.SMTP_PASSWORD,
      },
    },
    from: process.env.EMAIL_FROM,
  },

  currency_api: {
    api: process.env.CURRENCY_EXCHANGE_RATE_API,
    header: process.env.CURRENCY_EXCHANGE_RATE_API_HEADER,
  },
};

