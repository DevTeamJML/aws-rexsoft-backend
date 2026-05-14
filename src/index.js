const { default: axios } = require("axios");
const app = require("./app");
const config = require("./config/config");
const logger = require("./config/logger");
const { infoLogger } = require("./config/logger2");
const path = require("path");
const dotenv = require("dotenv");
const express = require("express");

// Launch CronJobs
// require('./cronJobs');

app.use(express.json());
app.use(express.urlencoded({ extended: true, limit: "10mb" }));

const envFile =
  process.env.NODE_ENV === "production"
    ? path.resolve(__dirname, "../env/.env.production")
    : path.resolve(__dirname, "../env/.env.development");

dotenv.config({ path: envFile });

let server;
// Launch App
server = app.listen(config.port, () => {
  infoLogger(`Localhost: ${config.port}`);
  infoLogger(`LAN: ${config.localIP}`);
});

server.setTimeout(1000 * 60 * 10);

app.get("/health", (req, res) => {
  res.status(200).json({
    status: "ok",
    uptime: process.uptime(),
  });
});

app.get("/", (req, res) => {
  res.status(404).end();
});


const exitHandler = () => {
  if (server) {
    server.close(() => {
      logger.info("Server closed");
      process.exit(1);
    });
  } else {
    process.exit(1);
  }
};

const unexpectedErrorHandler = (error) => {
  logger.error(error);
  exitHandler();
};

process.on("uncaughtException", unexpectedErrorHandler);
process.on("unhandledRejection", unexpectedErrorHandler);

process.on("SIGTERM", () => {
  logger.info("SIGTERM received");
  if (server) {
    server.close();
  }
});
