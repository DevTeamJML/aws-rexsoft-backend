const httpStatus = require('http-status');
const logger = require('../config/logger');
const ApiError = require('../utils/ApiError');

function createSuperDao(model) {
  async function findAll(options = {}, query = {}) {
    try {
      const results = model.findAll({ ...options, ...query });
      return results;
    } catch (error) {
      logger.error(error);
      console.log(error);
    }
  }

  async function findOne(options = {}, query = {}) {
    try {
      const results = model.findOne({ ...options, ...query });
      return results;
    } catch (error) {
      logger.error(error);
      console.log(error);
    }
  }

  async function findByPk(id = "", options = {}) {
    try {
      const results = model.findByPk(id, options);
      return results;
    } catch (error) {
      logger.error(error);
      console.log(error);
    }
  }

  async function findOrCreate(options = {}) {
    try {
      const results = model.findOrCreate(options);
      return results;
    } catch (error) {
      logger.error(error);
      console.log(error);
    }
  }

  async function findAndCountAll(options = {}, query = {}) {
    try {
      const results = model.findAndCountAll({ ...options, ...query });
      return results;
    } catch (error) {
      logger.error(error);
      console.log(error);
    }
  }

  async function create(data, options) {
    try {
      // console.log("model: " , model)
      const results = await model.create(data, options);
      return results;
    } catch (error) {
      console.log(error);
      logger.error(error);
      throw new ApiError(httpStatus.INTERNAL_SERVER_ERROR, error);
    }
  }

  async function bulkCreate(data) {
    try {
      const results = await model.bulkCreate(data);
      return results;
    } catch (error) {
      logger.error(error);
      throw new ApiError(httpStatus.INTERNAL_SERVER_ERROR, error);
    }
  }

  async function update(data, query) {
    try {
      const results = await model.update(data, { ...query });
      return results;
    } catch (error) {
      logger.error(error);
      throw new ApiError(httpStatus.INTERNAL_SERVER_ERROR, error);
    }
  }

  async function bulkUpdate(data, query) {
    try {
      const results = await model.update(data, { ...query });
      return results;
    } catch (error) {
      logger.error(error);
      throw new ApiError(httpStatus.INTERNAL_SERVER_ERROR, error);
    }
  }

  async function remove(query) {
    try {
      const results = await model.destroy({ ...query });
      return results;
    } catch (error) {
      console.log(`${error.table}_${error.name}`);
      if (error.table && error.name) {
        throw new ApiError(httpStatus.INTERNAL_SERVER_ERROR, `${error.table}_${error.name}`);
      } else {
        console.log(error.message);
        throw new ApiError(httpStatus.INTERNAL_SERVER_ERROR, error.message);
      }
      // logger.error(error);
    }
  }

  async function max(query, options) {
    try {
      const results = model.max(query, { ...options });
      return results;
    } catch (error) {
      logger.error(error);
      console.log(error);
    }
  }

  async function sum(query, options) {
    try {
      const results = model.sum(query, { ...options });
      return results;
    } catch (error) {
      logger.error(error);
      console.log(error);
      throw new ApiError(httpStatus.INTERNAL_SERVER_ERROR, error.message);
    }
  }

  async function bulkCreate(data, options) {
    try {
      const results = model.bulkCreate(data, { ...options });
      return results;
    } catch (error) {
      logger.error(error);
      console.log(error);
      throw new ApiError(httpStatus.INTERNAL_SERVER_ERROR, error.message);
    }
  }
  return {
    findAll,
    findOne,
    findByPk,
    findAndCountAll,
    findOrCreate,
    create,
    bulkCreate,
    update,
    bulkUpdate,
    bulkCreate,
    remove,
    max,
    sum,
  };
}

module.exports = createSuperDao;
