const express = require('express');
const validate = require('../../middlewares/validate');
const appointmentController = require('../../controllers/appointment.controller');

const router = express.Router();

router.post('/createAppointment', appointmentController.createAppointment);
router.post('/updateAppointment', appointmentController.updateAppointment);
router.post('/deleteAppointment', appointmentController.deleteAppointment);
router.get('/getAppointments', appointmentController.getAppointments);
router.get('/searchClientListInAppointment', appointmentController.searchClientListInAppointment);

module.exports = router;