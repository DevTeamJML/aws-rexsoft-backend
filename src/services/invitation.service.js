const createUsersDao = require("../dao/users.dao");
const usersDao = createUsersDao();
const { getUserById, createUser } = require("../queries/userQueries");
const getConnection = require("../db/pool");
const {
  createInvitationQuery,
  removeInvitationQuery,
  rejectInvitationQuery,
  resendInvitationQuery,
  getInvitationByIdQuery,
  getAllInvitationAndUserQuery,
} = require("../queries/invitationQueries");
const { sendInvitationMail } = require("../utils/mailer");
const { removeCompanyUserQuery } = require("../queries/companyUserQueries");
const { removeClientUserQuery } = require("../queries/clientUserQueries");

async function getInvitationById(body) {
  const connection = await getConnection();
  try {
    const sql = getInvitationByIdQuery();
    await connection.beginTransaction();
    const [result] = await connection.execute(sql, [body]);
    await connection.commit();
    return result[0];
  } catch (error) {
    await connection.rollback();
    console.error("Error in transaction:", error);
    throw error;
  } finally {
    connection.release();
  }
}

const inviteUserToCompany = async (body) => {
  const connection = await getConnection();
  try {
    const { invitation_id, first_name, email, is_admin, company_id } = body;

    const invitationSql = createInvitationQuery();
    await connection.beginTransaction();
    const [result] = await connection.execute(invitationSql, [
      invitation_id,
      company_id,
      first_name,
      email,
      is_admin,
      "pending",
      new Date(),
      new Date(),
    ]);
    await connection.commit();
    const mailInfo = await sendInvitationMail(body);
    console.log("Email sent:", mailInfo);
    return result;
  } catch (err) {
    console.error("Error sending invitation:", err);
    throw err;
  }
};

async function removeInvitation(body) {
  const connection = await getConnection();
  try {
    const { invitation_id } = body;
    const sql = removeInvitationQuery();
    await connection.beginTransaction();
    await connection.execute(sql, [invitation_id]);
    await connection.commit();
  } catch (error) {
    await connection.rollback();
    console.error("Error in transaction:", error);
    throw error;
  } finally {
    connection.release();
  }
}

async function removeInvitationAndUser(body) {
  const connection = await getConnection();
  try {
    const { company_id, id, status } = body;

    await connection.beginTransaction();
    if (status !== "active") {
      const removeInvitationSql = removeInvitationQuery();
      await connection.execute(removeInvitationSql, [id]);
    } else {
      const removeCompanyUserSql = removeCompanyUserQuery();
      await connection.execute(removeCompanyUserSql, [id, company_id]);
      const removeClientUserSql = removeClientUserQuery();
      await connection.execute(removeClientUserSql, [id, company_id]);
    }
    await connection.commit();
  } catch (error) {
    await connection.rollback();
    console.error("Error in transaction:", error);
    throw error;
  } finally {
    connection.release();
  }
}

async function resendInvitation(body) {
  const connection = await getConnection();
  try {
    const { invitation_id } = body;
    const sql = resendInvitationQuery();
    await connection.beginTransaction();
    await connection.execute(sql, [invitation_id]);
    await connection.commit();
  } catch (error) {
    await connection.rollback();
    console.error("Error in transaction:", error);
    throw error;
  } finally {
    connection.release();
  }
}

async function rejectInvitation(body) {
  const connection = await getConnection();
  try {
    const { invitation_id } = body;
    const sql = rejectInvitationQuery();
    await connection.beginTransaction();
    await connection.execute(sql, [invitation_id]);
    await connection.commit();
  } catch (error) {
    await connection.rollback();
    console.error("Error in transaction:", error);
    throw error;
  } finally {
    connection.release();
  }
}

async function getAllInvitationAndUser(body) {
  const connection = await getConnection();
  try {
    const { company_id } = body;
    const sql = getAllInvitationAndUserQuery();
    await connection.beginTransaction();
    const [result] = await connection.execute(sql, [company_id, company_id]);
    await connection.commit();
    return result;
  } catch (error) {
    await connection.rollback();
    console.error("Error in transaction:", error);
    throw error;
  } finally {
    connection.release();
  }
}

module.exports = {
  removeInvitationAndUser,
  getAllInvitationAndUser,
  inviteUserToCompany,
  getInvitationById,
  removeInvitation,
  rejectInvitation,
  resendInvitation,
};
