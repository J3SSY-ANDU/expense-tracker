const { connectionPool } = require("./db");
const dotenv = require("dotenv").config();
const { v4: uuidv4 } = require("uuid");
const { expensesData } = require("./expensesData");
const { updateCategoryTotalExpenses } = require("./categories");
const { get } = require("http");

(async () => {
  await connectionPool.query(`
        CREATE TABLE IF NOT EXISTS expenses (
            id VARCHAR(100) PRIMARY KEY NOT NULL,
            user_id VARCHAR(100) NOT NULL,
            name VARCHAR(50) NOT NULL,
            amount DECIMAL(10,2) NOT NULL,
            category_id VARCHAR(100) NOT NULL,
            date DATE NOT NULL,
            notes TEXT,
            FOREIGN KEY (user_id) REFERENCES users(id),
            FOREIGN KEY (category_id) REFERENCES categories(id)
        );
    `);
  console.log("Table created successfully!");
})();

const createExpense = async (
  name,
  user_id,
  amount,
  category_id,
  date,
  notes = ""
) => {
  try {
    const id = uuidv4();
    await connectionPool.query(
      `INSERT INTO expenses (id, user_id, name, amount, category_id, date, notes) VALUES (?, ?, ?, ?, ?, ?, ?)`,
      [id, user_id, name, amount, category_id, date, notes]
    );
    const expense = await getExpenseById(id);
    if (!expense) {
      console.log(`Failed. Try again.`);
      return null;
    }
    await updateCategoryTotalExpenses(category_id, amount);
    console.log("Expense created successfully!");
    return expense;
  } catch (err) {
    console.error(`Error creating expense: ${err}`);
    return null;
  }
};

const getExpensesByUser = async (user_id) => {
  try {
    const [expenses] = await connectionPool.query(
      `SELECT * FROM expenses WHERE user_id = ?`,
      [user_id]
    );
    return expenses;
  } catch (err) {
    console.error(`Error getting expenses: ${err}`);
    return null;
  }
};

const getExpensesByCategory = async (user_id, category_id) => {
  try {
    const [expenses] = await connectionPool.query(
      `SELECT * FROM expenses WHERE user_id = ? AND category_id = ?`,
      [user_id, category_id]
    );
    return expenses;
  } catch (err) {
    console.error(`Error getting expenses by category: ${err}`);
    return null;
  }
};

const getExpensesByDate = async (user_id, date) => {
  try {
    const [expenses] = await connectionPool.query(
      `SELECT * FROM expenses WHERE user_id = ? AND date = ?`,
      [user_id, date]
    );
    return expenses;
  } catch (err) {
    console.error(`Error getting expenses by date: ${err}`);
    return null;
  }
};

const getExpenseById = async (id) => {
  try {
    const [expense] = await connectionPool.query(
      `SELECT * FROM expenses WHERE id = ?`,
      [id]
    );
    if (!expense) {
      console.log(`Expense not found.`);
      return null;
    }
    return expense[0];
  } catch (err) {
    console.error(`Error getting expense: ${err}`);
    return null;
  }
};

const updateExpense = async (
  id,
  name,
  amount,
  category_id,
  date,
  notes = ""
) => {
  try {
    await connectionPool.query(
      `UPDATE expenses SET name = ?, amount = ?, category_id = ?, date = ?, notes = ? WHERE id = ?`,
      [name, amount, category_id, date, notes, id]
    );
    const expense = await getExpenseById(id);
    if (!expense) {
      console.log(`Failed. Try again.`);
      return null;
    }
    console.log("Expense updated successfully!");
    return expense;
  } catch (err) {
    console.error(`Error updating expense: ${err}`);
    return null;
  }
};

const deleteExpense = async (id) => {
  try {
    const expense = await getExpenseById(id);
    if (!expense) {
      console.log(`Expense not found.`);
      return;
    }
    await connectionPool.query(
      `DELETE FROM expenses WHERE id = ?`,
      [id]
    );
    await updateCategoryTotalExpenses(
      expense.category_id,
      -expense.amount
    );
    console.log("Expense deleted successfully!");
  } catch (err) {
    console.error(`Error deleting expense: ${err}`);
  }
};

const deleteAllExpenses = async (user_id) => {
  try {
    await connectionPool.query(`DELETE FROM expenses WHERE user_id = ?`, [
      user_id,
    ]);
    console.log("All expenses deleted successfully!");
  } catch (err) {
    console.error(`Error deleting all expenses: ${err}`);
  }
};

module.exports = {
  createExpense,
  getExpensesByUser,
  getExpensesByCategory,
  getExpensesByDate,
  getExpenseById,
  updateExpense,
  deleteExpense,
  deleteAllExpenses,
};
