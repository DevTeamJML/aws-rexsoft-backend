const mysql = require("mysql2/promise");

let pool;

function createPool() {
  return mysql.createPool({
    host: process.env.DB_HOST,
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    database: process.env.DB_NAME,
    multipleStatements: true,
    waitForConnections: true,
    connectionLimit: 15,
    queueLimit: 50,
  });
}

async function getConnection(retries = 5, delay = 2000) {
  try {
    if (!pool) {
      pool = createPool();
    }

    const connection = await pool.getConnection();
    return connection;

  } catch (err) {
    console.error("DB error:", err.code);

    if (
      err.code === "PROTOCOL_CONNECTION_LOST" ||
      err.code === "ECONNRESET" ||
      err.code === "ECONNREFUSED"
    ) {
      console.log("Recreating pool...");
      pool = createPool();
    }

    if (retries > 0) {
      console.log(`Retrying DB... (${retries})`);
      await new Promise((res) => setTimeout(res, delay));
      return getConnection(retries - 1, delay);
    }

    throw err;
  }
}

module.exports = getConnection;