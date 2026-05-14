const createSuperDao = require('./index');
const models = require('../models');
const httpStatus = require('http-status');
const ApiError = require('../utils/ApiError');
const { generateUniqueID } = require('../utils/Generator');
const { v4 } = require('uuid');

const file_manager = models.file_manager;
const companies = models.companies;

function createFileManagerDao() {
  const superDaoFileManager = createSuperDao(file_manager);

  /**
   * * Get files list
   */
  async function findAllFiles(company_id) {
    const options = {
      attributes: { exclude: ['updated_at'] },
      order: [['created_at', 'DESC']],
    };

    const query = {
      where: { company_id },
    };

    // * Get all related foreign key table
    const allFile = await superDaoFileManager.findAll(options, query);
    const results = allFile.map((item) => {
      return {
        ...item.toJSON(),
        isUsed: false,
      };
    });
    return results;
  }

  /**
   * * Create file
   */
  async function createFiles(body) {
    const results = await superDaoFileManager.bulkCreate(body);
    return results;
  }

  /**
   * * Delete file
   */
  async function removeFiles(body) {
    const files = body;
    const getAllFileIDs = files.map((item) => item.file_id);
    const query = {
      where: {
        file_id: getAllFileIDs,
      },
    };
    await superDaoFileManager.remove(query);
    return files;
  }

  return {
    findAllFiles,
    createFiles,
    removeFiles,
  };
}

module.exports = createFileManagerDao;
