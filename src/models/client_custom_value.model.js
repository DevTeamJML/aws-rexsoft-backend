// const { DataTypes } = require('sequelize');
const { options } = require("./options/options");
module.exports = (sequelize, DataTypes) => {
  const client_custom_value = sequelize.define(
    //*remember must CamelCase
    "ClientCustomValue",
    {
      client_custom_value_id: {
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

      client_custom_field_id: {
        type: DataTypes.STRING(255),
        allowNull: false,
        references: {
          model: "ClientCustomField",
          key: "client_custom_field_id",
        },
      },
      value: {
        type: DataTypes.STRING(255),
        allowNull: false,
      },
    },
    options
  );

  return client_custom_value;
};
