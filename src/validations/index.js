// const modelEnum = require('../enums/modelEnum');

// const existingValidationFiles = fs.readdirSync(__dirname)
// .filter((file) => {
//   return file.indexOf('.') !== 0 && file !== basename && file.slice(-3) === '.js';
// }).map((file) => {
//   console.log(file);
//   const modelName = file.split(".")[0];
//   return modelName;
// }, {});

// const modelValidationsIndex = Object.keys(modelEnum).reduce((result,key)=>{
//     const modelName = modelEnum[key];
//     if(existingValidationFiles.includes(modelName)){
//         const modelValidations =   require(`./${modelName}.validation`);
//         return { 
//             ...result,
//             // *     require("./example");
//            ...modelValidations,
//         };
//     }
//     return result;
// }, {});


// module.exports = modelValidationsIndex;
//without using reduce

// module.exports.authValidation = require('./auth.validation');
// module.exports.userValidation = require('./user.validation');
// module.exports.companyValidation = require('./company.validation');
// module.exports.numberFormatValidation = require('./number_format.validation');
// module.exports.tagValidation = require('./tag.validation');
// module.exports.tagGroupValidation = require('./tag_group.validation');
// module.exports.accountValidation = require('./account.validation');
// module.exports.contactValidation = require('./contact.validation');
// module.exports.contactGroupValidation = require('./contact_group.validation');
// module.exports.productValidation = require('./product.validation');
// module.exports.productGroupValidation = require('./product_group.validation');
// module.exports.companySettingValidation = require('./company_setting.validation');
// module.exports.initValidation = require('./init.validation');
// module.exports.transactionValidation = require('./transaction.validation');
