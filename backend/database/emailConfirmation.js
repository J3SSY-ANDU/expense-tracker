const { connectionPool } = require("./db");
const dotenv = require("dotenv").config();
const jwt = require("jsonwebtoken");
const { verifyUser } = require("./users");

(async () => {
  await connectionPool.query(`
        CREATE TABLE IF NOT EXISTS emailConfirmation (
            user_id VARCHAR(100) NOT NULL,
            token VARCHAR(255) NOT NULL,
            expires_at DATETIME NOT NULL, 
            PRIMARY KEY (user_id),
            FOREIGN KEY (user_id) REFERENCES users(id)
        );
    `);
  console.log("Table created successfully!");
})();

const createEmailConfirmation = async (user_id) => {
  try {
    const token = jwt.sign({ user_id }, process.env.TOKEN_SECRET, {
      expiresIn: "30m",
    });
    const expires_at = new Date();
    expires_at.setMinutes(expires_at.getMinutes() + 30);
    await connectionPool.query(
      `INSERT INTO emailConfirmation (user_id, token, expires_at) VALUES (?, ?, ?)`,
      [user_id, token, expires_at]
    );
    console.log("Email confirmation created successfully!");
  } catch (err) {
    console.error(`Error creating email confirmation: ${err}`);
    return null;
  }
};

const getEmailConfirmationToken = async (user_id) => {
  try {
    const [result] = await connectionPool.query(
      `
            SELECT * FROM emailConfirmation WHERE user_id = ?`,
      [user_id]
    );
    if (result.length === 0) {
      return null;
    }
    return result[0].token;
  } catch (err) {
    console.error(`Error getting email confirmation token: ${err}`);
    return null;
  }
};

const verifyEmailConfirmation = async (token) => {
  try {
    const decoded = jwt.verify(token, process.env.TOKEN_SECRET);
    const user_id = decoded.user_id;
    const [result] = await connectionPool.query(
      `SELECT * FROM emailConfirmation WHERE user_id = ? AND token = ?`,
      [user_id, token]
    );
    if (result.length === 0) {
      return null;
    }
    const confirmation = result[0];
    if (confirmation.expires_at < new Date()) {
      return null;
    }
    await verifyUser(user_id);
    await deleteEmailConfirmation(user_id);
    console.log("Email confirmation verified successfully!");
    return user_id;
  } catch (err) {
    console.error(`Error verifying email confirmation: ${err}`);
    return null;
  }
};

const deleteEmailConfirmation = async (user_id) => {
  try {
    if ((await getEmailConfirmationToken(user_id)) === null) {
      return;
    }
    await connectionPool.query(
      `DELETE FROM emailConfirmation WHERE user_id = ?`,
      [user_id]
    );
    console.log("Email confirmation deleted successfully!");
  } catch (err) {
    console.error(`Error deleting email confirmation: ${err}`);
  }
};

module.exports = {
  createEmailConfirmation,
  verifyEmailConfirmation,
  getEmailConfirmationToken,
  deleteEmailConfirmation,
};
