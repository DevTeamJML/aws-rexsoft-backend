const mysql = require("mysql2/promise");
const dotenv = require("dotenv");
const path = require("path");

// const envPath = path.resolve(__dirname, "..", "env", ".env.development");
// dotenv.config({ path: envPath });

const pool = mysql.createPool({
  host: process.env.DB_HOST,
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_NAME,
  multipleStatements: true 
});

async function getConnection() {
    return await pool.getConnection();
  }

module.exports = getConnection;
