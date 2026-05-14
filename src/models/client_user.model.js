// const { DataTypes } = require('sequelize');
const { options } = require("./options/options");
module.exports = (sequelize, DataTypes) => {
  const client_user = sequelize.define(
    //*remember must CamelCase
    "ClientUser",
    {
      client_user_id: {
        type: DataTypes.STRING(255),
        defaultValue: DataTypes.UUIDV4,
        allowNull: false,
        primaryKey: true,
      },
      client_id: {
        type: DataTypes.STRING(255),
        allowNull: false,
        references: {
          model: "Client",
          key: "client_id",
        },
      },
      user_id: {
        type: DataTypes.STRING(255),
        allowNull: false,
        references: {
          model: "User",
          key: "user_id",
        },
      },
    },
    options
  );

  return client_user;
};
