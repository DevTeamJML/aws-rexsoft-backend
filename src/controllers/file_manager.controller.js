const httpStatus = require('http-status');
const catchAsync = require('../utils/catchAsync');
const { fileManagerService } = require('../services');


const findAllFiles = catchAsync(async (req, res) => {
  const company_id = req.headers[Headers.company_id];
  const files = await fileManagerService.getAllFiles(company_id);
  res.status(200).send(files);
});

const createFiles = catchAsync(async (req, res) => {
  const results = await fileManagerService.createFiles(req.body);
  res.status(200).send(results);
});

const removeFiles = catchAsync(async (req, res) => {
  const results = await fileManagerService.removeFiles(req.body);
  res.status(200).send(results);
});

module.exports = {
  findAllFiles,
  createFiles,
  removeFiles,
};
