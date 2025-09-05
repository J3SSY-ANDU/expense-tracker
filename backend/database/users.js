const { connectionPool } = require('./db')
const dotenv = require('dotenv').config({
  path:
    process.env.NODE_ENV === 'production'
      ? '.env.production'
      : '.env.development'
})
const bcrypt = require('bcrypt')
const { v4: uuidv4 } = require('uuid')
const { deleteAccountEmail } = require('../emails')

;(async () => {
  await connectionPool.query(`
        CREATE TABLE IF NOT EXISTS users (
            id VARCHAR(100) PRIMARY KEY NOT NULL,
            firstname VARCHAR(50) NOT NULL,
            lastname VARCHAR(50) NOT NULL,
            fullname VARCHAR(50) NOT NULL,
            email VARCHAR(255) NOT NULL UNIQUE,
            password VARCHAR(255) NOT NULL,
            is_verified INT NOT NULL DEFAULT 0
        );
    `)
  console.log('Table created successfully!')
})()

const getAllUsers = async () => {
  const [users] = await connectionPool.query(`SELECT * FROM users`)
  return users
}

/**
 * Creates a new user in the database.
 *
 * @async
 * @function
 * @param {string} firstname - The user's first name.
 * @param {string} lastname - The user's last name.
 * @param {string} email - The user's email address.
 * @param {string} password - The user's hashed password.
 * @returns {Promise<Object>} The newly created user object.
 * @throws {Error} If a user with the given email already exists ('USER_EXISTS').
 * @throws {Error} If user creation fails ('USER_CREATION_FAILED').
 */
const createUser = async (firstname, lastname, email, password) => {
  const userByEmail = await getUserByEmail(email)
  if (userByEmail) {
    console.log('User already exists.')
    throw new Error('USER_EXISTS')
  }
  const id = uuidv4() // Generate a unique ID
  const fullname = `${firstname} ${lastname}`
  await connectionPool.query(
    `INSERT INTO users (id, firstname, lastname, fullname, email, password) VALUES (?, ?, ?, ?, ?, ?)`,
    [id, firstname, lastname, fullname, email, password]
  )
  const user = await getUserById(id)
  if (!user) {
    console.log(`Failed. Try again.`)
    throw new Error('USER_CREATION_FAILED')
  }
  console.log('User created successfully!')
  return user
}

/**
 * Retrieves a user from the database by their unique ID.
 *
 * @async
 * @function
 * @param {string} id - The unique identifier of the user.
 * @returns {Promise<Object|null>} The user object if found, otherwise null.
 */
const getUserById = async id => {
  const [user] = await connectionPool.query(
    `SELECT * FROM users WHERE id = ?`,
    [id]
  )
  if (!user) return null
  return user[0]
}

/**
 * Retrieves a user from the database by their email address.
 *
 * @async
 * @function
 * @param {string} email - The email address of the user to retrieve.
 * @returns {Promise<Object|null>} The user object if found, otherwise null.
 */
const getUserByEmail = async email => {
  const [user] = await connectionPool.query(
    `SELECT * FROM users WHERE email = ?`,
    [email]
  )
  if (!user) return null
  return user[0]
}

/**
 * Authenticates a user by email and password.
 *
 * @async
 * @param {string} email - The email address of the user to authenticate.
 * @param {string} password - The plaintext password to verify.
 * @returns {Promise<Object>} Resolves with the user object if authentication is successful.
 * @throws {Error} Throws 'USER_NOT_FOUND' if the user does not exist.
 * @throws {Error} Throws 'INVALID_CREDENTIALS' if the password is incorrect.
 */
const authenticateUser = async (email, password) => {
  const user = await getUserByEmail(email)
  if (!user) {
    console.log('User not found.')
    throw new Error('USER_NOT_FOUND')
  }
  const match = await bcrypt.compare(password, user.password)
  if (match) {
    return user
  } else {
    console.log('Invalid credentials.')
    throw new Error('INVALID_CREDENTIALS')
  }
}

