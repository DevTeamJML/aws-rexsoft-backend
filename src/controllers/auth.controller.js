const catchAsync = require('../utils/catchAsync');
const { authService, tokenService, usersService } = require('../services');
const httpStatus = require('http-status');


const login = catchAsync(async (req, res) => {
    // const { email, password, company_id } = req.body;
    // const user = await authService.loginUserWithEmailAndPassword(email, password, company_id);
    // const tokens = await tokenService.generateAuthTokens(user.user_id);
    // res.send({ user, tokens });
    const { uid, company_id = null } = req.body;

  
    const userDetails = await usersService.getUserDetailsById(uid, company_id);
    res.send(userDetails);
});

module.exports = {
    login
  };