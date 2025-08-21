const { connectionPool } = require('./db')
const dotenv = require('dotenv').config({
  path:
    process.env.NODE_ENV === 'production'
      ? '.env.production'
      : '.env.development'
})
const { v4: uuidv4 } = require('uuid')
const {
  updateCategoryTotalExpenses,
  createCategory,
  getCategoryById,
  getCategoryByMonthYear
} = require('./categories')
const {
  createMonth,
  updateMonth,
  getHistoryByMonthYear,
  deleteMonth
} = require('./history')
const {
  updateBudgetTotalExpenses,
  getBudgetByUserMonthYear,
  createBudget
} = require('./budgets')

;(async () => {
  await connectionPool.query(`
        CREATE TABLE IF NOT EXISTS expenses (
            id VARCHAR(100) PRIMARY KEY NOT NULL,
            user_id VARCHAR(100) NOT NULL,
            name VARCHAR(50) NOT NULL,
            amount DECIMAL(10,2) NOT NULL,
            budget_id VARCHAR(100) NOT NULL,
            category_id VARCHAR(100) NOT NULL,
            created_date DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
            date DATE NOT NULL,
            history_id VARCHAR(100) NOT NULL,
            notes TEXT,
            FOREIGN KEY (user_id) REFERENCES users(id),
            FOREIGN KEY (budget_id) REFERENCES budgets(id),
            FOREIGN KEY (category_id) REFERENCES categories(id),
            FOREIGN KEY (history_id) REFERENCES history(id)
        );
    `)
  console.log('Table created successfully!')
})()

/**
 * Creates a new expense entry for a user, updates related budget, category, and history records.
 *
 * @async
 * @function createExpense
 * @param {string} name - The name or description of the expense.
 * @param {string} user_id - The unique identifier of the user.
 * @param {number} amount - The amount of the expense.
 * @param {string} category_id - The unique identifier of the expense category.
 * @param {string|Date} date - The date of the expense (ISO string or Date object).
 * @param {string} [notes=''] - Optional notes or comments about the expense.
 * @returns {Promise<Object|null>} The created expense object if successful, or null if creation failed.
 */
const createExpense = async (
  name,
  user_id,
  amount,
  category_id,
  date,
  notes = ''
) => {
  const id = uuidv4()
  const monthDate = new Date(date)
  const month = new Date(date).getUTCMonth() + 1
  const year = new Date(date).getFullYear()
  const budget = await getBudgetByUserMonthYear(user_id, month, year)
  if (monthDate.getUTCDate() === 1) {
    monthDate.setUTCDate(monthDate.getUTCDate() + 1)
  }
  const monthName = `${monthDate.toLocaleString('default', {
    month: 'long'
  })}`
  let historyMonth = await getHistoryByMonthYear(user_id, month, year)
  if (!historyMonth) {
    historyMonth = await createMonth(monthName, user_id, month, year, amount)
  } else {
    await updateMonth(user_id, month, year, amount)
  }

  const thisMonth = new Date().getUTCMonth() + 1
  const thisYear = new Date().getFullYear()
  if (month !== thisMonth || year !== thisYear) {
    const categoryById = await getCategoryById(category_id)
    const categoryByMonthYear = await getCategoryByMonthYear(
      categoryById.name,
      categoryById.user_id,
      month,
      year
    )
    if (!categoryByMonthYear) {
      const newCategory = await createCategory(
        categoryById.name,
        categoryById.user_id,
        month,
        year,
        0, // Start with 0 for new month/year
        amount,
        categoryById.description
      )
      category_id = newCategory.id
    } else {
      await updateCategoryTotalExpenses(categoryByMonthYear.id, amount)
      await updateBudgetTotalExpenses(budget.id, amount)
      category_id = categoryByMonthYear.id
    }
  }
  await connectionPool.query(
    `INSERT INTO expenses (id, user_id, name, amount, budget_id, category_id, date, history_id, notes) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`,
    [
      id,
      user_id,
      name,
      amount,
      budget.id,
      category_id,
      date,
      historyMonth.id,
      notes
    ]
  )
  const expense = await getExpenseById(id)
  if (!expense) {
    console.log(`Failed. Try again.`)
    return null
  }
  if (month === thisMonth && year === thisYear) {
    await updateCategoryTotalExpenses(category_id, amount)
    await updateBudgetTotalExpenses(budget.id, amount)
  }
  console.log('Expense created successfully!')
  return expense
}

