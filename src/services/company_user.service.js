const getConnection = require("../db/pool");
const { createCompanyUserQuery, getAllCompanyUsersQuery } = require("../queries/companyUserQueries");

const getAllCompanyUsers = async (company_id) => {
  const connection = await getConnection();
  try {
    const sql = getAllCompanyUsersQuery();
    await connection.beginTransaction();
    const [result] = await connection.execute(sql, [
      company_id
    ]);
    await connection.commit();

    return result;
  } catch (error) {
    await connection.rollback();
    console.error("Error in transaction:", error);
    throw error;
  } finally {
    connection.release();
  }
};

const createCompanyUser = async (body) => {
  const connection = await getConnection();
  try {
    const { company_id, user_id, role_id, is_owner } = body;
    const sql = createCompanyUserQuery();
    await connection.beginTransaction();
    await connection.query("SET FOREIGN_KEY_CHECKS = 0");
    const [result] = await connection.execute(sql, [
      company_id,
      user_id,
      is_owner,
      new Date(),
      new Date(),
    ]);
    await connection.query("SET FOREIGN_KEY_CHECKS = 1");
    await connection.commit();

    return result[0];
  } catch (error) {
    await connection.rollback();
    console.error("Error in transaction:", error);
    throw error;
  } finally {
    connection.release();
  }
};

module.exports = {
  createCompanyUser,
  getAllCompanyUsers
};
