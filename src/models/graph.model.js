// const { DataTypes } = require('sequelize');
const { options } = require("./options/options");
module.exports = (sequelize, DataTypes) => {
  const graph = sequelize.define(
    //*remember must CamelCase
    "Graph",
    {
      graph_id: {
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
      client_table_id: {
        type: DataTypes.STRING(255),
        allowNull: true,
      },
      form_id: {
        type: DataTypes.STRING(255),
        allowNull: true,
      },
      title: {
        type: DataTypes.STRING(255),
        allowNull: true,
      },
      type: {
        type: DataTypes.STRING(255),
        allowNull: true,
      },
      xAxis: {
        type: DataTypes.TEXT("long"),
        allowNull: true,
        get: function () {
          const data = this.getDataValue("xAxis");
          if (data) {
            return JSON.parse(data);
          } else {
            return null;
          }
        },
        set: function (value) {
          this.setDataValue("xAxis", JSON.stringify(value));
        },
      },
      yAxis: {
        type: DataTypes.TEXT("long"),
        allowNull: true,
        get: function () {
          const data = this.getDataValue("yAxis");
          if (data) {
            return JSON.parse(data);
          } else {
            return null;
          }
        },
        set: function (value) {
          this.setDataValue("yAxis", JSON.stringify(value));
        },
      },
      series: {
        type: DataTypes.TEXT("long"),
        allowNull: true,
        get: function () {
          const data = this.getDataValue("series");
          if (data) {
            return JSON.parse(data);
          } else {
            return null;
          }
        },
        set: function (value) {
          this.setDataValue("series", JSON.stringify(value));
        },
      },
      pie_property: {
        type: DataTypes.TEXT("long"),
        allowNull: true,
        get: function () {
          const data = this.getDataValue("pie_property");
          if (data) {
            return JSON.parse(data);
          } else {
            return null;
          }
        },
        set: function (value) {
          this.setDataValue("pie_property", JSON.stringify(value));
        },
      },
      type: {
        type: DataTypes.STRING(255),
        allowNull: true,
      },
      unit: {
        type: DataTypes.STRING(255),
        allowNull: true,
      },
      label: {
        type: DataTypes.STRING(255),
        allowNull: true,
      },
      filter_setting: {
        type: DataTypes.TEXT("long"),
        allowNull: true,
        get: function () {
          const data = this.getDataValue("filter_setting");
          if (data) {
            return JSON.parse(data);
          } else {
            return null;
          }
        },
        set: function (value) {
          this.setDataValue("filter_setting", JSON.stringify(value));
        },
      },
      sort_setting: {
        type: DataTypes.TEXT("long"),
        allowNull: true,
        get: function () {
          const data = this.getDataValue("sort_setting");
          if (data) {
            return JSON.parse(data);
          } else {
            return null;
          }
        },
        set: function (value) {
          this.setDataValue("sort_setting", JSON.stringify(value));
        },
      },
      date_setting: {
        type: DataTypes.TEXT("long"),
        allowNull: true,
        get: function () {
          const data = this.getDataValue("date_setting");
          if (data) {
            return JSON.parse(data);
          } else {
            return null;
          }
        },
        set: function (value) {
          this.setDataValue("date_setting", JSON.stringify(value));
        },
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
      viewable_by: {
        type: DataTypes.TEXT("long"),
        allowNull: true,
        get: function () {
          const data = this.getDataValue("viewable_by");
          if (data) {
            return JSON.parse(data);
          } else {
            return null;
          }
        },
        set: function (value) {
          this.setDataValue("viewable_by", JSON.stringify(value));
        },
      },
      cover: {
        type: DataTypes.TEXT("long"),
        allowNull: true,
      },
    },
    options
  );

  return graph;
};
