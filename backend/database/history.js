const { connectionPool } = require("./db");
const dotenv = require("dotenv").config({
  path:
    process.env.NODE_ENV === "production"
      ? ".env.production"
      : ".env.development",
});
const { v4: uuidv4 } = require("uuid");

(async () => {
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
        `);
  console.log("Table created successfully!");
})();

const createMonth = async (name, user_id, month, year, amount) => {
  try {
    const id = uuidv4();
    await connectionPool.query(
      `INSERT INTO history (id, name, user_id, month, year, total_expenses) VALUES (?, ?, ?, ?, ?, ?)`,
      [id, name, user_id, month, year, amount]
    );
    const newMonth = await getHistoryByMonthYear(user_id, month, year);
    if (!newMonth) {
      console.log(`Failed. Try again.`);
      return null;
    }
    console.log("Month created successfully!");
    return newMonth;
  } catch (err) {
    console.error(`Error creating month: ${err}`);
    return null;
  }
};

const getHistoryById = async (id) => {
  try {
    const [history] = await connectionPool.query(
      `SELECT * FROM history WHERE id = ?`,
      [id]
    );
    return history[0];
  } catch (err) {
    console.error(`Error getting history: ${err}`);
    return null;
  }
}

const getHistoryByUser = async (user_id) => {
    const [history] = await connectionPool.query(
      `SELECT * FROM history WHERE user_id = ?`,
      [user_id]
    );
    return history;
};

const getHistoryByMonthYear = async (user_id, month, year) => {
  try {
    const [history] = await connectionPool.query(
      `SELECT * FROM history WHERE user_id = ? AND month = ? AND year = ?`,
      [user_id, month, year]
    );
    return history[0];
  } catch (err) {
    console.error(`Error getting month: ${err}`);
    return null;
  }
};

const updateMonth = async (user_id, month, year, amount) => {
  try {
    const monthlyHistory = await getHistoryByMonthYear(user_id, month, year);
    const newAmount = parseFloat(amount) + parseFloat(monthlyHistory.total_expenses);
    if (newAmount <= 0) {
      await deleteMonth(monthlyHistory.id);
      return null;
    }
    await connectionPool.query(
      `UPDATE history SET total_expenses = ? WHERE user_id = ? AND month = ? AND year = ?`,
      [newAmount, user_id, month, year]
    );
    const updatedMonth = await getHistoryByMonthYear(user_id, month, year);
    if (
      parseFloat(updatedMonth.total_expenses) !== parseFloat(newAmount)
    ) {
      console.log(`Failed. Try again.`);
      return null;
    }
    console.log("Month updated successfully!");
    return updatedMonth;
  } catch (err) {
    console.error(`Error updating month: ${err}`);
    return null;
  }
};

const deleteMonth = async (id) => {
  try {
    await connectionPool.query(`DELETE FROM history WHERE id = ?`, [id]);
    console.log("Month deleted successfully!");
  } catch (err) {
    console.error(`Error deleting month: ${err}`);
  }
}

module.exports = {
  getHistoryByMonthYear,
  getHistoryByUser,
  createMonth,
  updateMonth,
  getHistoryById,
};
