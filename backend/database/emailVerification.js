const { connectionPool } = require('./db')
const dotenv = require('dotenv').config({
  path:
    process.env.NODE_ENV === 'production'
      ? '.env.production'
      : '.env.development'
})
const crypto = require('crypto');
const cron = require('node-cron');

;(async () => {
  await connectionPool.query(`
        CREATE TABLE IF NOT EXISTS email_verification (
            token VARCHAR(512) PRIMARY KEY NOT NULL,
            email VARCHAR(255) NOT NULL,
            created_date DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
            expires_at DATETIME NOT NULL,
            valid BOOLEAN NOT NULL DEFAULT TRUE,
            FOREIGN KEY (email) REFERENCES users(email) ON DELETE CASCADE
        );
    `)
  console.log('Table created successfully!')
})()

const getEmailVerificationToken = async email => {
  const [verification] = await connectionPool.query(
    `SELECT token FROM email_verification WHERE email = ?`,
    [email]
  )
  if (verification.length === 0) {
    console.log('No token found for this email.')
    return null // No token found for the email
  }
  return verification[0].token
}

const getEmailByVerificationToken = async token => {
  const [result] = await connectionPool.query(
    `SELECT email FROM email_verification WHERE token = ?`,
    [token]
  )
  if (result.length === 0) {
    console.log('No email found for this token.')
    return null // No email found for the token
  }
  return result[0].email
}

const invalidateTokensByEmail = async (email, connection) => {
  await (connection || connectionPool).query(
    `UPDATE email_verification SET valid = FALSE WHERE email = ?`,
    [email]
  );
  console.log('All tokens for this email invalidated.');
};

const validateEmailVerificationToken = async token => {
  const [result] = await connectionPool.query(
    `SELECT email FROM email_verification WHERE token = ? AND expires_at > NOW() AND valid = TRUE`,
    [token]
  )
  if (result.length === 0) {
    console.log('Invalid or expired token.')
    return null // Token is invalid or expired
  }
  return result[0].email
}

const createEmailVerificationToken = async email => {
  await invalidateTokensByEmail(email); // Invalidate existing tokens for this email
  const token = encodeURIComponent(crypto.randomBytes(48).toString('base64url')); // 64 chars, url-safe
  const expires_at = new Date(Date.now() + 15 * 60 * 1000); // 15 minutes from now
  
  await connectionPool.query(
    `INSERT INTO email_verification (token, email, expires_at) VALUES (?, ?, ?)`,
    [token, email, expires_at]
  );
  return token;
};

const cleanupEmailVerificationTokens = async () => {
  await connectionPool.query(
    `DELETE FROM email_verification WHERE created_date < NOW() - INTERVAL 1 DAY`
  );
  console.log('Old email verification tokens deleted.');
};

// Use node-cron to schedule every night at 2 AM
cron.schedule('0 2 * * *', cleanupEmailVerificationTokens);

module.exports = {
  getEmailVerificationToken,
  getEmailByVerificationToken,
  validateEmailVerificationToken,
  createEmailVerificationToken,
  invalidateTokensByEmail,
}
