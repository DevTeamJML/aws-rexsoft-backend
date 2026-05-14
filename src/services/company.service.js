const getConnection = require("../db/pool");
const {
  createCompanyQuery,
  getAllCompaniesQuery,
} = require("../queries/companyQueries");
const { createCompanyUserQuery } = require("../queries/companyUserQueries");

const createCompany = async (body) => {
  const connection = await getConnection();
  try {
    const {
      company_id,
      user_id,
      is_owner = false,
      company_name,
      company_email,
      phone_no,
      address,
    } = body;

    const createCompanySql = createCompanyQuery();
    const createCompanyUserSql = createCompanyUserQuery();
    await connection.beginTransaction();
    await connection.execute(createCompanySql, [
      company_id,
      company_name,
      company_email,
      phone_no,
      address,
      new Date(),
      new Date(),
    ]);
    await connection.execute(createCompanyUserSql, [
      company_id,
      user_id,
      is_owner,
      new Date(),
      new Date(),
    ]);
    await connection.commit();
  } catch (error) {
    await connection.rollback();
    console.error("Error in transaction:", error);
    throw error;
  } finally {
    connection.release();
  }
};

const getAllCompanies = async (user_id) => {
  const connection = await getConnection();
  try {
    const getAllCompaniesSql = getAllCompaniesQuery();
    await connection.beginTransaction();
    const [result] = await connection.execute(getAllCompaniesSql, [user_id]);
    return result;
    await connection.commit();
  } catch (error) {
    await connection.rollback();
    console.error("Error in transaction:", error);
    throw error;
  } finally {
    connection.release();
  }
};

const setCompany = async () => {};

module.exports = {
  getAllCompanies,
  setCompany,
  createCompany,
};
