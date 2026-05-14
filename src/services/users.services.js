const createUsersDao = require("../dao/users.dao");
const usersDao = createUsersDao();
const getConnection = require("../db/pool");
const { getAllCompaniesQuery } = require("../queries/companyQueries");
const {
  getUserByIdQuery,
  createUserQuery,
  updateUserQuery,
} = require("../queries/userQueries");

const { createInvitationQuery } = require("../queries/invitationQueries");
const { sendInvitationMail } = require("../utils/mailer");
const { firebaseAuth } = require("../config/firebase");

/**
 * * Get a user by id
 * @returns {Promise<user>}
 */

// const getUserDetailsById = async (user_id, company_id) => {
//   const connection = await getConnection();
//   try {
//     const getUserByIdSql = getUserByIdQuery();
//     //get role

//     await connection.beginTransaction();
//     console.log(id);
//     const [rows] = await connection.execute(sql, [id]);
//     await connection.commit();

//     console.log("rows", rows[0]);
//     return rows[0];
//   } catch (error) {
//     await connection.rollback();
//     console.error("Error in transaction:", error);
//     throw error;
//   } finally {
//     connection.release();
//   }
// };
// const getUserDetailsById = async (user_id, company_id) => {
//   const user = await usersDao.findUserDetailsById(user_id, company_id);
//   return user;
// };

const checkUser = async (user_id) => {
  const results = await usersDao.checkUser(user_id);
  return results;
};

async function getUserDetailsById(user_id, company_id) {
  const connection = await getConnection();
  try {
    const getUserDetailsSql = getUserByIdQuery();
    const getAllCompaniesSql = getAllCompaniesQuery();
    await connection.beginTransaction();
    const [rows] = await connection.execute(getUserDetailsSql, [user_id]);
    const [result] = await connection.execute(getAllCompaniesSql, [user_id]);
    await connection.commit();

    return {
      userDetails: rows[0],
      companies: result.length === 0 ? [] : result,
    };
  } catch (error) {
    await connection.rollback();
    console.error("Error in transaction:", error);
    throw error;
  } finally {
    connection.release();
  }
}

async function registerFirebaseUser({
  first_name,
  last_name,
  email,
  password,
}) {
  try {
    const userRecord = await firebaseAuth.createUser({
      email: email.trim(),
      emailVerified: false,
      password: password,
      displayName: `${first_name} ${last_name}`,
      disabled: false,
    });
    return userRecord;
  } catch (error) {
    console.error("Error creating new user:", error);
    throw error;
  }
}

async function registerUser({ user_id, first_name, last_name, email }) {
  const connection = await getConnection();
  try {
    const sql = createUserQuery();
    await connection.beginTransaction();
    const [result] = await connection.execute(sql, [
      user_id,
      first_name,
      last_name,
      email,
      new Date(),
      new Date(),
    ]);
    await connection.commit();
    return result;
  } catch (error) {
    await connection.rollback();
    console.error("Error creating user:", error);
    throw error;
  } finally {
    connection.release();
  }
}

async function updateUserProfile({ user_id, first_name, last_name, email }) {
  const connection = await getConnection();

  try {
    await connection.beginTransaction();

    const sql = updateUserQuery();

    await connection.execute(sql, [
      first_name,
      last_name,
      email,
      new Date(),
      user_id,
    ]);

    await connection.commit();
  } catch (error) {
    await connection.rollback();
    console.error("DB update failed:", error);
    throw error;
  } finally {
    connection.release();
  }

  try {
    await firebaseAuth.updateUser(user_id, {
      displayName: `${first_name} ${last_name}`,
      email: email,
    });
  } catch (error) {
    console.error("Firebase update failed:", error);

    throw error;
  }

  return { success: true };
}

module.exports = {
  registerFirebaseUser,
  getUserDetailsById,
  registerUser,
  checkUser,
  updateUserProfile
};