/**
 * Retrieves all expenses for a specific user from the database.
 *
 * @async
 * @function getExpensesByUser
 * @param {number|string} user_id - The unique identifier of the user whose expenses are to be fetched.
 * @returns {Promise<Array<Object>>} A promise that resolves to an array of expense objects associated with the user.
 */
const getExpensesByUser = async user_id => {
  const [expenses] = await connectionPool.query(
    `SELECT * FROM expenses WHERE user_id = ?`,
    [user_id]
  )
  return expenses
}

/**
 * Retrieves and returns a list of expenses for a specific user, ordered by creation date (most recent first).
 *
 * @async
 * @function getOrganizedExpenses
 * @param {number|string} user_id - The unique identifier of the user whose expenses are to be fetched.
 * @returns {Promise<Array<Object>>} A promise that resolves to an array of expense objects. Returns an empty array if an error occurs.
 */
const getOrganizedExpenses = async user_id => {
  try {
    const [rows] = await connectionPool.query(
      `
      SELECT * 
      FROM expenses
      WHERE user_id = ?
      ORDER BY created_date DESC;
    `,
      [user_id]
    )
    return rows
  } catch (err) {
    console.error(`Error fetching organized expenses: ${err}`)
    return []
  }
}

/**
 * Retrieves expenses for a specific user and category from the database.
 *
 * @async
 * @function getExpensesByCategory
 * @param {number|string} user_id - The ID of the user whose expenses are to be retrieved.
 * @param {number|string} category_id - The ID of the category to filter expenses by.
 * @returns {Promise<Array<Object>|null>} A promise that resolves to an array of expense objects if successful, or null if an error occurs.
 */
const getExpensesByCategory = async (user_id, category_id) => {
  try {
    const [expenses] = await connectionPool.query(
      `SELECT * FROM expenses WHERE user_id = ? AND category_id = ?`,
      [user_id, category_id]
    )
    return expenses
  } catch (err) {
    console.error(`Error getting expenses by category: ${err}`)
    return null
  }
}

/**
 * Retrieves expenses for a specific user on a given date.
 *
 * @async
 * @function getExpensesByDate
 * @param {number|string} user_id - The ID of the user whose expenses are to be retrieved.
 * @param {string} date - The date for which to retrieve expenses (in 'YYYY-MM-DD' format).
 * @returns {Promise<Array<Object>|null>} A promise that resolves to an array of expense objects if found, or null if an error occurs.
 */
const getExpensesByDate = async (user_id, date) => {
  try {
    const [expenses] = await connectionPool.query(
      `SELECT * FROM expenses WHERE user_id = ? AND date = ?`,
      [user_id, date]
    )
    return expenses
  } catch (err) {
    console.error(`Error getting expenses by date: ${err}`)
    return null
  }
}

/**
 * Retrieves expenses for a specific user filtered by month and year.
 *
 * @async
 * @function getExpensesByMonth
 * @param {number|string} user_id - The ID of the user whose expenses are to be retrieved.
 * @param {number} month - The month (1-12) to filter expenses by.
 * @param {number} year - The year to filter expenses by.
 * @returns {Promise<Array<Object>>} A promise that resolves to an array of expense objects for the specified user, month, and year.
 */
const getExpensesByMonth = async (user_id, month, year) => {
  const [expenses] = await connectionPool.query(
    `SELECT * FROM expenses WHERE user_id = ? AND MONTH(date) = ? AND YEAR(date) = ? ORDER BY created_date DESC;`,
    [user_id, month, year]
  )
  if (!expenses) {
    console.log(`No expenses found for this user in ${month}/${year}.`)
    return []
  }
  return expenses
}

/**
 * Retrieves an expense by its ID from the database.
 *
 * @async
 * @function getExpenseById
 * @param {number|string} id - The unique identifier of the expense to retrieve.
 * @returns {Promise<Object|null>} The expense object if found, or null if not found or on error.
 */
const getExpenseById = async id => {
  try {
    const [expense] = await connectionPool.query(
      `SELECT * FROM expenses WHERE id = ?`,
      [id]
    )
    if (!expense) {
      console.log(`Expense not found.`)
      return null
    }
    return expense[0]
  } catch (err) {
    console.error(`Error getting expense: ${err}`)
    return null
  }
}

