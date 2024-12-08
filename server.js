const express = require('express');
const session = require('express-session');
const dotenv = require('dotenv');
const bcrypt = require('bcrypt');
const path = require('path');
const generateCSV = require('./generateCSV');
dotenv.config();
const app = express();
const port = process.env.PORT || 3000;
const {createAccount, authenticateAccount, getAccountById, updateAccount, deleteAccount} = require('./accounts');

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

app.get('/', (req, res) => {
    if (!req.session.accountId) {
        console.log('Redirecting to login screen...');
        return res.redirect('/login');
    }
    res.sendFile(path.join(__dirname, 'public', 'index.html'));
})

app.get('/signup', (req, res) => {
    if (req.session.accountId) {
        return res.redirect('/')
    }
    res.setHeader('Content-Type', 'text/HTML');
    res.write(`
        <h1>Signup</h1>
        <form method="post" action="/process-signup">
            <input type="text" name="firstname" placeholder="Firstname" /> <br>
            <input type="text" name="lastname" placeholder="Lastname" /> <br>
            <input type="email" name="email" placeholder="Email" /> <br>
            <input type="password" name="password" placeholder="Password" /> <br>
            <input type="password" name="password-confirmation" placeholder="Confirm password" /> <br>
            <button type="submit">Signup</button>
        </form>
        `)
    res.end();
})

app.post('/process-signup', async (req, res) => {
    const {firstname, lastname, email, password} = req.body;
    const hashedPassword = await bcrypt.hash(password, 10);
    const account = createAccount(firstname, lastname, email, hashedPassword);
    if (!account) {
        return res.redirect('/signup');
    }
    req.session.accountId = account.id;
    res.redirect('/');
})

app.get('/login', (req, res) => {
    if (req.session.accountId) {
        return res.redirect('/');
    }
    res.setHeader('Content-Type', 'text/HTML');
    res.write(`
        <h1>Login</h1>
        <form method="post" action="/process-login">
            <input type="email" name="email" placeholder="Email" /> <br>
            <input type="password" name="password" placeholder="Password" /> <br>
            <button type="submit">Login</button>
        </form>
    `);
    res.end();
})

app.post('/process-login', async (req, res) => {
    const {email, password} = req.body;
    const account = await authenticateAccount(email, password);
    if (account) {
        req.session.accountId = account.id;
        res.redirect('/');
    } else {
        res.redirect('/login');
    }
})

app.get('/logout', (req, res) => {
    req.session.destroy(() => {
        res.redirect('/login');
    });
})

app.get('/generate-csv', async (req, res) => {
    const id = req.session.accountId;
    const accountData = getAccountById(id);
    const filePath = await generateCSV(accountData);
    res.download(filePath);
})

app.listen(port, () => {
    console.log(`Server listening on port ${port}...`);
})