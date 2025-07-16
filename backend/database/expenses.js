const { connectionPool } = require("./db");
const dotenv = require("dotenv").config({
  path:
    process.env.NODE_ENV === "production"
      ? ".env.production"
      : ".env.development",
});
const { v4: uuidv4 } = require("uuid");
const {
  updateCategoryTotalExpenses,
  createCategory,
  getCategoryById,
  getCategoryByMonthYear,
} = require("./categories");
const {
  createMonth,
  updateMonth,
  getHistoryByMonthYear,
  deleteMonth,
} = require("./history");

(async () => {
  await connectionPool.query(`
        CREATE TABLE IF NOT EXISTS expenses (
            id VARCHAR(100) PRIMARY KEY NOT NULL,
            user_id VARCHAR(100) NOT NULL,
            name VARCHAR(50) NOT NULL,
            amount DECIMAL(10,2) NOT NULL,
            category_id VARCHAR(100) NOT NULL,
            created_date DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
            date DATE NOT NULL,
            history_id VARCHAR(100) NOT NULL,
            notes TEXT,
            FOREIGN KEY (user_id) REFERENCES users(id),
            FOREIGN KEY (category_id) REFERENCES categories(id),
            FOREIGN KEY (history_id) REFERENCES history(id)
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
    const monthDate = new Date(date);
    const month = new Date(date).getUTCMonth() + 1;
    const year = new Date(date).getFullYear();
    if (monthDate.getUTCDate() === 1) {
      monthDate.setUTCDate(monthDate.getUTCDate() + 1);
    }
    const monthName = `${monthDate.toLocaleString("default", {
      month: "long",
    })}`;
    let historyMonth = await getHistoryByMonthYear(user_id, month, year);
    if (!historyMonth) {
      historyMonth = await createMonth(monthName, user_id, month, year, amount);
    } else {
      await updateMonth(user_id, month, year, amount);
    }

    const thisMonth = new Date().getUTCMonth() + 1;
    const thisYear = new Date().getFullYear();
    if (
      month !== thisMonth ||
      year !== thisYear
    ) {
      const categoryById = await getCategoryById(category_id);
      const categoryByMonthYear = await getCategoryByMonthYear(categoryById.name, categoryById.user_id, month, year);
      if (!categoryByMonthYear) {
        const newCategory = await createCategory(
          categoryById.name,
          categoryById.user_id,
          month,
          year,
          amount,
          categoryById.description
        );
        category_id = newCategory.id;
      } else {
        await updateCategoryTotalExpenses(
          categoryByMonthYear.id,
          amount,
        );
        category_id = categoryByMonthYear.id;
      }
    }
    await connectionPool.query(
      `INSERT INTO expenses (id, user_id, name, amount, category_id, date, history_id, notes) VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
      [id, user_id, name, amount, category_id, date, historyMonth.id, notes]
    );
    const expense = await getExpenseById(id);
    if (!expense) {
      console.log(`Failed. Try again.`);
      return null;
    }
    if (month === thisMonth && year === thisYear) {
      await updateCategoryTotalExpenses(category_id, amount);
    }
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

const getOrganizedExpenses = async (user_id) => {
  try {
    const [rows] = await connectionPool.query(
      `
      SELECT * 
      FROM expenses
      WHERE user_id = ?
      ORDER BY created_date DESC;
    `,
      [user_id]
    );
    return rows;
  } catch (err) {
    console.error(`Error fetching organized expenses: ${err}`);
    return [];
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

const getExpensesByMonth = async (user_id, month, year) => {
  try {
    const [expenses] = await connectionPool.query(
      `SELECT * FROM expenses WHERE user_id = ? AND MONTH(date) = ? AND YEAR(date) = ? ORDER BY created_date DESC;
`,
      [user_id, month, year]
    );
    return expenses;
  } catch (err) {
    console.error(`Error getting expenses by month: ${err}`);
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

const updateExpense = async (id, updates) => {
  try {
    const expense = await getExpenseById(id);
    if (!expense) {
      console.log(`Expense not found.`);
      throw new Error("EXPENSE_NOT_FOUND");
    }
    const { name, amount, category_id, date, notes } = updates;
    const parsedAmount = typeof amount === "string" ? Number(amount) : amount;
    const parsedDate = typeof date === "string" ? new Date(date) : date;
    if (
      typeof name !== "string" ||
      typeof parsedAmount !== "number" ||
      typeof category_id !== "string" ||
      !parsedDate
    ) {
      console.log("Invalid expense data.");
      throw new Error("INVALID_EXPENSE_DATA");
    }

    // Old and new month/year
    const oldMonth = new Date(expense.date).getMonth() + 1;
    const oldYear = new Date(expense.date).getFullYear();
    const newMonth = new Date(parsedDate).getMonth() + 1;
    const newYear = new Date(parsedDate).getFullYear();
    let historyMonthExists = true;

    // Find or create the correct history month for the new date
    let historyMonth = await getHistoryByMonthYear(
      expense.user_id,
      newMonth,
      newYear
    );
    if (!historyMonth) {
      historyMonth = await createMonth(
        `${parsedDate.toLocaleString("default", { month: "long" })}`,
        expense.user_id,
        newMonth,
        newYear,
        parsedAmount
      );
      historyMonthExists = false;
    }

    let newCategoryId = category_id;

    // If moving to a new month, get or create the category for the new month
    if (oldMonth !== newMonth || oldYear !== newYear) {
      // Subtract from old month's category
      await updateCategoryTotalExpenses(expense.category_id, -expense.amount);

      // Find or create the category for the new month by name
      const selectedCategory = await getCategoryById(category_id);
      let newMonthCategory = await getCategoryByMonthYear(
        selectedCategory.name,
        selectedCategory.user_id,
        newMonth,
        newYear
      );
      if (!newMonthCategory) {
        const oldCategory = await getCategoryById(expense.category_id);
        const createdCategory = await createCategory(
          oldCategory.name,
          oldCategory.user_id,
          newMonth,
          newYear,
          parsedAmount,
          oldCategory.description
        );
        newCategoryId = createdCategory.id;
      } else {
        await updateCategoryTotalExpenses(newMonthCategory.id, parsedAmount);
        newCategoryId = newMonthCategory.id;
      }

      // Update the expense with the new category_id and new history_id
      await connectionPool.query(
        `UPDATE expenses SET name = ?, amount = ?, category_id = ?, date = ?, notes = ?, history_id = ? WHERE id = ?`,
        [name, parsedAmount, newCategoryId, parsedDate, notes, historyMonth.id, id]
      );

      // Update month totals
      await updateMonth(
        expense.user_id,
        oldMonth,
        oldYear,
        -expense.amount
      );
      if (historyMonthExists) {
        await updateMonth(
          expense.user_id,
          newMonth,
          newYear,
          parsedAmount
        );
      }
    } else {
      // Same month, maybe same or different category
      if (expense.category_id !== category_id) {
        // Subtract from old category, add to new category
        await updateCategoryTotalExpenses(expense.category_id, -expense.amount);
        await updateCategoryTotalExpenses(category_id, parsedAmount);
      } else {
        // Just update the difference
        const diff = parsedAmount - expense.amount;
        await updateCategoryTotalExpenses(category_id, diff);
      }

      // Update the expense
      await connectionPool.query(
        `UPDATE expenses SET name = ?, amount = ?, category_id = ?, date = ?, notes = ?, history_id = ? WHERE id = ?`,
        [name, parsedAmount, category_id, parsedDate, notes, historyMonth.id, id]
      );

      // Update month total by the difference
      const diff = parsedAmount - expense.amount;
      await updateMonth(
        expense.user_id,
        newMonth,
        newYear,
        diff
      );
    }

    console.log("Expense updated successfully!");
    return await getExpenseById(id);
  } catch (err) {
    console.error(`Error updating expense: ${err}`);
    throw err;
  }
};

const deleteExpense = async (id) => {
    const expense = await getExpenseById(id);
    if (!expense) {
      console.log(`Expense not found.`);
      throw new Error("EXPENSE_NOT_FOUND");
    }
    await connectionPool.query(`DELETE FROM expenses WHERE id = ?`, [id]);
    await updateCategoryTotalExpenses(
      expense.category_id,
      -expense.amount,
    );
    await updateMonth(
      expense.user_id,
      new Date(expense.date).getMonth() + 1,
      new Date(expense.date).getFullYear(),
      -expense.amount
    );
    console.log("Expense deleted successfully!");
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
  getOrganizedExpenses,
  getExpensesByMonth,
};
