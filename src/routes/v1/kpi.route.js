const express = require("express");
const kpi = require("../../controllers/kpi.controller");
const router = express.Router();

router.get("/getKpisBySource", kpi.getKpisBySource);
router.get("/getPublishedKpi", kpi.getPublishedKpi);
router.get("/getPublishedKpiById", kpi.getPublishedKpiById);
router.get("/getKpiById", kpi.getKpiById);
router.post("/saveKpi", kpi.saveKpi);
router.post("/deleteKpiGroup", kpi.deleteKpiGroup);

module.exports = router;
