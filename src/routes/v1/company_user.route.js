const express = require('express');
const auth = require('../../middlewares/auth');
const validate = require('../../middlewares/validate');
const companyUserController = require('../../controllers/company_user.controller');

const router = express.Router();

router.post('/create', companyUserController.createCompanyUser);
router.get('/getAllCompanyUsers', companyUserController.getAllCompanyUsers);

module.exports = router;