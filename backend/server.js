const express = require("express");
const session = require("express-session");
const dotenv = require("dotenv");
const bcrypt = require("bcrypt");
const path = require("path");
// const generateCSV = require('./generateCSV');
dotenv.config();
const app = express();
const port = process.env.PORT || 4000;
const {
  createUser,
  authenticateUser,
  getUserById,
  verifyUser,
  userIsVerified,
  getUserByEmail
} = require("./database/users");
const {
  getExpensesByUser,
  createExpense,
  deleteExpense,
} = require("./database/expenses");
const {
  createCategory,
  getCategoriesByUser,
} = require("./database/categories");
const { categoriesData } = require("./database/categoriesData");
const { createEmailConfirmation, verifyEmailConfirmation, deleteEmailConfirmation } = require("./database/emailConfirmation");
const { sendEmail, forgotPasswordEmail } = require("./emails");
const { createForgotPassword, changeForgotPassword } = require("./database/forgotPassword");

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.use(
  session({
    secret: process.env.SESSION_SECRET,
    cookie: {
      maxAge: 1000 * 60 * 60 * 24 * 7,
      secure: process.env.NODE_ENV == "production",
      httpOnly: true,
    },
    resave: true,
    saveUninitialized: false,
  })
);

app.get("/user-data", async (req, res) => {
  const id = req.session.userId;
  if (!id) {
    return res.status(401).send("User not found!");
  }
  const user = await getUserById(id);
  if (!user) {
    return res.status(401).send("User not found!");
  }
  res.status(200).send(user);
});

app.post("/process-signup", async (req, res) => {
  const { firstname, lastname, email, password } = req.body;
  const hashedPassword = await bcrypt.hash(password, 10);
  const user = await createUser(firstname, lastname, email, hashedPassword);
  if (!user) {
    return res.status(401).send("User creation failed!");
  }
  req.session.userId = user.id;
  await createEmailConfirmation(user.id);
  await sendEmail(user.email, user.id);
  res.status(200).send("User created successfully!");
});

app.post("/verify-email", async (req, res) => {
  const { token } = req.body;
  const user_id = await verifyEmailConfirmation(token);
  if (!user_id) {
    return res.status(401).send("Email verification failed!");
  }
  res.status(200).send("Email verified successfully!");
})

app.post("/resend-verification-email", async (req, res) => {
  const id = req.session.userId;
  const user = await getUserById(id);
  if (!user) {
    return res.status(401).send("User not found!");
  }
  await deleteEmailConfirmation(id);
  await createEmailConfirmation(id);
  await sendEmail(user.email, id);
  res.status(200).send("Verification email sent!");
})

app.post("/process-login", async (req, res) => {
  const { email, password } = req.body;
  const user = await authenticateUser(email, password);
  if (!user) {
    return res.status(401).send("Login failed!");
  }
  req.session.userId = user.id;
  const isVerified = await userIsVerified(user.id);
  if (!isVerified) {
    console.log("Email not verified!");
    return res.status(401).send("Email not verified!");
  }
  res.status(200).send("Login successful!");
});

app.post('/forgot-password', async (req, res) => {
  const { email } = req.body;
  const user = await getUserByEmail(email);
  if (!user) {
    return res.status(401).send("User not found!");
  }
  await createForgotPassword(email, user.id);
  await forgotPasswordEmail(email);
  res.status(200).send("Password reset email sent!");
})

app.post('/reset-forgot-password', async (req, res) => {
  const { token, new_password } = req.body;
  if (!token || !new_password) {
    return res.status(401).send("Password reset failed!");
  }
  const new_password_hash = await bcrypt.hash(new_password, 10);
  const new_user = await changeForgotPassword(token, new_password_hash);
  if (!new_user) {
    return res.status(401).send("Password reset failed!");
  }
  res.status(200).send("Password reset successfully!");
})

app.post("/logout", (req, res) => {
  req.session.destroy((err) => {
    if (err) {
      console.log(`Error destroying session: ${err}`);
      return res.status(401).send("Logout failed!");
    }
    res.clearCookie("connect.sid");
    console.log("Logged out successfully!");
    res.status(200).send("Logged out successfully!");
  });
});

app.get("/all-categories", async (req, res) => {
  const id = req.session.userId;
  for (let category of categoriesData) {
    await createCategory(
      category.name,
      id,
      category.total_expenses,
      category.description
    );
  }
  const categories = await getCategoriesByUser(id);
  res.status(200).send(categories);
  res.end();
});

app.get("/all-expenses", async (req, res) => {
  const id = req.session.userId;
  const expenses = await getExpensesByUser(id);
  if (!expenses) {
    return res.status(401).send("Data fetch failed!");
  }
  console.log("Data fetch successfully!");
  return res.status(200).send(expenses);
});

app.post("/create-expense", async (req, res) => {
  const { name, user_id, amount, category_id, date, notes } = req.body;
  const expense = await createExpense(
    name,
    user_id,
    amount,
    category_id,
    date,
    notes
  );
  if (!expense) {
    return res.status(401).send("Expense creation failed!");
  }
  res.status(200).send("Expense created successfully!");
});

app.post("/delete-expense", async (req, res) => {
  const { expense_id } = req.body;
  await deleteExpense(expense_id);
  res.status(200).send("Expense deleted successfully!");
});

app.listen(port, () => {
  console.log(`Server listening on port ${port}...`);
});
