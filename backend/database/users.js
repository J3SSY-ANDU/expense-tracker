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
  } catch (err) {
    console.error(`Error deleting user: ${err}`);
  }
};

const updateUser = async (id, columnName, value) => {
  try {
    const allowedColumnNames = ["firstname", "lastname", "email", "password"];
    if (!allowedColumnNames.includes(columnName)) {
      throw new Error(`Invalid parameter: ${columnName}`);
    }
    await connectionPool.query(
      `UPDATE users SET ${columnName} = ? WHERE id = ?`,
      [value, id]
    );  
    if (columnName === "firstname" || columnName === "lastname") {
      const user = await getUserById(id);
      const fullname = `${user[0].firstname} ${user[0].lastname}`;
      await connectionPool.query(`UPDATE users SET fullname = ? WHERE id = ?`, [
        fullname,
        id,
      ]);
    }
    console.log(`User updated successfully!`);
  } catch (err) {
    console.error(`Error updating user: ${err}`);
  }
};

const userIsVerified = async (id) => {
  try {
    const [user] = await connectionPool.query(`
      SELECT is_verified FROM users WHERE id = ?`, 
      [id]
    )
    if (!user[0].is_verified) {
      return false;
    }
    return true;
  } catch (err) {
    console.error(`Error checking if user is verified: ${err}`);
    return false;
  }
}

const verifyUser = async (id) => {
  try {
    await connectionPool.query(`
      UPDATE users SET is_verified = 1 WHERE id = ?`,
       [id]
      )
    console.log(`User verified successfully!`);
  } catch (err) {
    console.error(`Error verifying user: ${err}`);
  }
}

module.exports = {
  createUser,
  getUserById,
  getUserByEmail,
  authenticateUser,
  verifyUser,
  userIsVerified,
  deleteUser,
  updateUser,
};
