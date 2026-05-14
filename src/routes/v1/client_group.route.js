const express = require('express');
const auth = require('../../middlewares/auth');
const validate = require('../../middlewares/validate');
// const { companyValidation } = require('../../validations');
const clientGroupController = require('../../controllers/client_group.controller')

const router = express.Router();

router.post('/duplicateClientGroup', clientGroupController.duplicateClientGroup);
router.post('/createClientGroup', clientGroupController.createClientGroup);
router.post('/updateClientGroup', clientGroupController.updateClientGroup);
router.get('/getClientGroupById', clientGroupController.getClientGroupById);
router.get('/getAllClientGroups', clientGroupController.getAllClientGroups);
router.delete('/deleteClientGroupById', clientGroupController.deleteClientGroup);
router.get('/getAllClientGroupsName', clientGroupController.getAllClientGroupsName);
router.get('/getSelectedClientGroup', clientGroupController.getSelectedClientGroup);

module.exports = router;