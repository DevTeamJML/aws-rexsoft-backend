const createFileManagerDao = require('../dao/file_manager.dao');
const fileManagerDao = createFileManagerDao();

const getAllFiles = async (company_id) => {
  const results = await fileManagerDao.findAllFiles(company_id);
  return results;
};

const createFiles = async (body) => {
  const results = await fileManagerDao.createFiles(body);
  return results;
};

const removeFiles = async (body) => {
  const results = await fileManagerDao.removeFiles(body);
  return results;
};

module.exports = {
  getAllFiles,
  createFiles,
  removeFiles,
};
