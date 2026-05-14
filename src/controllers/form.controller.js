const httpStatus = require("http-status");
const { formService } = require("../services");
const catchAsync = require("../utils/catchAsync");

const createFormTemplate = catchAsync(async (req, res) => {
  const result = await formService.createFormTemplate(req.body);
  res.status(httpStatus.CREATED).send(result);
});

const createFormSubmission = catchAsync(async (req, res) => {
  const result = await formService.createFormSubmission(req.body);
  res.status(httpStatus.CREATED).send(result);
});

const getFormTemplateById = catchAsync(async (req, res) => {
  const result = await formService.getFormTemplateWithQuestionsById(
    req.query.form_template_id
  );
  res.status(httpStatus.CREATED).send(result);
});

const getFormSubmissionById = catchAsync(async (req, res) => {
  const result = await formService.getFormSubmissionById(
    req.query.form_submission_id
  );
  res.status(httpStatus.CREATED).send(result);
});

const getAllFormTemplates = catchAsync(async (req, res) => {
  const { company_id } = req.query || {};
  const result = await formService.getAllFormTemplatesWithQuestion(company_id);
  res.status(httpStatus.CREATED).send(result);
});

const getAllFormSubmissions = catchAsync(async (req, res) => {
  const result = await formService.getAllFormSubmissions(req.query);
  res.status(httpStatus.CREATED).send(result);
});

const getUserFormSubmission = catchAsync(async (req, res) => {
  const result = await formService.getUserFormSubmission(req.query);
  res.status(httpStatus.CREATED).send(result);
});

const updateFormTemplate = catchAsync(async (req, res) => {
  const result = await formService.updateFormTemplateWithQuestion(req.body);
  res.status(httpStatus.CREATED).send(result);
});

const updateFormSubmission = catchAsync(async (req, res) => {
  const result = await formService.updateFormSubmissionWithAnswer(req.body);
  res.status(httpStatus.CREATED).send(result);
});

const updateFormSubmissionApproval = catchAsync(async (req, res) => {
  const result = await formService.updateFormSubmissionApproval(req.body);
  res.status(httpStatus.CREATED).send(result);
});

const deleteFormTemplate = catchAsync(async (req, res) => {
  const result = await formService.deleteFormTemplate(
    req.body.form_template_id
  );
  res.status(httpStatus.CREATED).send(result);
});

const deleteFormSubmission = catchAsync(async (req, res) => {
  const result = await formService.deleteFormSubmission(
    req.body.form_submission_id
  );
  res.status(httpStatus.CREATED).send(result);
});


module.exports = {
  createFormTemplate,
  getFormTemplateById,
  getAllFormTemplates,
  updateFormTemplate,
  deleteFormTemplate,
  createFormSubmission,
  getAllFormSubmissions,
  getUserFormSubmission,
  getFormSubmissionById,
  updateFormSubmission,
  deleteFormSubmission,
  updateFormSubmissionApproval
};
