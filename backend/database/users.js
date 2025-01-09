const { connectionPool } = require("./db");
const dotenv = require("dotenv").config();
const bcrypt = require("bcrypt");
const { v4: uuidv4 } = require("uuid");

(async () => {
  await connectionPool.query(`
        CREATE TABLE IF NOT EXISTS users (
            id VARCHAR(100) PRIMARY KEY NOT NULL,
            firstname VARCHAR(25) NOT NULL,
            lastname VARCHAR(25) NOT NULL,
            fullname VARCHAR(50) NOT NULL,
            email VARCHAR(50) NOT NULL UNIQUE,
            password VARCHAR(255) NOT NULL,
            is_verified INT NOT NULL DEFAULT 0
        );
    `);
  console.log("Table created successfully!");
})();

const createUser = async (firstname, lastname, email, password) => {
  try {
    const userByEmail = await getUserByEmail(email);
    if (userByEmail) {
      console.log("User already exists.");
      return null;
    }
    const id = uuidv4(); // Generate a unique ID
    const fullname = `${firstname} ${lastname}`;
    await connectionPool.query(
      `INSERT INTO users (id, firstname, lastname, fullname, email, password) VALUES (?, ?, ?, ?, ?, ?)`,
      [id, firstname, lastname, fullname, email, password]
    );
    const user = await getUserById(id);
    if (!user) {
      console.log(`Failed. Try again.`);
      return null;
    }
    console.log("User created successfully!");
    return user;
  } catch (err) {
    console.error(`Error creating user: ${err}`);
    return null;
  }
};

const getUserById = async (id) => {
  try {
    const [user] = await connectionPool.query(
      `SELECT * FROM users WHERE id = ?`,
      [id]
    );
    if (!user) return null;
    return user[0];
  } catch (err) {
    console.error(`Error getting user by id: ${err}`);
  }
};

const getUserByEmail = async (email) => {
  try {
    const [user] = await connectionPool.query(
      `SELECT * FROM users WHERE email = ?`,
      [email]
    );
    if (!user) return null;
    return user[0];
  } catch (err) {
    console.error(`Error getting user by email: ${err}`);
    return null;
  }
};

const authenticateUser = async (email, password) => {
  try {
    const user = await getUserByEmail(email);
    if (!user) {
      console.log("User not found.");
      return null;
    }
    const match = await bcrypt.compare(password, user.password);
    if (match) {
      return user;
    } else {
      console.log("Invalid credentials.");
      return null;
    }
  } catch (err) {
    console.error(`Error authenticating user: ${err}`);
    return null;
  }
};

const deleteUser = async (id) => {
  try {
    await connectionPool.query(`DELETE FROM users WHERE id = ?`, [id]);
    console.log(`User deleted successfully!`);
    return true;
  } catch (err) {
    console.error(`Error deleting user: ${err}`);
    return false;
  }
};

const getUserPassword = async (id) => {
  try {
    const [user] = await connectionPool.query(
      `SELECT password FROM users WHERE id = ?`,
      [id]
    );
    if (!user) return null;
    return user[0].password;
  } catch (err) {
    console.error(`Error getting user password: ${err}`);
    return null;
  }
}

const updatePassword = async (id, newPassword) => {
  try {
    await connectionPool.query(`UPDATE users SET password = ? WHERE id = ?`, [
      newPassword,
      id,
    ]);

    const user = await getUserById(id);
    if (newPassword !== user.password) {
      console.log(`Failed to update password. Try again.`);
      return null;
    }
    console.log(`Password updated successfully!`);
    return user;
  } catch (err) {
    console.error(`Error updating user: ${err}`);
    return null;
  }
};

const updateName = async (id, newFirstname, newLastname) => {
  try {
    await connectionPool.query(
      `UPDATE users SET firstname = ?, lastname = ?, fullname = ? WHERE id = ?`,
      [newFirstname, newLastname, `${newFirstname} ${newLastname}`, id]
    );
    const user = await getUserById(id);
    if (newFirstname !== user.firstname || newLastname !== user.lastname) {
      console.log(`Failed to update name. Try again.`);
      return null;
    }
    console.log(`Name updated successfully!`);
    return user;
  } catch (err) {
    console.error(`Error updating user: ${err}`);
    return null;
  }
};

const userIsVerified = async (id) => {
  try {
    const [user] = await connectionPool.query(
      `
      SELECT is_verified FROM users WHERE id = ?`,
      [id]
    );
    if (!user[0].is_verified) {
      return false;
    }
    return true;
  } catch (err) {
    console.error(`Error checking if user is verified: ${err}`);
    return false;
  }
};

const verifyUser = async (id) => {
  try {
    await connectionPool.query(
      `
      UPDATE users SET is_verified = 1 WHERE id = ?`,
      [id]
    );
    console.log(`User verified successfully!`);
  } catch (err) {
    console.error(`Error verifying user: ${err}`);
  }
};

module.exports = {
  createUser,
  getUserById,
  getUserByEmail,
  authenticateUser,
  verifyUser,
  userIsVerified,
  deleteUser,
  updatePassword,
  updateName
};