/**
 * Deletes a user and all associated data from the database.
 *
 * This function performs the following steps:
 * 1. Retrieves the user by ID. Throws an error if the user does not exist.
 * 2. Begins a database transaction.
 * 3. Deletes all expenses, categories, and history records associated with the user.
 * 4. Deletes the user record from the users table.
 * 5. Sends a deletion email to the user's email address.
 * 6. Commits the transaction if all operations succeed.
 * 7. Rolls back the transaction and releases the connection if any operation fails.
 *
 * @async
 * @function deleteUser
 * @param {string} id - The unique identifier of the user to delete.
 * @returns {Promise<boolean>} Returns true if the user was successfully deleted.
 * @throws {Error} Throws an error if the user is not found, deletion fails, or any database/email operation fails.
 */
const deleteUser = async id => {
  let connection
  try {
    const user = await getUserById(id)
    if (!user) throw new Error('USER_NOT_FOUND')
    connection = await connectionPool.getConnection()
    await connection.beginTransaction()

    await connection.query(`DELETE FROM expenses WHERE user_id = ?`, [id])
    await connection.query(`DELETE FROM categories WHERE user_id = ?`, [id])
    await connection.query(`DELETE FROM history WHERE user_id = ?`, [id])
    await connection.query(`DELETE FROM budgets WHERE user_id = ?`, [id])
    const [deleteResult] = await connection.query(
      `DELETE FROM users WHERE id = ?`,
      [id]
    )
    if (deleteResult.affectedRows === 0) throw new Error('USER_DELETION_FAILED')

    await deleteAccountEmail(user.firstname, user.email) // Throw error if email deletion fails

    await connection.commit()
    connection.release()
    return true
  } catch (error) {
    if (connection) {
      await connection.rollback()
      connection.release()
    }
    throw error
  } finally {
    if (connection) connection.release()
  }
}

/**
 * Updates the password for a user with the given ID.
 *
 * @async
 * @function
 * @param {string} id - The unique identifier of the user whose password is to be updated.
 * @param {string} newPassword - The new password to set for the user.
 * @returns {Promise<Object|null>} The updated user object if the password was updated successfully, or null if the update failed.
 */
const updatePassword = async (id, newPassword) => {
  await connectionPool.query(`UPDATE users SET password = ? WHERE id = ?`, [
    newPassword,
    id
  ])

  const user = await getUserById(id)
  if (newPassword !== user.password) {
    console.log(`Password update failed.`)
    return null
  }
  console.log(`Password updated successfully!`)
  return user
}

/**
 * Updates the first name and last name of a user in the database.
 *
 * @async
 * @function updateName
 * @param {string} id - The unique identifier of the user to update.
 * @param {string} newFirstname - The new first name for the user.
 * @param {string} newLastname - The new last name for the user.
 * @returns {Promise<Object|null>} The updated user object if successful, or null if the update failed.
 */
const updateName = async (id, newFirstname, newLastname) => {
  await connectionPool.query(
    `UPDATE users SET firstname = ?, lastname = ?, fullname = ? WHERE id = ?`,
    [newFirstname, newLastname, `${newFirstname} ${newLastname}`, id]
  )
  const user = await getUserById(id)
  if (newFirstname !== user.firstname || newLastname !== user.lastname) {
    console.log(`Failed to update name. Try again.`)
    return null
  }
  console.log(`Name updated successfully!`)
  return user
}

/**
 * Checks if a user with the given ID is verified.
 *
 * @async
 * @param {string} id - The ID of the user to check.
 * @returns {Promise<boolean>} Returns true if the user is verified, otherwise false.
 */
const userIsVerified = async id => {
  const [user] = await connectionPool.query(
    `
      SELECT is_verified FROM users WHERE id = ?`,
    [id]
  )
  if (!user[0].is_verified) {
    return false
  }
  return true
}

/**
 * Marks a user as verified in the database by setting the `is_verified` field to 1.
 *
 * @async
 * @param {string} id - The unique identifier of the user to verify.
 * @param {object} [connection] - Optional database connection object. If not provided, a default connection pool is used.
 * @returns {Promise<void>} Resolves when the user has been verified.
 */
const verifyUser = async (id, connection) => {
  await (connection || connectionPool).query(
    `
      UPDATE users SET is_verified = 1 WHERE id = ?`,
    [id]
  )
  console.log(`User verified successfully!`)
}

module.exports = {
  getAllUsers,
  createUser,
  getUserById,
  getUserByEmail,
  authenticateUser,
  verifyUser,
  userIsVerified,
  deleteUser,
  updatePassword,
  updateName
}
