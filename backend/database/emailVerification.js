const { connectionPool } = require('./db')
const dotenv = require('dotenv').config({
  path:
    process.env.NODE_ENV === 'production'
      ? '.env.production'
      : '.env.development'
})
const crypto = require('crypto');

;(async () => {
  await connectionPool.query(`
        CREATE TABLE IF NOT EXISTS emailVerification (
            token VARCHAR(512) PRIMARY KEY NOT NULL,
            email VARCHAR(255) NOT NULL,
            created_date DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
            expires_at DATETIME NOT NULL
        );
    `)
  console.log('Table created successfully!')
})()

const getEmailVerificationToken = async email => {
  const [verification] = await connectionPool.query(
    `SELECT token FROM emailVerification WHERE email = ?`,
    [email]
  )
  if (verification.length === 0) {
    console.log('No token found for this email.')
    return null // No token found for the email
  }
  return verification[0].token
}

const validateEmailVerificationToken = async token => {
  const [result] = await connectionPool.query(
    `SELECT email FROM emailVerification WHERE token = ? AND expires_at > NOW()`,
    [token]
  )
  if (result.length === 0) {
    console.log('Invalid or expired token.')
    return null // Token is invalid or expired
  }
  return result[0].email
}

const createEmailVerificationToken = async email => {
  const existingToken = await getEmailVerificationToken(email);
  if (existingToken) {
    console.log('Token already exists for this email, deleting the old token.')
    await deleteEmailVerificationToken(existingToken)
  }
  const token = encodeURIComponent(crypto.randomBytes(48).toString('base64url')); // 64 chars, url-safe
  const expires_at = new Date(Date.now() + 15 * 60 * 1000); // 15 minutes from now

  await connectionPool.query(
    `INSERT INTO emailVerification (token, email, expires_at) VALUES (?, ?, ?)`,
    [token, email, expires_at]
  );
  return token;
};

const deleteEmailVerificationToken = async token => {
  await connectionPool.query(
      `DELETE FROM emailVerification WHERE token = ?`,
      [token]
    );
  console.log('Email verification token deleted successfully!')
}

module.exports = {
  getEmailVerificationToken,
  validateEmailVerificationToken,
  createEmailVerificationToken,
  deleteEmailVerificationToken
}