/**
 * Updates the budget ID of a specific expense in the database.
 *
 * @async
 * @function updateExpenseBudgetId
 * @param {number|string} expense_id - The unique identifier of the expense to update.
 * @param {number|string} new_budget_id - The new budget ID to assign to the expense.
 * @returns {Promise<Object|null>} The result of the update operation, or null if the expense was not found.
 */
const updateExpenseBudgetId = async (expense_id, new_budget_id) => {
  const result = await connectionPool.query(
    `UPDATE expenses SET budget_id = ? WHERE id = ?`,
    [new_budget_id, expense_id]
  )

  if (result.affectedRows === 0) {
    console.log(`Expense not found.`)
    return null
  }

  return result
}

/**
 * Updates an existing expense with new data, handling changes in month, category, and related budget/history records.
 *
 * @async
 * @function
 * @param {string} id - The unique identifier of the expense to update.
 * @param {Object} updates - The updated expense data.
 * @param {string} updates.name - The new name of the expense.
 * @param {number|string} updates.amount - The new amount for the expense.
 * @param {string} updates.category_id - The ID of the new or existing category.
 * @param {Date|string} updates.date - The new date for the expense.
 * @param {string} [updates.notes] - Optional notes for the expense.
 * @returns {Promise<Object>} The updated expense object.
 * @throws {Error} Throws 'EXPENSE_NOT_FOUND' if the expense does not exist.
 * @throws {Error} Throws 'INVALID_EXPENSE_DATA' if the provided data is invalid.
 * @throws {Error} Throws if any database operation fails.
 */
const updateExpense = async (id, updates) => {
  try {
    const expense = await getExpenseById(id)
    if (!expense) {
      console.log(`Expense not found.`)
      throw new Error('EXPENSE_NOT_FOUND')
    }
    const { name, amount, category_id, date, notes } = updates
    const parsedAmount = typeof amount === 'string' ? Number(amount) : amount
    const parsedDate = typeof date === 'string' ? new Date(date) : date
    if (
      typeof name !== 'string' ||
      typeof parsedAmount !== 'number' ||
      typeof category_id !== 'string' ||
      !parsedDate
    ) {
      console.log('Invalid expense data.')
      throw new Error('INVALID_EXPENSE_DATA')
    }

    // Old and new month/year
    const oldMonth = new Date(expense.date).getMonth() + 1
    const oldYear = new Date(expense.date).getFullYear()
    const newMonth = new Date(parsedDate).getMonth() + 1
    const newYear = new Date(parsedDate).getFullYear()
    let historyMonthExists = true

    // Find or create the correct history month for the new date
    let historyMonth = await getHistoryByMonthYear(
      expense.user_id,
      newMonth,
      newYear
    )
    if (!historyMonth) {
      historyMonth = await createMonth(
        `${parsedDate.toLocaleString('default', { month: 'long' })}`,
        expense.user_id,
        newMonth,
        newYear,
        parsedAmount
      )
      historyMonthExists = false
    }

    let newCategoryId = category_id

    let newBudget = await getBudgetByUserMonthYear(
      expense.user_id,
      newMonth,
      newYear
    )

    if (!newBudget) {
      // If no budget exists for the new month/year, create one with 0 limit and 0 total expenses
      newBudget = await createBudget(expense.user_id, newMonth, newYear, 0, 0)
    }

    // If moving to a new month, get or create the category for the new month
    if (oldMonth !== newMonth || oldYear !== newYear) {
      // Subtract from old month's category
      await updateCategoryTotalExpenses(expense.category_id, -expense.amount)
      await updateBudgetTotalExpenses(expense.budget_id, -expense.amount)

      // Find or create the category for the new month by name
      const selectedCategory = await getCategoryById(category_id)
      let newMonthCategory = await getCategoryByMonthYear(
        selectedCategory.name,
        selectedCategory.user_id,
        newMonth,
        newYear
      )
      if (!newMonthCategory) {
        const createdCategory = await createCategory(
          selectedCategory.name,
          selectedCategory.user_id,
          newMonth,
          newYear,
          0,
          parsedAmount,
          selectedCategory.description,
          selectedCategory.icon
        )
        newCategoryId = createdCategory.id
      } else {
        await updateCategoryTotalExpenses(newMonthCategory.id, parsedAmount)
        newCategoryId = newMonthCategory.id
      }
      // Update new budget total expenses
      await updateBudgetTotalExpenses(newBudget.id, parsedAmount)

      // Update expense's budget_id to the new budget
      await updateExpenseBudgetId(id, newBudget.id)

      // Update the expense with the new category_id and new history_id
      await connectionPool.query(
        `UPDATE expenses SET name = ?, amount = ?, category_id = ?, date = ?, notes = ?, history_id = ? WHERE id = ?`,
        [
          name,
          parsedAmount,
          newCategoryId,
          parsedDate,
          notes,
          historyMonth.id,
          id
        ]
      )

      // Update month totals
      await updateMonth(expense.user_id, oldMonth, oldYear, -expense.amount)
      if (historyMonthExists) {
        await updateMonth(expense.user_id, newMonth, newYear, parsedAmount)
      }
    } else {
      // Same month, maybe same or different category
      if (expense.category_id !== category_id) {
        // Subtract from old category, add to new category
        await updateCategoryTotalExpenses(expense.category_id, -expense.amount)
        await updateCategoryTotalExpenses(category_id, parsedAmount)
        await updateBudgetTotalExpenses(expense.budget_id, -expense.amount)
        await updateBudgetTotalExpenses(newBudget.id, parsedAmount)
      } else {
        // Just update the difference
        const diff = parsedAmount - expense.amount
        await updateCategoryTotalExpenses(category_id, diff)
        await updateBudgetTotalExpenses(newBudget.id, diff)
      }

      // Update the expense
      await connectionPool.query(
        `UPDATE expenses SET name = ?, amount = ?, category_id = ?, date = ?, notes = ?, history_id = ? WHERE id = ?`,
        [
          name,
          parsedAmount,
          category_id,
          parsedDate,
          notes,
          historyMonth.id,
          id
        ]
      )

      // Update month total by the difference
      const diff = parsedAmount - expense.amount
      await updateMonth(expense.user_id, newMonth, newYear, diff)
    }

    console.log('Expense updated successfully!')
    return await getExpenseById(id)
  } catch (err) {
    console.error(`Error updating expense: ${err}`)
    throw err
  }
}

