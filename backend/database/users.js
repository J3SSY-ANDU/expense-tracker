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

const getUserById = async id => {
  const [user] = await connectionPool.query(
    `SELECT * FROM users WHERE id = ?`,
    [id]
  )
  if (!user) return null
  return user[0]
}

const getUserByEmail = async email => {
  const [user] = await connectionPool.query(
    `SELECT * FROM users WHERE email = ?`,
    [email]
  )
  if (!user) return null
  return user[0]
}

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

const deleteUser = async id => {
  try {
    const user = await getUserById(id)
    if (!user) throw new Error('USER_NOT_FOUND')
    let connection
    connection = await connectionPool.getConnection()
    await connection.beginTransaction()

    await connection.query(`DELETE FROM expenses WHERE user_id = ?`, [id])
    await connection.query(`DELETE FROM categories WHERE user_id = ?`, [id])
    await connection.query(`DELETE FROM history WHERE user_id = ?`, [id])
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
  }
}

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

const verifyUser = async id => {
  await connectionPool.query(
    `
      UPDATE users SET is_verified = 1 WHERE id = ?`,
    [id]
  )
  console.log(`User verified successfully!`)
}

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
}
