// const { DataTypes } = require('sequelize');
const { options } = require("./options/options");
module.exports = (sequelize, DataTypes) => {
  const client = sequelize.define(
    //*remember must CamelCase
    "Client",
    {
      client_id: {
        type: DataTypes.STRING(255),
        defaultValue: DataTypes.UUIDV4,
        allowNull: false,
        primaryKey: true,
      },
      user_id: {
        type: DataTypes.STRING(255),
        allowNull: false,
        references: {
          model: "User",
          key: "user_id",
        },
      },
      client_group_id: {
        type: DataTypes.STRING(255),
        allowNull: false,
        references: {
          model: "ClientGroup",
          key: "client_group_id",
        },
      },
      status: {
        type: DataTypes.STRING(255),
        allowNull: true,
      },
      serial_number: {
        type: DataTypes.STRING(255),
        allowNull: true,
      },
    },
    options
  );

  return client;
};

// // const { DataTypes } = require('sequelize');
// const { options } = require('./options/options');
// module.exports = (sequelize, DataTypes) => {
//   const client = sequelize.define(
//     //*remember must CamelCase
//     'Client',
//     {
//       client_id: {
//         type: DataTypes.STRING(255),
//         allowNull: false,
//         primaryKey: true,
//       },
//       user_id: {
//         type: DataTypes.STRING(255),
//         allowNull: false,
//         references: {
//             model: 'User',
//             key: 'user_id',
//         },
//       },
//       client_group_id: {
//         type: DataTypes.STRING(255),
//         allowNull: false,
//         references: {
//             model: 'ClientGroup',
//             key: 'client_group_id',
//         },
//       },
//       status: {
//         type: DataTypes.STRING(255),
//         allowNull: true,
//       },
//       serial_number: {
//         type: DataTypes.STRING(255),
//         allowNull: true,
//       },
//     },
//     options
//   );

//   return client;
// };
