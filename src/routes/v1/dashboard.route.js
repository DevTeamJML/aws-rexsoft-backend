const express = require('express');
const dashboardController = require('../../controllers/dashboard.controller');
// const { companyValidation } = require('../../validations');

const router = express.Router();

router.get('/getDashboard', dashboardController.getDashboard);

module.exports = router;