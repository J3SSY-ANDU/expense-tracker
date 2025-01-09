const mysql = require("mysql2/promise");
const dotenv = require("dotenv").config();

const connectionPool = mysql.createPool({
  host: process.env.MYSQL_HOST,
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
