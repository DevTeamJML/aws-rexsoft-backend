const catchAsync = require('../utils/catchAsync');
const { authService, tokenService, usersService, companiesService} = require('../services');
const httpStatus = require('http-status');

const db = require('./models');

const initCompany = catchAsync(async (req, res) => {
    // const { email, password, company_id } = req.body;
    // const user = await authService.loginUserWithEmailAndPassword(email, password, company_id);
    // const tokens = await tokenService.generateAuthTokens(user.user_id);
    // res.send({ user, tokens });

 const result =  db.sequelize.transaction(async (t) =>{
    const {user_id = null, first_name = null, last_name = null, email = null, phone_no = null,  ...companyInfo } = res.body;
      const initKey = req.headers.hasOwnProperty('init-key') ?  req.headers['init-key'] : null;
        // if dont have key or user then return false

     let user;

      if(!initKey && user_id) {
        user = await usersService.checkUser({
          user_id,

        }, t);
        if(!user){
          return null;
        }
      }else{
       if(!user_id){
        user = await usersService.createUser({
            first_name,
            last_name,
            email,phone_no
        }, t)
       }

         const company =  await companiesService.createCompany({
                ...companyInfo,
                user
               }, t);
        
        return company;


               

      }

});

    res.send(result);
   
});

module.exports = {
    initCompany
  };