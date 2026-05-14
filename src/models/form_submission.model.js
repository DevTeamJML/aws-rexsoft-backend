// const { DataTypes } = require('sequelize');
const { options } = require("./options/options");
module.exports = (sequelize, DataTypes) => {
  const form_submission = sequelize.define(
    //*remember must CamelCase
    "FormSubmission",
    {
      form_submission_id: {
        type: DataTypes.STRING(255),
        defaultValue: DataTypes.UUIDV4,
        allowNull: false,
        primaryKey: true,
      },
      user_id: {
        type: DataTypes.STRING(255),
        allowNull: false,
        references: {
          model: "User",
          key: "user_id",
        },
      },
      form_tracking_id: {
        type: DataTypes.STRING(255),
        allowNull: true,
      },
      approved_at: {
        type: DataTypes.STRING(255),
        allowNull: true,
      },
      approved_by: {
        type: DataTypes.DATE,
        allowNull: true,
      },
      rejected_by: {
        type: DataTypes.DATE,
        allowNull: true,
      },
      rejected_reason: {
        type: DataTypes.STRING(255),
        allowNull: true,
      },
      status: {
        type: DataTypes.STRING(255),
        allowNull: true,
      },
    },
    options
  );

  return form_submission;
};
