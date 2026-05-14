// const modelEnum = require('../modelEnum');
// const fs = require('fs');


// const existingModelDefaultDataFile = fs.readdirSync(__dirname)
// .filter((file) => {
//   return file.indexOf('.') !== 0 && file !== basename && file.slice(-3) === '.js';
// }).map((file) => {
//   console.log(file);
//   const modelName = file.split(".")[0];
//   return modelName;
// }, {});

// const modelDefaultData = Object.keys(modelEnum).reduce((result,key)=>{
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


// const defaultData =  Object.keys(modelEnum).map((model)=>{ 
//     example.
// });
// modelDefaultData.[modelEnum.EXAMPLE]

// module.exports = modelDefaultData;

const default_data = {
  example : []
};

module.exports = {
  default_data,
};
