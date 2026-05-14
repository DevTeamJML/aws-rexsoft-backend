const express = require("express");
// const auth = require('../../middlewares/auth');
// const validate = require('../../middlewares/validate');
const userController = require("../../controllers/user.controller");
const { accountValidation } = require("../../validations");

const router = express.Router();

router.get("/getUserDetailsById", userController.getUserDetailsById);
router.post("/register", userController.registerUser);
router.post("/sendChatNotification", userController.registerFCM);
router.post("/updateUserProfile", userController.updateUserProfile);

module.exports = router;