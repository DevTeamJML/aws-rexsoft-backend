
// const modelEnum = require('../modelEnum');

// const existingModelDefaultDataFile = fs.readdirSync(__dirname)
// .filter((file) => {
//   return file.indexOf('.') !== 0 && file !== basename && file.slice(-3) === '.js';
// }).map((file) => {
//   console.log(file);
//   const modelName = file.split(".")[0];
//   return modelName;
// }, {});

// const modelsErrorCode = Object.keys(modelEnum).reduce((result,key)=>{
//     const modelName = modelEnum[key];
//     if(existingModelDefaultDataFile.includes(modelName)){
//         return { 
//             ...result,
//             // *     require("./example");
//             [key] :  require(`./${modelName}`),
            
//         };
//     }
//     return result;
// }, {});



module.exports.ErrorCode = {
    INTERNAL_SERVER: {
      code: 'DEFAULT_ROLE',
      description: 'Default role is not allowed to remove',
    },
    'auth/wrong-password': {
      code: 'USER_CREDENTIAL_INVALID',
      description: 'Invalid password',
    },
    'auth/user-not-found': {
      code: 'USER_NOT_FOUND',
      description: 'User not found',
    },
    'auth/too-many-requests': {
      code: 'TOO_MANY_LOGIN_ATTEMPTS',
      description: 'Too many attempts',
    },
    'auth/email-already-exists': {
      code: 'EMAIL_ALREADY_TAKEN',
      description: 'Email already registered',
    },
    API_NOT_FOUND: {
      code: 'API_NOT_FOUND',
      description: 'Invalid API request',
    },
    INVITATION_EXPIRED: {
      code: 'INVITATION_EXPIRED',
      description: 'Invitation expired. Please contact admin for new link.',
    },
    INVALID_API_ACCESS: {
      code: 'INVALID_API_ACCESS',
      description: 'Invalid access to API',
    },
    // ...modelsErrorCode
  };
  