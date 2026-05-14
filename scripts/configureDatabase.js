// db-setup-fixed.js
const fs = require("fs").promises;
const path = require("path");
const mysql = require("mysql2/promise");
const chalk = require("chalk");
const dotenv = require("dotenv");

// Load environment variables from the .env.development file
// const envPath = path.resolve(__dirname, "..", "env", ".env.development");
// dotenv.config({ path: envPath });

// Only for debugging: print the path and a few env vars
console.log(chalk.gray(`Using env file: ${envPath}`));
console.log(chalk.gray(`DB_HOST (raw env): ${process.env.DB_HOST}`));

// safe defaults and config
const config = {
  host: process.env.DB_HOST || "127.0.0.1", // fallback to IPv4 localhost
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  // optionally: port: Number(process.env.DB_PORT) || 3306,
};

console.log(chalk.blueBright("Effective DB config (host,user):"), {
  host: config.host,
  user: config.user,
});

const databaseScript = path.resolve(__dirname, "mysql", "database.sql");
const databaseName = process.env.DB_NAME;

async function checkDatabaseExistence() {
  let connection;
  try {
    console.log(chalk.blueBright(`Checking database...`));
    connection = await mysql.createConnection({
      ...config,
      multipleStatements: true,
    });

  } catch (error) {
    console.error(chalk.red(`Error checking database existence: ${error && error.stack ? error.stack : error}`));
    throw error; // re-throw if you want the caller to be aware
  } finally {
    // Close the initial connection if it was created
    if (connection && typeof connection.end === "function") {
      await connection.end();
    }
    console.log(chalk.yellowBright(`✓ HAPPY CODING!`));
  }
}

function countdown(number, delay) {
  setTimeout(() => {
    console.log(chalk.yellowBright.bold(`   ${number}   `)); // Adding extra spaces for padding
  }, delay);
}

async function main() {
  try {
    console.log(
      chalk.yellowBright(
        `⚠️ Make sure you've removed database from local database!`
      )
    );
    console.log(chalk.yellowBright(`Database setup starting in 3 second`));

    countdown(3, 0);
    countdown(2, 1000);
    countdown(1, 2000);

    setTimeout(async () => {
      try {
        await checkDatabaseExistence();
      } catch (err) {
        console.error(chalk.red("Database setup failed:", err && err.message));
        process.exitCode = 1;
      }
    }, 3000);

  } catch (error) {
    console.error(chalk.red(`Main function error: ${error.message}`));
  }
}

main();