/**
 * Deletes an expense by its ID, updates related category, budget, and monthly totals.
 *
 * @async
 * @function deleteExpense
 * @param {number|string} id - The unique identifier of the expense to delete.
 * @throws {Error} Throws 'EXPENSE_NOT_FOUND' if the expense does not exist.
 * @returns {Promise<void>} Resolves when the expense is deleted and related totals are updated.
 */
const deleteExpense = async id => {
  const expense = await getExpenseById(id)
  if (!expense) {
    console.log(`Expense not found.`)
    throw new Error('EXPENSE_NOT_FOUND')
  }
  await connectionPool.query(`DELETE FROM expenses WHERE id = ?`, [id])
  await updateCategoryTotalExpenses(expense.category_id, -expense.amount)
  await updateBudgetTotalExpenses(expense.budget_id, -expense.amount)
  // Update the history month total
  await updateMonth(
    expense.user_id,
    new Date(expense.date).getMonth() + 1,
    new Date(expense.date).getFullYear(),
    -expense.amount
  )
  console.log('Expense deleted successfully!')
}

/**
 * Deletes all expenses for a specific user from the database.
 *
 * @async
 * @function
 * @param {number|string} user_id - The ID of the user whose expenses will be deleted.
 * @returns {Promise<void>} Resolves when all expenses are deleted.
 * @throws Will log an error message if the deletion fails.
 */
const deleteAllExpenses = async user_id => {
  try {
    await connectionPool.query(`DELETE FROM expenses WHERE user_id = ?`, [
      user_id
    ])
    console.log('All expenses deleted successfully!')
  } catch (err) {
    console.error(`Error deleting all expenses: ${err}`)
  }
}

module.exports = {
  createExpense,
  getExpensesByUser,
  getExpensesByCategory,
  getExpensesByDate,
  getExpenseById,
  updateExpense,
  deleteExpense,
  deleteAllExpenses,
  getOrganizedExpenses,
  getExpensesByMonth
}
