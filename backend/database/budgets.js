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

const createBudget = async (user_id, month, year, total_income = 0, total_expenses = 0, connection) => {
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

const getBudgetById = async (id, connection) => {
  const [rows] = await (connection || connectionPool).query(
    `SELECT * FROM budgets WHERE id = ?`,
    [id]
  )
  return rows[0] || null
}

const getBudgetByUserMonthYear = async (user_id, month, year) => {
  const [rows] = await connectionPool.query(
    `SELECT * FROM budgets WHERE user_id = ? AND month = ? AND year = ?`,
    [user_id, month, year]
  )
  return rows[0] || null
}

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