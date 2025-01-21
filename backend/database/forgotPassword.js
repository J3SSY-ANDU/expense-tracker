const { decode } = require("punycode");
const { connectionPool } = require("./db");
const dotenv = require("dotenv").config();
const jwt = require("jsonwebtoken");
const { updatePassword, getUserByEmail } = require("./users");

(async () => {
  await connectionPool.query(`
          CREATE TABLE IF NOT EXISTS forgotPassword (
              email VARCHAR(100) NOT NULL,
              token VARCHAR(255) NOT NULL,
              expires_at DATETIME NOT NULL, 
              PRIMARY KEY (email),
              FOREIGN KEY (email) REFERENCES users(email)
          );
      `);
  console.log("Table created successfully!");
})();

const createForgotPassword = async (email) => {
  try {
    const token = jwt.sign({ email }, process.env.TOKEN_SECRET, {
      expiresIn: "30m",
    });
    const expires_at = new Date();
    expires_at.setMinutes(expires_at.getMinutes() + 30);
    await connectionPool.query(
      `
            INSERT INTO forgotPassword (email, token, expires_at) VALUES (?, ?, ?)
            `,
      [email, token, expires_at]
    );
    console.log(`Forgot password created successfully!`);
  } catch (err) {
    console.error(`Error creating forgot password: ${err}`);
  }
};

const getForgotPasswordToken = async (email) => {
  try {
    const [result] = await connectionPool.query(
      `
            SELECT token FROM forgotPassword WHERE email = ?
            `,
      [email]
    );
    if (result.length === 0) {
      return null;
    }
    return result[0].token;
  } catch (err) {
    console.error(`Error getting forgot password token: ${err}`);
    return null;
  }
};

const changeForgotPassword = async (token, new_password) => {
  try {
    const decoded = jwt.verify(token, process.env.TOKEN_SECRET);
    const email = decoded.email;
    const [result] = await connectionPool.query(
      `
          SELECT * FROM forgotPassword WHERE email = ? AND token = ?
          `,
      [email, token]
    );
    if (result.length === 0) {
      return;
    }
    const forgotPassword = result[0];
    if (forgotPassword.expires_at < new Date()) {
      return null;
    }
    const user = await getUserByEmail(email);
    if (!user) {
      console.log("User not found!");
      return null;
    }
    await updatePassword(user.id, new_password);
    await deleteForgotPassword(email);
    return user;
  } catch (err) {
    console.error(`Error changing forgot password: ${err}`);
    return null;
  }
};

const deleteForgotPassword = async (email) => {
  try {
    if ((await getForgotPasswordToken(email)) === null) {
      return;
    }
    await connectionPool.query(
      `
          DELETE FROM forgotPassword WHERE email = ?
          `,
      [email]
    );
  } catch (err) {
    console.error(`Error deleting forgot password: ${err}`);
  }
};

module.exports = {
  createForgotPassword,
  getForgotPasswordToken,
  changeForgotPassword,
};
