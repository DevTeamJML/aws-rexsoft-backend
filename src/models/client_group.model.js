// const { DataTypes } = require('sequelize');
const { options } = require("./options/options");
module.exports = (sequelize, DataTypes) => {
  const client_group = sequelize.define(
    //*remember must CamelCase
    "ClientGroup",
    {
      client_group_id: {
        type: DataTypes.STRING(255),
        defaultValue: DataTypes.UUIDV4,
        allowNull: false,
        primaryKey: true,
      },
      company_id: {
        type: DataTypes.STRING(255),
        allowNull: false,
        references: {
          model: "Company",
          key: "company_id",
        },
      },
      client_group_name: {
        type: DataTypes.STRING(255),
        allowNull: false,
      },
    },
    options
  );

  return client_group;
};
