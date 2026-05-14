const { DataTypes } = require("sequelize");
const { options } = require("./options/options");

module.exports = (sequelize) => {
  const file_manager = sequelize.define(
    "FileManager",
    {
      file_id: {
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
      name: {
        type: DataTypes.STRING(255),
        allowNull: false,
      },
      size: {
        type: DataTypes.STRING(100),
        allowNull: false,
      },
      type: {
        type: DataTypes.STRING(100),
        allowNull: false,
      },
      url: {
        type: DataTypes.TEXT("long"),
        allowNull: false,
      },
    },
    options
  );

  return file_manager;
};
