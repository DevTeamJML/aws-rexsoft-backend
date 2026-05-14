// const { DataTypes } = require('sequelize');
const { options } = require("./options/options");
module.exports = (sequelize, DataTypes) => {
  const company = sequelize.define(
    //*remember must CamelCase
    "Company",
    {
      company_id: {
        type: DataTypes.STRING(255),
        defaultValue: DataTypes.UUIDV4,
        allowNull: false,
        primaryKey: true,
      },
      company_name: {
        type: DataTypes.STRING(255),
        allowNull: false,
      },
      company_email: {
        type: DataTypes.STRING(255),
        allowNull: true,
      },
      phone_no: {
        type: DataTypes.STRING(255),
        allowNull: true,
      },
      address: {
        type: DataTypes.STRING(255),
        allowNull: true,
      },
      // logo: {
      //   type: DataTypes.INTEGER,
      //   defaultValue: null,
      //   allowNull: true,
      //   references: {
      //     model: "FileManager",
      //     key: "file_id",
      //   },
      // },
    },
    options
  );

  return company;
};
