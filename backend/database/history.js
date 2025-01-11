const { connectionPool } = require("./db");
const dotenv = require("dotenv").config();

(async () => {
  await connectionPool.query(`
            CREATE TABLE IF NOT EXISTS months (
                id INT AUTO_INCREMENT PRIMARY KEY NOT NULL,
                user_id VARCHAR(100) NOT NULL,
                month VARCHAR(50) NOT NULL,
                year INT NOT NULL,
                total_expenses DECIMAL(10,2) NOT NULL,
                FOREIGN KEY (user_id) REFERENCES users(id),
                UNIQUE (user_id, month, year)
            );
        `);
  console.log("Table created successfully!");
})();

const createMonth = async (user_id, month, year, total_expenses) => {
    try {
        if (await getHistoryByMonthYear(user_id, month, year)) {
            console.log(`Month already exists.`);
            return null;
        }
        await connectionPool.query(
        `INSERT INTO months (user_id, month, year, total_expenses) VALUES (?, ?, ?, ?)`,
        [user_id, month, year, total_expenses]
        );
        const month = await getHistoryByMonthYear(user_id, month, year);
        if (!month) {
            console.log(`Failed. Try again.`);
            return null;
        }
        console.log("Month created successfully!");
        return month;
    } catch (err) {
        console.error(`Error creating month: ${err}`);
        return null;
    }
    }

const getHistoryByUser = async (user_id) => {
    try {
        const [months] = await connectionPool.query(
        `SELECT * FROM months WHERE user_id = ?`,
        [user_id]
        );
        return months;
    } catch (err) {
        console.error(`Error getting months: ${err}`);
        return null;
    }
}

const getHistoryByMonthYear = async (user_id, month, year) => {
    try {
        const [month] = await connectionPool.query(
        `SELECT * FROM months WHERE user_id = ? AND month = ? AND year = ?`,
        [user_id, month, year]
        );
        return month[0];
    } catch (err) {
        console.error(`Error getting month: ${err}`);
        return null;
    }
}

module.exports = {getHistoryByMonthYear, getHistoryByUser, createMonth};
