const express = require('express');
const session = require('express-session');
const dotenv = require('dotenv');
const bcrypt = require('bcrypt');
const path = require('path');
const generateCSV = require('./generateCSV');
dotenv.config();
const app = express();
const port = process.env.PORT || 4000;
const {createAccount, authenticateAccount, getAccountById, updateAccount, deleteAccount} = require('./database/accounts');
const {data, title} = require('./database/users');

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.use(session({
    secret: process.env.SESSION_SECRET,
    cookie: {
        maxAge: 1000 * 60 * 60 * 24 * 7,
        secure: process.env.NODE_ENV == 'production',
        httpOnly: true
    },
    resave: true,
    saveUninitialized: false
}))

app.use('/reports', express.static(path.join(__dirname, 'reports')));

app.get('/session-id-exists', (req, res) => {
    if (!req.session.accountId) {
        return res.status(401).send('Please login or sign up!');
    }
    res.status(200).send('Welcome to the home page!');
})

app.post('/process-signup', async (req, res) => {
    const {firstname, lastname, email, password} = req.body;
    const hashedPassword = await bcrypt.hash(password, 10);
    const account = createAccount(firstname, lastname, email, hashedPassword);
    if (!account) {
        return res.status(401).send('Account creation failed!');
    }
    req.session.accountId = account.id;
    res.status(200).send('Account created successfully!');
})

app.post('/process-login', async (req, res) => {
    const {email, password} = req.body;
    const account = await authenticateAccount(email, password);
    if (!account) {
        return res.status(401).send('Login failed!');
    }
    req.session.accountId = account.id;
    res.status(200).send('Login successful!');
})

app.get('/logout', (req, res) => {
    req.session.destroy(() => {
        res.status(200).send('Logged out successfully!');
    });
})

app.get('/generate-csv', async (req, res) => {
    const id = req.session.accountId;
    const accountData = getAccountById(id);
    const filePath = await generateCSV(accountData);
    res.download(filePath);
})

app.get('/data', (req, res) => {
    if (!data) {
        return res.status(401).send('Error getting data...');
    }
    console.log("Data fetch successfully!");
    res.status(200).send(data);
    res.end();
})

app.listen(port, () => {
    console.log(`Server listening on port ${port}...`);
})