const express = require('express');
const auth = require('../../middlewares/auth');
const validate = require('../../middlewares/validate');
const client = require('../../controllers/client.controller');

const router = express.Router();

router.post('/create', client.createClient);
router.post('/bulkCreateClient', client.bulkCreateClient);
router.post('/get', client.getAllClients);
router.post('/getAllClientsCount', client.getAllClientsCount);
router.post('/getClientDataByClientId', client.getClientDataByClientId);
router.post('/update', client.updateClient);
router.post('/bulkUpdate', client.bulkUpdateClient);
router.post('/delete', client.deleteClient);
router.post('/bulkDelete', client.bulkDeleteClient);
router.post('/archive', client.archiveClient);
router.post('/bulkArchive', client.bulkArchiveClients);
router.post('/restore', client.restoreClient);
router.post('/bulkRestore', client.bulkRestoreClients);
router.get("/checkDuplicate", client.checkDuplicate);
router.post("/exportClientsCSV", client.exportClientsCSV);

module.exports = router;