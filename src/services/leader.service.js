// services/log.service.js
const mysql = require("mysql2"); // <<-- required for mysql.format debug
const { v4: uuidv4, v4 } = require("uuid");
const getConnection = require("../db/pool");
const { insertLogQuery } = require("../queries/logQueries");
const {
  insertLeaderQuery,
  insertLeaderUserQuery,
  deleteLeaderQuery,
  updateLeaderQuery,
  deleteLeaderUsersByLeaderIdQuery,
  getAllLeaderQuery,
} = require("../queries/leaderQueries");

async function getAllLeader({ company_id }) {
  const connection = await getConnection();

  try {
    const sql = getAllLeaderQuery();

    const [rows] = await connection.execute(sql, [company_id]);

    const leaderMap = {};

    rows.forEach((row) => {
      if (!leaderMap[row.leader_id]) {
        console.log(row)
        leaderMap[row.leader_id] = {
          leader_id: row.leader_id,
          user_id: row.user_id,
          company_id: row.company_id,

          leader_name: [row.leader_first_name, row.leader_last_name]
            .filter(Boolean)
            .join(" "),

          assigned_members: [],
        };
      }

      // member exists
      if (row.member_user_id) {
        leaderMap[row.leader_id].assigned_members.push({
          value: row.member_user_id,
          label: [row.member_first_name, row.member_last_name]
            .filter(Boolean)
            .join(" "),
        });
      }
    });

    const formatted = Object.values(leaderMap).map((leader) => ({
      ...leader,
      total_members: leader.assigned_members.length,
    }));

    return formatted;
  } catch (err) {
    console.error("getAllLeader error:", err);
    throw err;
  } finally {
    connection.release();
  }
}

async function assignLeader({
  company_id = "",
  user_id = "",
  leader_id = "",
  assigned_members = [],
}) {
  const connection = await getConnection();

  try {
    const leaderSql = insertLeaderQuery();
    const leaderUserSql = insertLeaderUserQuery();

    const createdAt = new Date();
    const updatedAt = new Date();

    // Insert Leader
    await connection.execute(leaderSql, [
      leader_id,
      user_id,
      company_id,
      createdAt,
      updatedAt,
    ]);

    // Insert Leader Members
    if (assigned_members.length > 0) {
      await Promise.all(
        assigned_members.map((member_id) =>
          connection.execute(leaderUserSql, [v4(), leader_id, member_id]),
        ),
      );
    }

    return {
      success: true,
      data: {
        leader_id,
        user_id,
        company_id,
        assigned_members,
      },
    };
  } catch (err) {
    console.error("assignLeader error:", err);
    throw err;
  } finally {
    connection.release();
  }
}
async function updateLeader({
  company_id = "",
  user_id = "",
  leader_id = "",
  assigned_members = [],
}) {
  const connection = await getConnection();

  try {
    await connection.beginTransaction();

    const updateLeaderSql = updateLeaderQuery();
    const deleteLeaderUsersSql = deleteLeaderUsersByLeaderIdQuery();
    const insertLeaderUserSql = insertLeaderUserQuery();

    const updatedAt = new Date();

    // 1. Update Leader
    await connection.execute(updateLeaderSql, [
      user_id,
      company_id,
      updatedAt,
      leader_id,
    ]);

    // 2. Remove old members
    await connection.execute(deleteLeaderUsersSql, [leader_id]);

    // 3. Insert latest members
    if (assigned_members.length > 0) {
      await Promise.all(
        assigned_members.map((member_id) =>
          connection.execute(insertLeaderUserSql, [v4(), leader_id, member_id]),
        ),
      );
    }

    await connection.commit();

    return {
      success: true,
      data: {
        leader_id,
        user_id,
        company_id,
        assigned_members,
      },
    };
  } catch (err) {
    await connection.rollback();

    console.error("updateLeader error:", err);
    throw err;
  } finally {
    connection.release();
  }
}

async function deleteLeader({ leader_id = "" }) {
  const connection = await getConnection();

  try {
    const sql = "";

    await connection.execute(sql, [leader_id]);
  } catch (err) {
    console.error("createLog error:", err);
    throw err;
  } finally {
    connection.release();
  }
}

async function deleteLeader({ leader_id = "" }) {
  const connection = await getConnection();

  try {
    const sql = deleteLeaderQuery();

    const [result] = await connection.execute(sql, [leader_id]);

    return {
      success: true,
      affectedRows: result.affectedRows,
      leader_id,
    };
  } catch (err) {
    console.error("deleteLeader error:", err);
    throw err;
  } finally {
    connection.release();
  }
}

module.exports = {
  assignLeader,
  getAllLeader,
  updateLeader,
  deleteLeader,
};
