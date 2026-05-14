// controllers/log.controller.js
const httpStatus = require("http-status");
const catchAsync = require("../utils/catchAsync");
const {
  createLog: createLogService,
  getLogs: getLogsService,
} = require("../services/log.service");

const createLog = catchAsync(async (req, res) => {
  const body = req.body || {};
  const { company_id } = body;

  if (!company_id) {
    return res
      .status(httpStatus.BAD_REQUEST)
      .send({ message: "company_id required" });
  }

  const result = await createLogService(body);
  return res.status(httpStatus.CREATED).json(result);
});

const getLogs = catchAsync(async (req, res) => {
  const query = req.query || {};

  const {
    company_id,
    user_id,
    section,
    action,
    serial_number,
    q,
    date_from,
    date_to,
    limit = 50,
    offset = 0,
  } = query;

  const filters = {
    company_id,
    user_id,
    section,
    action,
    q,
    serial_number,
    date_from,
    date_to,
    limit: Number(limit),
    offset: Number(offset),
  };

  const result = await getLogsService(filters);
  res.status(httpStatus.OK).json(result);
});

const getMyLogs = catchAsync(async (req, res) => {
  const query = req.query || {};

  const {
    company_id,
    user_id,
    section,
    action,
    q,
    date_from,
    date_to,
    limit = 50,
    offset = 0,
  } = query;

  if (!company_id || !user_id) {
    return res
      .status(httpStatus.BAD_REQUEST)
      .send({ message: "company_id and user_id required" });
  }

  const filters = {
    company_id,
    user_id,
    section,
    action,
    q,
    date_from,
    date_to,
    limit: Number(limit),
    offset: Number(offset),
  };

  const result = await getLogsService(filters);
  res.status(httpStatus.OK).json(result);
});

module.exports = {
  createLog,
  getLogs,
  getMyLogs,
};
