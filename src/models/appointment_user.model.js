// const { DataTypes } = require('sequelize');
const { options } = require("./options/options");
module.exports = (sequelize, DataTypes) => {
  const appointment_user = sequelize.define(
    //*remember must CamelCase
    "AppointmentUser",
    {
      appointment_user_id: {
        type: DataTypes.STRING(255),
        defaultValue: DataTypes.UUIDV4,
        allowNull: false,
        primaryKey: true,
      },
      appointment_id: {
        type: DataTypes.STRING(255),
        allowNull: false,
        references: {
          model: "Appointment",
          key: "appointment_id",
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
    },
    options
  );

  return appointment_user;
};
