// const { DataTypes } = require('sequelize');
const { options } = require("./options/options");
module.exports = (sequelize, DataTypes) => {
  const form_question = sequelize.define(
    //*remember must CamelCase
    "FormQuestion",
    {
      form_question_id: {
        type: DataTypes.STRING(255),
        defaultValue: DataTypes.UUIDV4,
        allowNull: false,
        primaryKey: true,
      },
    },
    options
  );

  return form_question;
};
