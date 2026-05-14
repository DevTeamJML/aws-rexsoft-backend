// const { DataTypes } = require('sequelize');
const { options } = require("./options/options");
module.exports = (sequelize, DataTypes) => {
  const appointment_client = sequelize.define(
    //*remember must CamelCase
    "AppointmentClient",
    {
      appointment_client_id: {
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
      client_id: {
        type: DataTypes.STRING(255),
        allowNull: false,
        references: {
          model: "Client",
          key: "client_id",
        },
      },
    },
    options
  );

  return appointment_client;
};
