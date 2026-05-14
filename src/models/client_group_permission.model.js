// const { DataTypes } = require('sequelize');
const { options } = require("./options/options");
module.exports = (sequelize, DataTypes) => {
  const client_group_permission = sequelize.define(
    //*remember must CamelCase
    "ClientGroupPermission",
    {
      client_group_permission_id: {
        type: DataTypes.STRING(255),
        defaultValue: DataTypes.UUIDV4,
        allowNull: false,
        primaryKey: true,
      },
      client_group_id: {
        type: DataTypes.STRING(255),
        allowNull: false,
        references: {
          model: "ClientGroup",
          key: "client_group_id",
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
      // permission_id: {
      //   type: DataTypes.STRING(255),
      //   allowNull: false,
      //   references: {
      //     model: 'Permission',
      //     key: 'permission_id',
      //   },
      // },
      column_name: {
        type: DataTypes.TEXT("long"),
        allowNull: false,
        get: function () {
          const data = this.getDataValue("column_name");
          if (data) {
            return JSON.parse(data);
          } else {
            return [];
          }
        },
        set: function (value) {
          this.setDataValue("column_name", JSON.stringify(value));
        },
      },
      action_type: {
        type: DataTypes.STRING(255),
        allowNull: false,
      },
    },
    options
  );

  return client_group_permission;
};
