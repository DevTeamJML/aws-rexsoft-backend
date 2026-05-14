const express = require("express");
const helmet = require("helmet");
const xss = require("xss-clean");
const compression = require("compression");
const cors = require("cors");
const httpStatus = require("http-status");
const config = require("./config/config");
const morgan = require("./config/morgan");
const { authLimiter } = require("./middlewares/rateLimiter");
const routes = require("./routes/v1");
const { errorConverter, errorHandler } = require("./middlewares/error");
const ApiError = require("./utils/ApiError");
const passport = require("passport");
const db = require("./models");
const { infoLogger, errorLogger } = require("./config/logger2");

const app = express();

if (config.env !== "test") {
  app.use(morgan.successHandler);
  app.use(morgan.errorHandler);
}

// set security HTTP headers
app.use(helmet());

// parse json request body
app.use(express.json({ limit: "100mb" }));

// parse urlencoded request body
app.use(express.urlencoded({ limit: "100mb", extended: true }));

// sanitize request data
app.use(xss());

// gzip compression
app.use(compression());

// cors policies
app.use(
  cors({
    origin: [
      "http://localhost:3000",
      "http://127.0.0.1:3000",
      "https://clone.rexsoft.info",
      "https://rexsoft.info",
      "https://dupli.rexsoft.info",
    ],
    methods: ["GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"],
    allowedHeaders: ["Content-Type", "Authorization"],
    credentials: true,
  }),
);

// handle preflight requests
app.options("*", cors());

// jwt authentication
// app.use(passport.initialize());

// limit repeated failed requests to auth endpoints
if (config.env === "production") {
  app.use("/v1/auth", authLimiter);
}

// v1 api routes
app.use("/v1", routes);

// send back a 404 error for any unknown api request
// app.use((req, res, next) => {
//   next(new ApiError(httpStatus.NOT_FOUND, 'NOT_FOUND'));
// });

// convert error to ApiError, if needed
// app.use(errorConverter);

// handle error
app.use(errorHandler);

const blockedPatterns = ["/wp-login.php", "/xmlrpc.php", "/.env", "/wp-admin"];

app.use((req, res, next) => {
  if (blockedPatterns.some((p) => req.url.includes(p))) {
    return res.status(403).end();
  }
  next();
});

module.exports = app;
