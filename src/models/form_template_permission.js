// const { DataTypes } = require('sequelize');
const { options } = require("./options/options");
module.exports = (sequelize, DataTypes) => {
  const form_template_permission = sequelize.define(
    //*remember must CamelCase
    "FormTemplatePermission",
    {
      form_template_permission_id: {
        type: DataTypes.STRING(255),
        defaultValue: DataTypes.UUIDV4,
        allowNull: false,
        primaryKey: true,
      },
      role_id: {
        type: DataTypes.STRING(255),
        allowNull: false,
        references: {
          model: "Role",
          key: "role_id",
        },
      },
      form_template_id: {
        type: DataTypes.STRING(255),
        allowNull: false,
        references: {
          model: "FormTemplate",
          key: "form_template_id",
        },
      },
    },
    options
  );

  return form_template_permission;
};
