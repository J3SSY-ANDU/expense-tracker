const { connectionPool } = require('./db')
const dotenv = require('dotenv').config({
  path:
    process.env.NODE_ENV === 'production'
      ? '.env.production'
      : '.env.development'
})
const { v4: uuidv4 } = require('uuid')

;(async () => {
  await connectionPool.query(`
            CREATE TABLE IF NOT EXISTS history (
                id VARCHAR(100) PRIMARY KEY NOT NULL,
                name VARCHAR(50) NOT NULL,
                user_id VARCHAR(100) NOT NULL,
                month INT NOT NULL,
                year INT NOT NULL,
                total_expenses DECIMAL(10,2) NOT NULL,
                FOREIGN KEY (user_id) REFERENCES users(id),
                UNIQUE (user_id, month, year)
            );
        `)
  console.log('Table created successfully!')
})()

/**
 * Creates a new month entry in the history table for a specific user.
 *
 * @async
 * @function createMonth
 * @param {string} name - The name of the month entry.
 * @param {string} user_id - The unique identifier of the user.
 * @param {number} month - The month (1-12) for the entry.
 * @param {number} year - The year for the entry.
 * @param {number} amount - The total expenses for the month.
 * @returns {Promise<Object|null>} The newly created month entry object, or null if creation failed.
 */
const createMonth = async (name, user_id, month, year, amount) => {
  try {
    const id = uuidv4()
    await connectionPool.query(
      `INSERT INTO history (id, name, user_id, month, year, total_expenses) VALUES (?, ?, ?, ?, ?, ?)`,
      [id, name, user_id, month, year, amount]
    )
    const newMonth = await getHistoryByMonthYear(user_id, month, year)
    if (!newMonth) {
      console.log(`Failed. Try again.`)
      return null
    }
    console.log('Month created successfully!')
    return newMonth
  } catch (err) {
    console.error(`Error creating month: ${err}`)
    return null
  }
}

/**
 * Retrieves a history record by its ID from the database.
 *
 * @async
 * @function getHistoryById
 * @param {string} id - The unique identifier of the history record.
 * @returns {Promise<Object|null>} The history record object if found, otherwise null.
 */
const getHistoryById = async id => {
  try {
    const [history] = await connectionPool.query(
      `SELECT * FROM history WHERE id = ?`,
      [id]
    )
    return history[0]
  } catch (err) {
    console.error(`Error getting history: ${err}`)
    return null
  }
}

/**
 * Retrieves the expense history for a specific user from the database.
 *
 * @async
 * @function
 * @param {string} user_id - The unique identifier of the user whose history is to be fetched.
 * @returns {Promise<Array<Object>>} A promise that resolves to an array of history records for the user.
 */
const getHistoryByUser = async user_id => {
  const [history] = await connectionPool.query(
    `SELECT * FROM history WHERE user_id = ?`,
    [user_id]
  )
  return history
}

/**
 * Retrieves the history record for a specific user, month, and year.
 *
 * @async
 * @function getHistoryByMonthYear
 * @param {string} user_id - The ID of the user whose history is to be retrieved.
 * @param {number} month - The month for which to retrieve the history (1-12).
 * @param {number} year - The year for which to retrieve the history (e.g., 2024).
 * @returns {Promise<Object|null>} The history record if found, or null if an error occurs or no record exists.
 */
const getHistoryByMonthYear = async (user_id, month, year) => {
  try {
    const [history] = await connectionPool.query(
      `SELECT * FROM history WHERE user_id = ? AND month = ? AND year = ?`,
      [user_id, month, year]
    )
    return history[0]
  } catch (err) {
    console.error(`Error getting month: ${err}`)
    return null
  }
}

/**
 * Updates the total expenses for a specific user's month and year in the history.
 * If the resulting total is less than or equal to zero, deletes the month entry.
 *
 * @async
 * @function updateMonth
 * @param {string} user_id - The ID of the user whose history is being updated.
 * @param {number|string} month - The month to update (1-12).
 * @param {number|string} year - The year to update (e.g., 2024).
 * @param {number|string} amount - The amount to add (can be negative to subtract).
 * @returns {Promise<Object|null>} The updated month history object, or null if update fails or entry is deleted.
 */
const updateMonth = async (user_id, month, year, amount) => {
  try {
    const monthlyHistory = await getHistoryByMonthYear(user_id, month, year)
    const newAmount =
      parseFloat(amount) + parseFloat(monthlyHistory.total_expenses)
    if (newAmount <= 0) {
      await deleteMonth(monthlyHistory.id)
      return null
    }
    await connectionPool.query(
      `UPDATE history SET total_expenses = ? WHERE user_id = ? AND month = ? AND year = ?`,
      [newAmount, user_id, month, year]
    )
    const updatedMonth = await getHistoryByMonthYear(user_id, month, year)
    if (parseFloat(updatedMonth.total_expenses) !== parseFloat(newAmount)) {
      console.log(`Failed. Try again.`)
      return null
    }
    console.log('Month updated successfully!')
    return updatedMonth
  } catch (err) {
    console.error(`Error updating month: ${err}`)
    return null
  }
}

/**
 * Deletes a month entry from the 'history' table by its ID.
 *
 * @async
 * @function
 * @param {string} id - The unique identifier of the month to delete.
 * @returns {Promise<void>} Resolves when the deletion is complete.
 * @throws Will log an error message if the deletion fails.
 */
const deleteMonth = async id => {
  try {
    await connectionPool.query(`DELETE FROM history WHERE id = ?`, [id])
    console.log('Month deleted successfully!')
  } catch (err) {
    console.error(`Error deleting month: ${err}`)
  }
}

module.exports = {
  getHistoryByMonthYear,
  getHistoryByUser,
  createMonth,
  updateMonth,
  getHistoryById
}
