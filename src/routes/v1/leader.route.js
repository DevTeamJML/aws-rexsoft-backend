// routes/logs.route.js
const express = require("express");
const leaderController = require("../../controllers/leader.controller");
const router = express.Router();

router.post("/getAllLeader", leaderController.getAllLeader);
router.post("/assignLeader", leaderController.assignLeader);
router.post("/updateLeader", leaderController.updateLeader);
router.post("/deleteLeader", leaderController.deleteLeader);

module.exports = router;
