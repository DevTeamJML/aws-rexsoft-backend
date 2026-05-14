// const { DataTypes } = require('sequelize');
const { options } = require("./options/options");
module.exports = (sequelize, DataTypes) => {
  const form_answer = sequelize.define(
    //*remember must CamelCase
    "FormAnswer",
    {
      form_answer_id: {
        type: DataTypes.STRING(255),
        defaultValue: DataTypes.UUIDV4,
        allowNull: false,
        primaryKey: true,
      },

      company_user_id: {
        type: DataTypes.STRING(255),
        allowNull: false,
        references: {
          model: "CompanyUser",
          key: "company_user_id",
        },
      },
      form_question_id: {
        type: DataTypes.STRING(255),
        allowNull: false,
        references: {
          model: "FormQuestion",
          key: "form_question_id",
        },
      },
    },
    options
  );

  return form_answer;
};
