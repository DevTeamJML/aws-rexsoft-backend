const httpStatus = require("http-status");

const { clientGroupService, dynamicColumnService } = require("../services");
const catchAsync = require("../utils/catchAsync");

const duplicateClientGroup = catchAsync(async (req, res) => {
  const result = await clientGroupService.duplicateClientGroup(req.body);
  res.status(httpStatus.CREATED).send(result);
});

const getClientGroupById = catchAsync(async (req, res) => {
  const result = await clientGroupService.getClientGroupById(req.body);
  res.status(httpStatus.CREATED).send(result);
});

const createClientGroup = catchAsync(async (req, res) => {
  const result = await clientGroupService.createClientGroup(req.body);
  res.status(httpStatus.CREATED).send(result);
});

const updateClientGroup = catchAsync(async (req, res) => {
  const result = await clientGroupService.updateClientGroup(req.body);
  res.status(httpStatus.OK).send(result);
});

const getAllClientGroups = catchAsync(async (req, res) => {
  const { company_id } = req.query;

  if (!company_id) {
    return res.status(httpStatus.BAD_REQUEST).send({
      message: "Missing company_id in query parameters",
    });
  }

  const result = await clientGroupService.getAllClientGroups(company_id);

  res.status(httpStatus.OK).send(result);
});

const deleteClientGroup = catchAsync(async (req, res) => {
  const { client_group_id } = req.query;

  if (!client_group_id) {
    return res.status(httpStatus.BAD_REQUEST).send({
      message: "Missing client_group_id in query parameters",
    });
  }

  const result = await clientGroupService.deleteGroupById(client_group_id);

  res
    .status(httpStatus.OK)
    .send({ message: "Client group deleted", data: result });
});


const getAllClientGroupsName = catchAsync(async (req, res) => {
  const { company_id } = req.query;

  if (!company_id) {
    return res.status(httpStatus.BAD_REQUEST).send({
      message: "Missing company_id in query parameters",
    });
  }

  const result = await clientGroupService.getAllClientGroupsName(company_id);

  res.status(httpStatus.OK).send(result);
});

const getSelectedClientGroup = catchAsync(async (req, res) => {
  const { client_group_id } = req.query;

  if (!client_group_id) {
    return res.status(httpStatus.BAD_REQUEST).send({
      message: "Missing client_group_id in query parameters",
    });
  }

  const result = await clientGroupService.getSelectedClientGroup(client_group_id);

  res.status(httpStatus.OK).send(result);
});

module.exports = {
  getClientGroupById,
  createClientGroup,
  getAllClientGroups,
  deleteClientGroup,
  updateClientGroup,
  getAllClientGroupsName,
  getSelectedClientGroup,
  duplicateClientGroup
};
