// controllers/appointmentsController.js
const httpStatus = require("http-status");
const catchAsync = require("../utils/catchAsync");
const { v4: uuidv4 } = require("uuid");
const { appointmentService } = require("../services");

const searchClientListInAppointment = catchAsync(async (req, res) => {
  const company_id = req.query.company_id;
  const searchText = req.query.searchText;

  if (!company_id) {
    return res.status(httpStatus.BAD_REQUEST).send({
      success: false,
      message: "company_id are required",
    });
  }

  const appointments = await appointmentService.searchClientListInAppointment({
    company_id,
    searchText,
  });

  return res.status(httpStatus.OK).send({
    success: true,
    data: appointments || [],
  });
});

/**
 * POST /appointments
 */
const createAppointment = catchAsync(async (req, res) => {
  const result = await appointmentService.createAppointment(req.body);

  // You may want to return the created appointment object instead - service currently returns insert metadata
  return res.status(httpStatus.CREATED).send({
    success: true,
    data: result,
  });
});

/**
 * GET /appointments?company_id=...&user_id=...
 * or use authenticated user from req.user
 */
const getAppointments = catchAsync(async (req, res) => {
  const company_id = req.query.company_id;
  const user_id = req.query.user_id;

  if (!company_id || !user_id) {
    return res.status(httpStatus.BAD_REQUEST).send({
      success: false,
      message: "company_id and user_id are required",
    });
  }

  const appointments = await appointmentService.getAppointments({
    company_id,
    user_id,
  });

  return res.status(httpStatus.OK).send({
    success: true,
    data: appointments,
  });
});

/**
 * PUT /appointments/:appointment_id
 */
const updateAppointment = catchAsync(async (req, res) => {
  const appointment_id = req.body.appointment_id;
  const company_id = req.body.company_id;
  const user_id = req.body.user_id;

  if (!appointment_id) {
    return res.status(httpStatus.BAD_REQUEST).send({
      success: false,
      message: "appointment_id is required in params",
    });
  }

  if (!company_id || !user_id) {
    return res.status(httpStatus.BAD_REQUEST).send({
      success: false,
      message: "company_id and user_id are required",
    });
  }

  const updated = await appointmentService.updateAppointment(req.body);

  return res.status(httpStatus.OK).send({
    success: true,
    data: updated,
  });
});

/**
 * DELETE /appointments/:appointment_id
 */
const deleteAppointment = catchAsync(async (req, res) => {
  const appointment_id = req.body.appointment_id;
  if (!appointment_id) {
    return res.status(httpStatus.BAD_REQUEST).send({
      success: false,
      message: "appointment_id is required in params",
    });
  }
  const result = await appointmentService.deleteAppointment(appointment_id);

  return res.status(httpStatus.OK).send({
    success: true,
    data: result,
  });
});

module.exports = {
  searchClientListInAppointment,
  createAppointment,
  getAppointments,
  updateAppointment,
  deleteAppointment,
};
