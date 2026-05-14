// const { DataTypes } = require('sequelize');
const { options } = require("./options/options");
module.exports = (sequelize, DataTypes) => {
  const form_permission = sequelize.define(
    //*remember must CamelCase
    "FormPermission",
    {
      form_template_id: {
        type: DataTypes.STRING(255),
        defaultValue: DataTypes.UUIDV4,
        allowNull: false,
        references: {
          model: "FormTemplate",
          key: "form_template_id",
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

  return form_permission;
};
