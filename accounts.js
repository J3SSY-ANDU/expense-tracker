const Database = require('better-sqlite3');
const bcrypt = require('bcrypt');
const { v4: uuidv4 } = require('uuid');
const db = new Database('accounts.db');

db.exec(`
    CREATE TABLE IF NOT EXISTS accounts (
        id VARCHAR(50) PRIMARY KEY NOT NULL,
        firstname VARCHAR(50) NOT NULL,
        lastname VARCHAR(50) NOT NULL,
        fullname VARCHAR(100) NOT NULL,
        email VARCHAR(100) NOT NULL UNIQUE,
        password VARCHAR(255) NOT NULL    
    );
`);

function createAccount(firstname, lastname, email, password) {
    try {
        if (getAccountByEmail(email)) {
            console.log('Account already exists.');
            return null;
        }
        const stmt = db.prepare('INSERT INTO accounts (id, firstname, lastname, fullname, email, password) VALUES (?, ?, ?, ?, ?, ?)');
        const id = uuidv4(); // Generate a unique ID
        const fullname = `${firstname} ${lastname}`;
        stmt.run(id, firstname, lastname, fullname, email, password);
        if (!getAccountById(id)) {
            console.log(`Failed. Try again.`);
            return null;
        }
        console.log('Account created successfully!');
    } catch (err) {
        console.error(`Error creating account: ${err}`);
        return null;
    }
}

function getAccountById(id) {
    try {
        const stmt = db.prepare('SELECT * FROM accounts WHERE id = ?');
        const account = stmt.get(id);
        if (!account) return null;
        return account; 
    } catch (err) {
        console.error(`Error getting account by id: ${err}`);
    }
}

function getAccountByEmail(email) {
    try {
        const stmt = db.prepare(`SELECT * FROM accounts WHERE email = ?`);
        const account = stmt.get(email);
        if (!account) return null;
        return account;
    } catch (err) {
        console.error(`Error getting account by email: ${err}`);
        return null;
    }
}

async function authenticateAccount(email, password) {
    try {
        const stmt = db.prepare(`SELECT * FROM accounts WHERE email = ?`);
        const account = stmt.get(email);
        if (!account) {
            console.log('Account not found.');
            return null;
        }
        const match = await bcrypt.compare(password, account.password);
        if (match) {
            console.log('Authentication successful!');
            return account;
        } else {
            console.log('Invalid credentials.');
            return null;
        }
    } catch (err) {
        console.error(`Error authenticating account: ${err}`);
        return null;
    }
}

function updateAccount(id, columnName, val) {
    try {
        const allowedColumnNames = ['firstname', 'lastname', 'email', 'password'];
        if (!allowedColumnNames.includes(columnName)) {
            throw new Error(`Invalid parameter: ${columnName}`);
        }
        const stmt = db.prepare(`UPDATE accounts SET ${columnName} = ? WHERE id = ?`);
        stmt.run(val, id);
        console.log(`Account updated successfully!`);
    } catch (err) {
        console.error(`Error updating account: ${err}`);
    }
}

function deleteAccount(id) {
    try {
        const stmt = db.prepare(`DELETE FROM accounts WHERE id = ?`);
        stmt.run(id);
        console.log(`Account deleted successfully!`);
    } catch(err) {
        console.error(`Error deleting account: ${err}`);
    }
}

module.exports = {createAccount, authenticateAccount, getAccountById, updateAccount, deleteAccount};