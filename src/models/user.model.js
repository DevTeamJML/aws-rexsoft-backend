// const { DataTypes } = require('sequelize');
const { options } = require("./options/options");
module.exports = (sequelize, DataTypes) => {
  const user = sequelize.define(
    //*remember must CamelCase
    "User",
    {
      user_id: {
        type: DataTypes.STRING(255),
        defaultValue: DataTypes.UUIDV4,
        allowNull: false,
        primaryKey: true,
      },
      first_name: {
        type: DataTypes.STRING(255),
        allowNull: false,
      },
      last_name: {
        type: DataTypes.STRING(255),
        allowNull: true,
      },
      email: {
        type: DataTypes.STRING(100),
        allowNull: false,
      },
      phone_no: {
        type: DataTypes.STRING(20),
        allowNull: true,
      },
      profile_pic: {
        type: DataTypes.BLOB,
        allowNull: true,
      },
      signature: {
        type: DataTypes.BLOB,
        allowNull: true,
      },
    },
    options
  );

  return user;
};
