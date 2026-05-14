// const { DataTypes } = require('sequelize');
const { options } = require("./options/options");
module.exports = (sequelize, DataTypes) => {
  const client_custom_field = sequelize.define(
    //*remember must CamelCase
    "ClientCustomField",
    {
      client_custom_field_id: {
        type: DataTypes.STRING(255),
        defaultValue: DataTypes.UUIDV4,
        allowNull: false,
        primaryKey: true,
      },

      name: {
        type: DataTypes.STRING(255),
        allowNull: false,
      },

      field_type: {
        type: DataTypes.ENUM(
          "TEXT",
          "NUMBER",
          "DATES",
          "DROPDOWN",
          "CHECKBOX",
          "ALERT"
        ),
        allowNull: false,
      },

      options: {
        type: DataTypes.STRING(255),
        allowNull: true,
      },
    },
    options
  );

  return client_custom_field;
};
