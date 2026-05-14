// controllers/log.controller.js
const httpStatus = require("http-status");
const catchAsync = require("../utils/catchAsync");
const { leaderService } = require("../services");

const assignLeader = catchAsync(async (req, res) => {
  const body = req.body || {};
  const { company_id, user_id, leader_id, assigned_members } = body;

  if (!company_id) {
    return res
      .status(httpStatus.BAD_REQUEST)
      .send({ message: "company_id required" });
  }

  if (!user_id) {
    return res
      .status(httpStatus.BAD_REQUEST)
      .send({ message: "user_id required" });
  }

  const result = await leaderService.assignLeader(body);
  return res.status(httpStatus.CREATED).json(result);
});

const updateLeader = catchAsync(async (req, res) => {
  const body = req.body || {};
  const { company_id, user_id, leader_id, assigned_members } = body;

  if (!company_id) {
    return res
      .status(httpStatus.BAD_REQUEST)
      .send({ message: "company_id required" });
  }

  if (!user_id) {
    return res
      .status(httpStatus.BAD_REQUEST)
      .send({ message: "user_id required" });
  }

  const result = await leaderService.updateLeader(body);
  return res.status(httpStatus.CREATED).json(result);
});

const getAllLeader = catchAsync(async (req, res) => {
  const body = req.body || {};
  const { company_id } = body;

  if (!company_id) {
    return res
      .status(httpStatus.BAD_REQUEST)
      .send({ message: "company_id required" });
  }

  const result = await leaderService.getAllLeader(body);
  return res.status(httpStatus.CREATED).json(result);
});

const deleteLeader = catchAsync(async (req, res) => {
  const body = req.body || {};
  const { leader_id } = body;

  if (!leader_id) {
    return res
      .status(httpStatus.BAD_REQUEST)
      .send({ message: "leader_id required" });
  }

  const result = await leaderService.deleteLeader(body);
  return res.status(httpStatus.CREATED).json(result);
});

module.exports = {
  assignLeader,
  getAllLeader,
  updateLeader,
  deleteLeader,
};
