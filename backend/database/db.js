const mysql = require("mysql2/promise");
const dotenv = require("dotenv").config({
  path:
    process.env.NODE_ENV === "production"
      ? ".env.production"
      : ".env.development",
});

const connectionPool = mysql.createPool({
  host: process.env.MYSQL_HOST,
  port: process.env.MYSQL_PORT,
  user: process.env.MYSQL_USER,
  password: process.env.MYSQL_PASSWORD,
  database: process.env.MYSQL_DB,
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0,
});

console.log("Connection pool created!");

const closeConnection = async () => {
  try {
    await connectionPool.end();
    console.log("Connection closed.");
  } catch (err) {
    console.error(`Error closing connection: ${err}`);
  }
};

module.exports = { connectionPool, closeConnection };
