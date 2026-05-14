const express = require("express");
const form = require("../../controllers/form.controller");
const router = express.Router();

router.post("/createFormTemplate", form.createFormTemplate);
router.get("/getFormTemplateById", form.getFormTemplateById);
router.get("/getAllFormTemplates", form.getAllFormTemplates)
router.post("/updateFormTemplate", form.updateFormTemplate)
router.post("/deleteFormTemplate", form.deleteFormTemplate)
router.post("/createFormSubmission", form.createFormSubmission)
router.get("/getUserFormSubmission", form.getUserFormSubmission)
router.get("/getAllFormSubmissions", form.getAllFormSubmissions)
router.get("/getFormSubmissionById", form.getFormSubmissionById)
router.post("/updateFormSubmission", form.updateFormSubmission)
router.post("/deleteFormSubmission", form.deleteFormSubmission)
router.post("/updateFormSubmissionApproval", form.updateFormSubmissionApproval)

module.exports = router;
