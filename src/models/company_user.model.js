// const { DataTypes } = require('sequelize');
const { options } = require("./options/options");
module.exports = (sequelize, DataTypes) => {
  const company_user = sequelize.define(
    //*remember must CamelCase
    "CompanyUser",
    {
      company_user_id: {
        type: DataTypes.STRING(255),
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
      user_id: {
        type: DataTypes.STRING(255),
        allowNull: false,
        references: {
          model: "User",
          key: "user_id",
        },
      },

      role_id: {
        type: DataTypes.STRING(255),
        allowNull: false,
        references: {
          model: "Role",
          key: "role_id",
        },
      },
      is_owner: {
        type: DataTypes.BOOLEAN,
        allowNull: false,
      },
    },
    options
  );

  return company_user;
};
