// const { DataTypes } = require('sequelize');
const { options } = require("./options/options");
module.exports = (sequelize, DataTypes) => {
  const kpi_user = sequelize.define(
    //*remember must CamelCase
    "KpiUser",
    {
      kpi_user_id: {
        type: DataTypes.STRING(255),
        defaultValue: DataTypes.UUIDV4,
        allowNull: false,
        primaryKey: true,
      },
      kpi_id: {
        type: DataTypes.STRING(255),
        allowNull: false,
        references: {
          model: "Kpi",
          key: "kpi_id",
        },
      },
      company_user_id: {
        type: DataTypes.STRING(255),
        allowNull: false,
        references: {
          model: "User",
          key: "user_id",
        },
      },
    },
    options
  );

  return kpi_user;
};
