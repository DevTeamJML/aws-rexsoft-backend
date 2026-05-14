// const { DataTypes } = require('sequelize');
const { options } = require("./options/options");
module.exports = (sequelize, DataTypes) => {
  const form_template = sequelize.define(
    //*remember must CamelCase
    "FormTemplate",
    {
      form_template_id: {
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
      user_id: {
        type: DataTypes.STRING(255),
        allowNull: false,
        references: {
          model: "User",
          key: "user_id",
        },
      },
      name: {
        type: DataTypes.STRING(255),
        allowNull: true,
      },
      description: {
        type: DataTypes.STRING(255),
        allowNull: true,
      },
      modified_by: {
        type: DataTypes.STRING(255),
        allowNull: true,
      },
      effective_date: {
        type: DataTypes.DATE,
        allowNull: true,
      },
      expiry_date: {
        type: DataTypes.DATE,
        allowNull: true,
      },
      is_publish: {
        type: DataTypes.BOOLEAN,
        allowNull: true,
        defaultValue: 0,
      },
    },
    options
  );

  return form_template;
};
