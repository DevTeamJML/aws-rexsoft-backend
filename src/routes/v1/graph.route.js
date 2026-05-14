const express = require("express");
const graph = require("../../controllers/graph.controller");
const router = express.Router();

router.get("/generateGraphData", graph.generateGraphData);
router.get("/getGraphsBySource", graph.getGraphsBySource);
router.get("/getPublishedGraph", graph.getPublishedGraph);
router.get("/getPublishedGraphById", graph.getPublishedGraphById);
router.get("/getGraphById", graph.getGraphById);
router.post("/saveGraph", graph.saveGraph);
router.post("/deleteGraph", graph.deleteGraph);

module.exports = router;
