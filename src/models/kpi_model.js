// const { DataTypes } = require('sequelize');
const { options } = require("./options/options");
module.exports = (sequelize, DataTypes) => {
  const kpi = sequelize.define(
    //*remember must CamelCase
    "Kpi",
    {
      kpi_id: {
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
      title: {
        type: DataTypes.STRING(255),
        allowNull: true,
      },
      definition: {
        type: DataTypes.STRING(255),
        allowNull: true,
      },
      data_source: {
        type: DataTypes.STRING(255),
        allowNull: true,
      },
      target: {
        type: DataTypes.STRING(255),
        allowNull: true,
      },
      start_date: {
        type: DataTypes.DATE,
        allowNull: true,
      },
      due_date: {
        type: DataTypes.DATE,
        allowNull: true,
      },
      metric_value: {
        type: DataTypes.STRING(255),
        allowNull: true,
      },
      measurement_unit: {
        type: DataTypes.STRING(255),
        allowNull: true,
      },
      team_contribution: {
        type: DataTypes.STRING(255),
        allowNull: true,
      },
      assigned_by: {
        type: DataTypes.STRING(255),
        allowNull: true,
      },
    },
    options
  );

  return kpi;
};
