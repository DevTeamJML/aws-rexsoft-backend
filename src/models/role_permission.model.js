// const { DataTypes } = require('sequelize');
const { options } = require("./options/options");
module.exports = (sequelize, DataTypes) => {
  const role_permission = sequelize.define(
    //*remember must CamelCase
    "RolePermission",
    {
      role_permission_id: {
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
      permission_id: {
        type: DataTypes.STRING(255),
        allowNull: false,
        // references: {
        //     model: 'Permission',
        //     key: 'permission_id',
        // },
      },
    },
    options
  );

  return role_permission;
};
