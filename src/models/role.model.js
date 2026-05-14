// const { DataTypes } = require('sequelize');
const { options } = require("./options/options");
module.exports = (sequelize, DataTypes) => {
  const role = sequelize.define(
    //*remember must CamelCase
    "Role",
    {
      role_id: {
        type: DataTypes.STRING(255),
        defaultValue: DataTypes.UUIDV4,
        allowNull: false,
        primaryKey: true,
      },
      name: {
        type: DataTypes.STRING(255),
        allowNull: false,
      },
      is_admin: {
        type: DataTypes.STRING(255),
        allowNull: true,
      },
      is_owner: {
        type: DataTypes.STRING(255),
        allowNull: true,
      },
      client_group_permission_id: {
        type: DataTypes.STRING(255),
        allowNull: true,
        references: {
          model: "ClientGroupPermission",
          key: "client_group_permission_id",
        },
      },
      form_template_permission_id: {
        type: DataTypes.STRING(255),
        allowNull: true,
        references: {
          model: "FormTemplatePermission",
          key: "form_template_permission_id",
        },
      },
    },
    options
  );

  return role;
};
