const express = require('express');
const auth = require('../../middlewares/auth');
const validate = require('../../middlewares/validate');
const invitationController = require('../../controllers/invitation.controller');

const router = express.Router();

router.post('/resend', invitationController.resendInvitation);
router.post('/reject', invitationController.rejectInvitation);
router.post('/removeInvitationAndUser', invitationController.removeInvitationAndUser);
router.post('/accept', invitationController.acceptInvitation);
router.get('/getInvitationById', invitationController.getInvitationById);
router.post("/inviteUserToCompany", invitationController.inviteUserToCompany);
router.post("/signUpAndAcceptInvitation", invitationController.signUpAndAcceptInvitation);
router.get("/getAllInvitationAndUser", invitationController.getAllInvitationAndUser);

router.post("/createCRMUsers", invitationController.createCRMUsers);
router.post("/createCRMUsersWithCompanyUsers", invitationController.createCRMUsersWithCompanyUsers);

module.exports = router;