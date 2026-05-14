// routes/logs.route.js
const express = require("express");
const logController = require("../../controllers/log.controller");
const router = express.Router();

router.get("/getLogs", logController.getLogs);
router.get("/getMyLogs", logController.getMyLogs);
router.post("/createLogs", logController.createLog);

module.exports = router;
