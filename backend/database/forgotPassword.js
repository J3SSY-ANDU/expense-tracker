const { decode } = require('punycode')
const { connectionPool } = require('./db')
const dotenv = require('dotenv').config({
  path:
    process.env.NODE_ENV === 'production'
      ? '.env.production'
      : '.env.development'
})
const jwt = require('jsonwebtoken')
const { updatePassword, getUserByEmail } = require('./users')

;(async () => {
  await connectionPool.query(`
          CREATE TABLE IF NOT EXISTS forgot_password (
              email VARCHAR(100) NOT NULL,
              token VARCHAR(255) NOT NULL,
              expires_at DATETIME NOT NULL, 
              PRIMARY KEY (email),
              FOREIGN KEY (email) REFERENCES users(email)
          );
      `)
  console.log('Table created successfully!')
})()

/**
 * Creates a forgot password token for the given email, stores it in the database,
 * and sets an expiration time of 30 minutes.
 *
 * @async
 * @function createForgotPassword
 * @param {string} email - The email address for which to create the forgot password token.
 * @returns {Promise<void>} Resolves when the token is successfully created and stored.
 * @throws Will log an error if token creation or database insertion fails.
 */
const createForgotPassword = async email => {
  try {
    const token = jwt.sign({ email }, process.env.TOKEN_SECRET, {
      expiresIn: '30m'
    })
    const expires_at = new Date()
    expires_at.setMinutes(expires_at.getMinutes() + 30)
    await connectionPool.query(
      `
            INSERT INTO forgot_password (email, token, expires_at) VALUES (?, ?, ?)
            `,
      [email, token, expires_at]
    )
    console.log(`Forgot password created successfully!`)
  } catch (err) {
    console.error(`Error creating forgot password: ${err}`)
  }
}

/**
 * Retrieves the forgot password token associated with the given email address.
 *
 * @async
 * @function
 * @param {string} email - The email address to look up the forgot password token for.
 * @returns {Promise<string|null>} The forgot password token if found, or null if not found or on error.
 */
const getForgotPasswordToken = async email => {
  try {
    const [result] = await connectionPool.query(
      `
            SELECT token FROM forgot_password WHERE email = ?
            `,
      [email]
    )
    if (result.length === 0) {
      return null
    }
    return result[0].token
  } catch (err) {
    console.error(`Error getting forgot password token: ${err}`)
    return null
  }
}

/**
 * Changes the user's password using a forgot password token.
 *
 * Verifies the provided token, checks its validity and expiration,
 * retrieves the user by email, updates the user's password, and
 * deletes the forgot password entry.
 *
 * @async
 * @param {string} token - The JWT token sent to the user's email for password reset.
 * @param {string} new_password - The new password to set for the user.
 * @returns {Promise<Object|null|undefined>} The updated user object if successful, null if token is expired or user not found, or undefined if token is invalid.
 */
const changeForgotPassword = async (token, new_password) => {
  try {
    const decoded = jwt.verify(token, process.env.TOKEN_SECRET)
    const email = decoded.email
    const [result] = await connectionPool.query(
      `
          SELECT * FROM forgot_password WHERE email = ? AND token = ?
          `,
      [email, token]
    )
    if (result.length === 0) {
      return
    }
    const forgotPassword = result[0]
    if (forgotPassword.expires_at < new Date()) {
      return null
    }
    const user = await getUserByEmail(email)
    if (!user) {
      console.log('User not found!')
      return null
    }
    await updatePassword(user.id, new_password)
    await deleteForgotPassword(email)
    return user
  } catch (err) {
    console.error(`Error changing forgot password: ${err}`)
    return null
  }
}

/**
 * Deletes the forgot password token associated with the given email from the database.
 *
 * @async
 * @function deleteForgotPassword
 * @param {string} email - The email address for which to delete the forgot password token.
 * @returns {Promise<void>} Resolves when the token is deleted or if no token exists.
 * @throws Will log an error to the console if the database operation fails.
 */
const deleteForgotPassword = async email => {
  try {
    if ((await getForgotPasswordToken(email)) === null) {
      return
    }
    await connectionPool.query(
      `
          DELETE FROM forgot_password WHERE email = ?
          `,
      [email]
    )
  } catch (err) {
    console.error(`Error deleting forgot password: ${err}`)
  }
}

module.exports = {
  createForgotPassword,
  getForgotPasswordToken,
  changeForgotPassword
}
