const express = require('express');
const session = require('express-session');
const dotenv = require('dotenv');
const bcrypt = require('bcrypt');
const path = require('path');
// const generateCSV = require('./generateCSV');
dotenv.config();
const app = express();
const port = process.env.PORT || 4000;
const {createUser, authenticateUser} = require('./database/users');
const { getExpensesByUser, createExpense } = require('./database/expenses');
const { createCategory, getCategoriesByUser } = require('./database/categories');
const { categoriesData } = require('./database/categoriesData');

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

app.get('/session-id-exists', (req, res) => {
    if (!req.session.userId) {
        return res.status(401).send('Please login or sign up!');
    }
    res.status(200).send('Welcome to the home page!');
})

app.post('/process-signup', async (req, res) => {
    const {firstname, lastname, email, password} = req.body;
    const hashedPassword = await bcrypt.hash(password, 10);
    const user = await createUser(firstname, lastname, email, hashedPassword);
    if (!user) {
        return res.status(401).send('User creation failed!');
    }
    req.session.userId = user.id;
    res.status(200).send('User created successfully!');
})

app.post('/process-login', async (req, res) => {
    const {email, password} = req.body;
    const user = await authenticateUser(email, password);
    if (!user) {
        return res.status(401).send('Login failed!');
    }
    req.session.userId = user.id;
    res.status(200).send('Login successful!');
})

app.get('/logout', (req, res) => {
    req.session.destroy(() => {
        res.status(200).send('Logged out successfully!');
    });
})

// app.get('/generate-csv', async (req, res) => {
//     const id = req.session.userId;
//     const userData = getUserById(id);
//     const filePath = await generateCSV(userData);
//     res.download(filePath);
// })

app.get('/all-categories', async (req, res) => {
    const id = req.session.userId;
    if (!id) {
        console.log('User id not found.');
        return;
    }
    for (let category of categoriesData) {
        await createCategory(category.name, id, category.total_expenses, category.description);
    }
    const categories = await getCategoriesByUser(id);
    res.status(200).send(categories);
    res.end();
})

app.get('/all-expenses', async (req, res) => {
    const id = req.session.userId;
    const expenses = await getExpensesByUser(id);
    if (!expenses) {
        return res.status(401).send('Data fetch failed!');
    }
    console.log("Data fetch successfully!");
    return res.status(200).send(expenses);
})

app.post('/create-expense', async (req, res) => {
    const {name, user_id, amount, category_id, date, notes} = req.body;
    const expense = await createExpense(name, user_id, amount, category_id, date, notes);
    if (!expense) {
        return res.status(401).send('Expense creation failed!');
    }
    res.status(200).send('Expense created successfully!');
})

app.listen(port, () => {
    console.log(`Server listening on port ${port}...`);
})