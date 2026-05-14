const { signIn } = require("./firebase/authFirebase.service");
const httpStatus = require('http-status');
const ApiError = require('../utils/ApiError');
const { sendInvitationMail } = require("../utils/mailer");

/**
 * * Login with username and password
 * @param {string} email
 * @param {string} password
 * @returns {Promise<results>}
 */
const loginUserWithEmailAndPassword = async (email, password, company_id) => {
    const results = await signIn(email, password, company_id);
    // console.log(results)
    return results;
};

module.exports = {
    loginUserWithEmailAndPassword,
};