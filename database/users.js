const Database = require('better-sqlite3');
const db = new Database('users.db');

db.exec(`
    CREATE TABLE IF NOT EXISTS users (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        username VARCHAR(50) NOT NULL,
        email VARCHAR(50) NOT NULL,
        password VARCHAR(50) NOT NULL
    );
`);

const data = db.prepare(`SELECT * FROM users`).all();
db.close();

module.exports = {data, title: 'users'};

