// services/log.service.js
const mysql = require("mysql2"); // <<-- required for mysql.format debug
const { v4: uuidv4 } = require("uuid");
const getConnection = require("../db/pool");
const { insertLogQuery } = require("../queries/logQueries");

async function createLog({
  company_id,
  subject_id = null,
  user_id = null,
  section = null,
  action = null,
  text = null,
  metadata = null,
}) {
  const connection = await getConnection();
  const logId = uuidv4();

  try {
    const sql = insertLogQuery();
    const createdAt = new Date();
    const metaStr = metadata ? JSON.stringify(metadata) : null;

    await connection.execute(sql, [
      logId,
      company_id,
      subject_id,
      user_id,
      section,
      action,
      text,
      metaStr,
      createdAt,
    ]);

    return {
      log_id: logId,
      company_id,
      subject_id,
      user_id,
      section,
      action,
      text,
      metadata,
      created_at: createdAt,
    };
  } catch (err) {
    console.error("createLog error:", err);
    throw err;
  } finally {
    connection.release();
  }
}

async function getLogs(filters = {}) {
  const connection = await getConnection();
  try {
    const {
      company_id,
      subject_id,
      serial_number, // NEW
      user_id,
      section,
      action,
      q,
      date_from,
      date_to,
      limit = 50,
      offset = 0,
    } = filters;

    const conditions = [];
    const values = [];

    if (company_id) {
      conditions.push("company_id = ?");
      values.push(String(company_id));
    }
    if (subject_id) {
      conditions.push("subject_id = ?");
      values.push(String(subject_id));
    }

    const hasSerial =
      typeof serial_number !== "undefined" &&
      serial_number !== null &&
      serial_number !== "";

    if (hasSerial) {
      
      conditions.push(`(
        JSON_EXTRACT(metadata, '$.serial_number') = ?
        OR metadata LIKE ?
      )`);
      values.push(String(serial_number));
      values.push(`%${String(serial_number)}%`);


      conditions.push(`action IN ('Update', 'BulkUpdate')`);
    }

    if (section && section !== "all") {
      conditions.push("section = ?");
      values.push(String(section));
    }
    if (action) {
      conditions.push("action = ?");
      values.push(String(action));
    }
    if (date_from) {
      conditions.push("created_at >= ?");
      values.push(date_from);
    }
    if (date_to) {
      conditions.push("created_at <= ?");
      values.push(date_to);
    }
    if (q) {
      conditions.push("(text LIKE ?)");
      values.push(`%${q}%`);
    }

    const where = conditions.length ? `WHERE ${conditions.join(" AND ")}` : "";


    const countSql = `SELECT COUNT(1) as total FROM \`Log\` ${where};`;
    const [countRows] = await connection.execute(countSql, values);
    const total = countRows[0]?.total ?? 0;

    const safeLimit = Number(limit) || 50;
    const safeOffset = Number(offset) || 0;


    const selectSql = `
      SELECT log_id, company_id, subject_id, user_id, section, action, text, metadata, created_at
      FROM \`Log\`
      ${where}
      ORDER BY created_at DESC
      ${hasSerial ? "" : `LIMIT ${safeLimit} OFFSET ${safeOffset}`};
    `;

    const [rows] = await connection.query(selectSql, values);

    const parsedRows = rows.map((r) => {
      let md = null;
      try {
        md = r.metadata ? JSON.parse(r.metadata) : null;
      } catch (e) {
        md = r.metadata;
      }
      return { ...r, metadata: md };
    });

    return { rows: parsedRows, total };
  } catch (err) {
    console.error("getLogs error:", err);
    throw err;
  } finally {
    connection.release();
  }
}

module.exports = {
  createLog,
  getLogs,
};
