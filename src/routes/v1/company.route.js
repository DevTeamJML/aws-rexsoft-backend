const express = require('express');
const auth = require('../../middlewares/auth');
const validate = require('../../middlewares/validate');
const companiesController = require('../../controllers/company.controller');
// const { companyValidation } = require('../../validations');

const router = express.Router();

router.get('/getAllCompanies', companiesController.getAllCompanies);
router.put('/updateCompany', companiesController.updateCompany);
router.post('/createCompany', companiesController.createCompany);

module.exports = router;