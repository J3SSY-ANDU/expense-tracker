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
  getUserByEmail,
  deleteUser,
  updateName, 
  updatePassword
} = require("./database/users");
const {
  getExpensesByUser,
  createExpense,
  deleteExpense,
  updateExpenseName,
  updateExpenseAmount,
  updateExpenseCategory,
  updateExpenseDate,
  updateExpenseNotes,
  getOrganizedExpenses,
} = require("./database/expenses");
const {
  createCategory,
  getCategoriesByUser,
  deleteCategory,
  updateCategoryDescription,
  updateCategoryName,
  getOrderedCategories,
} = require("./database/categories");
const { categoriesData } = require("./database/categoriesData");
const { createEmailConfirmation, verifyEmailConfirmation, deleteEmailConfirmation } = require("./database/emailConfirmation");
const { sendEmail, forgotPasswordEmail } = require("./emails");
const { createForgotPassword, changeForgotPassword } = require("./database/forgotPassword");
const { getHistoryByUser } = require("./database/history");

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
  const user_id = req.session.userId;
  const categories = await getOrderedCategories(user_id);
  res.status(200).send(categories);
})

app.get("/generate-default-categories", async (req, res) => {
  const id = req.session.userId;
  for (let category of categoriesData) {
    await createCategory(
      category.name,
      id,
      category.total_expenses,
      category.description
    );
  }
  res.status(200).send("Default categories created!");
});

app.post("/update-category-name", async (req, res) => {
  const { category_id, name } = req.body;
  const updatedCategory = await updateCategoryName(category_id, name);
  if (!updatedCategory) {
    return res.status(401).send("Category name update failed!");
  }
  res.status(200).send(updatedCategory);
})

app.post("/update-category-description", async (req, res) => {
  const { category_id, description } = req.body;
  const updatedCategory = await updateCategoryDescription(category_id, description);
  if (!updatedCategory) {
    return res.status(401).send("Category description update failed!");
  }
  res.status(200).send(updatedCategory);
})

app.post("/add-category", async (req, res) => {
  const { name, user_id, total_expenses, description } = req.body;
  const category = await createCategory(name, user_id, total_expenses, description);
  if (!category) {
    return res.status(401).send("Category creation failed!");
  }
  res.status(201).send(category);
})

app.post("/delete-category", async (req, res) => {
  const { category_id } = req.body;
  const deleted = await deleteCategory(category_id);
  if (!deleted) {
    return res.status(401).send("Category deletion failed!");
  }
  res.status(200).send("Category deleted successfully!");
})

app.get("/all-expenses", async (req, res) => {
  const id = req.session.userId;
  const expenses = await getOrganizedExpenses(id);
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
  res.status(201).send(expense);
});

app.post("/update-expense-name", async (req, res) => {
  const { expense_id, name } = req.body;
  const updatedExpense = await updateExpenseName(
    expense_id,
    name
  );
  if (!updatedExpense) {
    return res.status(401).send("Expense update failed!");
  }
  res.status(200).send(updatedExpense);
});

app.post("/update-expense-amount", async (req, res) => {
  const { expense_id, amount } = req.body;
  const updatedExpense = await updateExpenseAmount(
    expense_id,
    amount
  );
  if (!updatedExpense) {
    return res.status(401).send("Expense update failed!");
  }
  res.status(200).send(updatedExpense);
});

app.post("/update-expense-category", async (req, res) => {
  const { expense_id, category_id } = req.body;
  const updatedExpense = await updateExpenseCategory(
    expense_id,
    category_id
  );
  if (!updatedExpense) {
    return res.status(401).send("Expense update failed!");
  }
  res.status(200).send(updatedExpense);
});

app.post("/update-expense-date", async (req, res) => {
  const { expense_id, date } = req.body;
  const updatedExpense = await updateExpenseDate(
    expense_id,
    date
  );
  if (!updatedExpense) {
    return res.status(401).send("Expense update failed!");
  }
  res.status(200).send(updatedExpense);
});

app.post("/update-expense-notes", async (req, res) => {
  const { expense_id, notes } = req.body;
  const updatedExpense = await updateExpenseNotes(
    expense_id,
    notes
  );
  if (!updatedExpense) {
    return res.status(401).send("Expense update failed!");
  }
  res.status(200).send(updatedExpense);
});

app.post("/delete-expense", async (req, res) => {
  const { expense_id } = req.body;
  const deleted = await deleteExpense(expense_id);
  if (!deleted) {
    return res.status(401).send("Expense deletion failed!");
  }
  res.status(200).send("Expense deleted successfully!");
});

app.listen(port, () => {
  console.log(`Server listening on port ${port}...`);
});

app.post("/delete-user", async (req, res) => {
  const id = req.session.userId;
  const expenses = await getExpensesByUser(id);
  if (expenses) {
    for (let expense of expenses) {
      await deleteExpense(expense.id);
    }
  }
  const categories = await getCategoriesByUser(id);
  if (categories) {
    for (let category of categories) {
      await deleteCategory(category.id);
    }
  }
  const deleted = await deleteUser(id);
  if (!deleted) {
    return res.status(401).send("Account deletion failed!");
  }
  res.status(200).send("Account deleted successfully!");
})

app.post("/change-password", async (req, res) => {
  const { oldPassword, newPassword } = req.body;
  const id = req.session.userId;
  const user = await getUserById(id);
  if (!user) {
    console.log("User not found!");
    return res.status(401).send("User not found!");
  }
  const match = await bcrypt.compare(oldPassword, user.password);
  if (!match) {
    console.log("Invalid credentials!");
    return res.status(401).send("Invalid credentials!");
  }
  const new_password_hash = await bcrypt.hash(newPassword, 10);
  const updated = await updatePassword(id, new_password_hash);
  if (!updated) {
    console.log("Password change failed!");
    return res.status(401).send("Password change failed!");
  }
  res.status(200).send("Password changed successfully!");
})

app.post("/change-name", async (req, res) => {
  const { new_firstname, new_lastname } = req.body;
  const id = req.session.userId;
  const updated = await updateName(id, new_firstname, new_lastname);
  if (!updated) {
    return res.status(401).send("Name change failed!");
  }
  res.status(200).send("Name changed successfully!");
})

app.get("/history", async (req, res) => {
  const id = req.session.userId;
  const history = await getHistoryByUser(id);
  if (!history) {
    return res.status(401).send("Data fetch failed!");
  }
  console.log("Data fetch successfully!");
  return res.status(200).send(history);
});
