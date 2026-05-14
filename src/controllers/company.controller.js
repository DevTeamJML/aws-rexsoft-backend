const httpStatus = require("http-status");
const catchAsync = require("../utils/catchAsync");
const { companiesService } = require("../services");



const getAllCompanies = catchAsync(async (req, res) => {
  const { user_id } = req.query;

  if (!user_id) {
    return res.status(httpStatus.BAD_REQUEST).send({
      message: "Missing user_id in query parameters",
    });
  }
  const companies = await companiesService.getAllCompanies(req.query);

  res.status(httpStatus.OK).send({ companies });
});

const updateCompany = catchAsync(async (req, res) => {
  const company_id = req.headers[Headers.company_id];
  const payload = {
    company_id: company_id,
    ...req.body,
  };

  const results = await companiesService.updateCompany(payload);
  res.status(httpStatus.CREATED).send(results);
});

const createCompany = catchAsync(async (req, res) => {
  const result = await companiesService.createCompany(req.body);
  res.status(httpStatus.CREATED).send(result);
});

module.exports = {
  getAllCompanies,
  updateCompany,
  createCompany,
};
