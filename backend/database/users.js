const Database = require('better-sqlite3');
// const dummyData = require('./dummy');
const db = new Database('./database/users.db');

db.exec(`
    CREATE TABLE IF NOT EXISTS users (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        username VARCHAR(50) NOT NULL,
        email VARCHAR(50) NOT NULL,
        password VARCHAR(50) NOT NULL
    );
`);

// const stmt = db.prepare(`INSERT INTO users (username, email, password) VALUES (?, ?, ?)`);
// for (let user of dummyData) {
//     stmt.run(user.username, user.email, user.password);
// }

const data = db.prepare(`SELECT * FROM users`).all();
db.close();

module.exports = {data, title: 'users'};

