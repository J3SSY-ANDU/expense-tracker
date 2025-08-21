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
            CREATE TABLE IF NOT EXISTS budgets (
                id VARCHAR(100) PRIMARY KEY NOT NULL,
                user_id VARCHAR(100) NOT NULL,
                month INT NOT NULL,
                year INT NOT NULL,
                total_income DECIMAL(10,2) NOT NULL,
                total_expenses DECIMAL(10,2) NOT NULL,
                FOREIGN KEY (user_id) REFERENCES users(id),
                UNIQUE (user_id, month, year)
            );
        `)
  console.log('Table created successfully!')
})()

/**
 * Creates a new budget entry in the database for a specific user and month/year.
 *
 * @async
 * @function
 * @param {string} user_id - The ID of the user for whom the budget is being created.
 * @param {number} month - The month for the budget (1-12).
 * @param {number} year - The year for the budget (e.g., 2024).
 * @param {number} [total_income=0] - The total income for the budget (default is 0).
 * @param {number} [total_expenses=0] - The total expenses for the budget (default is 0).
 * @param {object} [connection] - Optional database connection object. If not provided, a default connection pool is used.
 * @returns {Promise<object|null>} The created budget object if successful, or null if creation failed.
 */
const createBudget = async (
  user_id,
  month,
  year,
  total_income = 0,
  total_expenses = 0,
  connection
) => {
  const id = uuidv4()
  await (connection || connectionPool).query(
    `INSERT INTO budgets (id, user_id, month, year, total_income, total_expenses) VALUES (?, ?, ?, ?, ?, ?)`,
    [id, user_id, month, year, total_income, total_expenses]
  )
  const budget = await getBudgetById(id, connection)
  if (!budget) {
    console.log(`Failed to create budget. Try again.`)
    return null
  }
  console.log('Budget created successfully!')
  return budget
}

/**
 * Retrieves a budget record by its ID from the database.
 *
 * @async
 * @function getBudgetById
 * @param {number|string} id - The unique identifier of the budget to retrieve.
 * @param {object} [connection] - Optional. The database connection to use. If not provided, a default connection pool is used.
 * @returns {Promise<object|null>} A promise that resolves to the budget object if found, or null if not found.
 */
const getBudgetById = async (id, connection) => {
  const [rows] = await (connection || connectionPool).query(
    `SELECT * FROM budgets WHERE id = ?`,
    [id]
  )
  return rows[0] || null
}

/**
 * Retrieves a budget record for a specific user, month, and year.
 *
 * @async
 * @function
 * @param {number|string} user_id - The ID of the user whose budget is being retrieved.
 * @param {number} month - The month for which the budget is requested (1-12).
 * @param {number} year - The year for which the budget is requested (e.g., 2024).
 * @returns {Promise<Object|null>} The budget record if found, otherwise null.
 */
const getBudgetByUserMonthYear = async (user_id, month, year) => {
  const [rows] = await connectionPool.query(
    `SELECT * FROM budgets WHERE user_id = ? AND month = ? AND year = ?`,
    [user_id, month, year]
  )
  return rows[0] || null
}

/**
 * Updates the total income of a budget by its ID.
 *
 * @async
 * @param {number|string} id - The unique identifier of the budget to update.
 * @param {number} total_income - The new total income value to set for the budget.
 * @returns {Promise<Object|null>} The updated budget object if successful, or null if the update failed.
 */
const updateBudgetIncome = async (id, total_income) => {
  const [result] = await connectionPool.query(
    `UPDATE budgets SET total_income = ? WHERE id = ?`,
    [total_income, id]
  )
  if (result.affectedRows === 0) {
    console.log(`Failed to update budget. Try again.`)
    return null
  }
  const updatedBudget = await getBudgetById(id)
  console.log('Budget updated successfully!')
  return updatedBudget
}

/**
 * Updates the total expenses for a specific budget by adding the given amount.
 *
 * @async
 * @param {number} id - The unique identifier of the budget to update.
 * @param {number} amount - The amount to add to the budget's total expenses.
 * @returns {Promise<Object|null>} The updated budget object if successful, or null if the update failed.
 */
const updateBudgetTotalExpenses = async (id, amount) => {
  const [result] = await connectionPool.query(
    `UPDATE budgets SET total_expenses = total_expenses + ? WHERE id = ?`,
    [amount, id]
  )
  if (result.affectedRows === 0) {
    console.log(`Failed to update budget expenses. Try again.`)
    return null
  }
  const updatedBudget = await getBudgetById(id)
  console.log('Budget expenses updated successfully!')
  return updatedBudget
}

/**
 * Deletes a budget entry from the database by its ID.
 *
 * @async
 * @param {number|string} id - The unique identifier of the budget to delete.
 * @returns {Promise<boolean|null>} Returns true if the budget was deleted successfully,
 * null if no budget was found with the given ID.
 */
const deleteBudget = async id => {
  const [result] = await connectionPool.query(
    `DELETE FROM budgets WHERE id = ?`,
    [id]
  )
  if (result.affectedRows === 0) {
    console.log(`Failed to delete budget. Try again.`)
    return null
  }
  console.log('Budget deleted successfully!')
  return true
}

module.exports = {
  createBudget,
  getBudgetById,
  getBudgetByUserMonthYear,
  updateBudgetIncome,
  updateBudgetTotalExpenses,
  deleteBudget
}
