const httpStatus = require("http-status");
const catchAsync = require("../utils/catchAsync");


const { companyUserService } = require("../services");

const createCompanyUser = catchAsync(async (req, res) => {
  const company_id = req.headers[Headers.company_id];
  const payload = {
    company_id: company_id,
    ...req.body,
  };

  const company = await companyUserService.createCompanyUser(payload);
  // const initialResults = await initService.initialDefaultData(company);
  res.status(httpStatus.CREATED).send(company);
});

const getAllCompanyUsers = catchAsync(async (req, res) => {
  const { company_id } = req.query;

  if (!company_id) {
    return res.status(httpStatus.BAD_REQUEST).send({
      message: "Missing company_id in query parameters",
    });
  }

  const result = await companyUserService.getAllCompanyUsers(company_id);

  res.status(httpStatus.OK).send(result);
});

module.exports = {
  createCompanyUser,
  getAllCompanyUsers
};
