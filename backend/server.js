const express = require("express");
const jwt = require("jsonwebtoken");
const dotenv = require("dotenv").config({
  path:
    process.env.NODE_ENV === "production"
      ? ".env.production"
      : ".env.development",
});
const cors = require("cors");
const bcrypt = require("bcrypt");
const path = require("path");

const app = express();
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
  updateExpense,
  getOrganizedExpenses,
  getExpensesByMonth,
} = require("./database/expenses");
const {
  createCategory,
  getCategoriesByUser,
  deleteCategory,
  updateCategoryDescription,
  updateCategoryName,
  getOrderedCategories,
  getCategoryById,
} = require("./database/categories");
const { categoriesData } = require("./database/categoriesData");
const { sendEmailVerification, forgotPasswordEmail } = require("./emails");
const { createForgotPassword, changeForgotPassword } = require("./database/forgotPassword");
const { getHistoryByUser } = require("./database/history");
const { deleteAccountEmail } = require("./emails");

const authenticateToken = (req, res, next) => {
  const authHeader = req.headers["authorization"];
  const token = authHeader && authHeader.split(" ")[1]; // Support "Bearer <token>"
  if (!token) {
    return res.status(401).json({ error: "Unauthorized" });
  }
  jwt.verify(token, process.env.AUTH_SECRET, (err, user) => {
    if (err) {
      return res.status(403).json({ error: "Forbidden" });
    }
    req.user = user;
    next();
  });
};

app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.set("trust proxy", 1); // trust Render’s proxy

app.use(
  cors({
    origin: [
      "http://localhost:3000",                      // local dev
      "https://expense-tracker-gules-pi.vercel.app",
      "https://expense-tracker-jessys-projects-8b4c4acf.vercel.app",
      "https://expense-tracker-git-main-jessys-projects-8b4c4acf.vercel.app",
      "https://expense-tracker-fvkn74p8t-jessys-projects-8b4c4acf.vercel.app"
    ],
    credentials: true,
  })
);

app.get("/user-data", authenticateToken, async (req, res) => {
  const user = await getUserById(req.user.id);
  if (!user) {
    return res.status(401).json({ error: "User not found!" });
  }
  res.status(200).json(user);
});

app.post("/process-signup", async (req, res) => {
  try {
    const { firstname, lastname, email, password } = req.body;
    const hashedPassword = await bcrypt.hash(password, 10);
    const user = await createUser(firstname, lastname, email, hashedPassword);
    const token = await sendEmailVerification(user.email, user.id);
    res.status(200).json({ user, token });
  } catch (error) {
    console.error("Error processing signup:", error);
    if (error.message === "USER_EXISTS") {
      return res.status(409).json({ error: "User already exists!" });
    } else if (error.message === "USER_CREATION_FAILED") {
      return res.status(500).json({ error: "Failed to create user." });
    } else {
      return res.status(500).json({ error: "Unknown server error." });
    }
  }
});

app.get("/verify-email", async (req, res) => {
  const { token } = req.query;
  let id;
  try {
    const decoded = jwt.verify(token, process.env.EMAIL_SECRET);
    id = decoded.id;
    if (!id) {
      return res.status(401).json({ error: "INVALID_TOKEN" });
    }
    const user = await getUserById(id);
    if (!user) {
      return res.status(404).json({ error: "User not found!" });
    }
    if (user.is_verified) {
      return res.status(200).json({ message: "Email already verified!" });
    } else {
      await verifyUser(id);
      const date = new Date();
      const month = date.getMonth() + 1;
      const year = date.getFullYear();
      // Wait for all categories to be created before continuing
      await Promise.all(
        categoriesData.map(category =>
          createCategory(
            category.name,
            id,
            month,
            year,
            category.total_expenses,
            category.description,
          )
        )
      );
      const authToken = jwt.sign({ id: user.id, purpose: "authentication" }, process.env.AUTH_SECRET, {
        expiresIn: "30m",
      });
      return res.status(200).json({ message: "Email verification successful!", token: authToken });
    }
  } catch (err) {
    console.error("Error verifying token or user:", err);
    return res.status(401).json({ error: "Email verification failed!" });
  }
});

app.post("/resend-verification-email", async (req, res) => {
  const user = await getUserById(id);
  if (!user) {
    return res.status(401).send("User not found!");
  }
  await sendEmailVerification(user.email, id);
  res.status(200).send("Verification email sent!");
})

app.get("/verify-user-creation", async (req, res) => {
  const { id } = req.query;
  const user = await getUserById(id);
  if (!user) {
    return res.status(404).send("User not found!");
  }
  const isVerified = await userIsVerified(id);
  if (!isVerified) {
    return res.status(401).send("Email not verified!");
  }
  res.status(200).send("Email verified!");
})

app.post("/process-login", async (req, res) => {
  try {
    const { email, password } = req.body;
    const user = await authenticateUser(email, password);
    const isVerified = await userIsVerified(user.id);
    if (!isVerified) {
      console.log("Email not verified!");
      throw new Error("USER_NOT_VERIFIED");
    }
    // Generate JWT token for the user
    const token = jwt.sign({ id: user.id, purpose: "authentication" }, process.env.AUTH_SECRET, {
      expiresIn: "30m",
    });
    res.status(200).json({ user, token });
  } catch (error) {
    console.error("Error processing login:", error);
    // Do not reveal if user or password is wrong
    if (
      error.message === "USER_NOT_FOUND" ||
      error.message === "INVALID_CREDENTIALS"
    ) {
      return res.status(401).json({ error: "Invalid email or password!" });
    } else if (error.message === "USER_NOT_VERIFIED") {
      return res.status(403).json({ error: "Email not verified. Please verify your email." });
    } else if (error.message === "USER_VERIFICATION_ERROR") {
      return res.status(500).json({ error: "User verification error." });
    } else {
      return res.status(500).json({ error: "Unknown server error." });
    }
  }
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

app.get("/all-categories", authenticateToken, async (req, res) => {
  const categories = await getOrderedCategories(req.user.id);
  res.status(200).json(categories);
})

app.get("/generate-default-categories", authenticateToken, async (req, res) => {
  const id = req.user.id;
  const date = new Date();
  const month = date.getMonth() + 1;
  const year = date.getFullYear();
  for (let category of categoriesData) {
    await createCategory(
      category.name,
      id,
      month,
      year,
      category.total_expenses,
      category.description,
    );
  }
  res.status(200).json({ message: "Default categories created!" });
});

app.get("/get-category", authenticateToken, async (req, res) => {
  const { category_id } = req.query;
  const category = await getCategoryById(category_id);
  if (!category) {
    return res.status(401).json({ error: "Category not found!" });
  }
  res.status(200).json(category);
});

app.post("/update-category-name", authenticateToken, async (req, res) => {
  const { category_id, name } = req.body;
  const updatedCategory = await updateCategoryName(category_id, name);
  if (!updatedCategory) {
    return res.status(401).json({ error: "Category name update failed!" });
  }
  res.status(200).json(updatedCategory);
})

app.post("/update-category-description", authenticateToken, async (req, res) => {
  const { category_id, description } = req.body;
  const updatedCategory = await updateCategoryDescription(category_id, description);
  if (!updatedCategory) {
    return res.status(401).json({ error: "Category description update failed!" });
  }
  res.status(200).json(updatedCategory);
})

app.post("/add-category", authenticateToken, async (req, res) => {
  const { name, user_id, month, year, total_expenses, description } = req.body;
  const category = await createCategory(name, user_id, month, year, total_expenses, description);
  if (!category) {
    return res.status(401).json({ error: "Category creation failed!" });
  }
  res.status(201).json(category);
})

app.post("/delete-category", authenticateToken, async (req, res) => {
  const { category_id } = req.body;
  const deleted = await deleteCategory(category_id);
  if (!deleted) {
    return res.status(401).json({ error: "Category deletion failed!" });
  }
  res.status(200).json({ message: "Category deleted successfully!" });
})

app.get("/all-expenses", authenticateToken, async (req, res) => {
  const expenses = await getOrganizedExpenses(req.user.id);
  if (!expenses) {
    return res.status(401).json({ error: "Data fetch failed!" });
  }
  console.log("Data fetch successfully!");
  return res.status(200).json(expenses);
});

app.get("/all-monthly-expenses", authenticateToken, async (req, res) => {
  const date = new Date();
  const month = date.getMonth() + 1;
  const year = date.getFullYear();
  const expenses = await getExpensesByMonth(req.user.id, month, year);
  if (!expenses) {
    return res.status(401).json({ error: "Data fetch failed!" });
  }
  console.log("Data fetch successfully!");
  return res.status(200).json(expenses);
})

app.post("/create-expense", authenticateToken, async (req, res) => {
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
    return res.status(401).json({ error: "Expense creation failed!" });
  }
  res.status(201).json(expense);
});

app.put("/update-expense", authenticateToken, async (req, res) => {
  try {
    const { id, name, amount, category_id, date, notes } = req.body;
    if (!id) {
      throw new Error("EXPENSE_NOT_FOUND");
    }
    const updates = { name, amount, category_id, date, notes }
    const updatedExpense = await updateExpense(id, updates);
    if (!updatedExpense) {
      throw new Error("EXPENSE_NOT_FOUND");
    }
    res.status(200).json(updatedExpense);
  } catch (err) {
    console.error("Error updating expense:", err);
    if (err.message === "EXPENSE_NOT_FOUND") {
      return res.status(404).json({ error: "Expense not found!" });
    } else if (err.message === "INVALID_EXPENSE_DATA") {
      return res.status(400).json({ error: "Invalid expense data!" });
    } else {
      return res.status(500).json({ error: "Unknown server error." });
    }
  }
});

app.post("/delete-expense", authenticateToken, async (req, res) => {
  const { expense_id } = req.body;
  const deleted = await deleteExpense(expense_id);
  if (!deleted) {
    return res.status(401).json({ error: "Expense deletion failed!" });
  }
  res.status(200).json({ message: "Expense deleted successfully!" });
});

app.post("/delete-user", authenticateToken, async (req, res) => {
  const expenses = await getExpensesByUser(req.user.id);
  if (expenses) {
    for (let expense of expenses) {
      await deleteExpense(expense.id);
    }
  }
  const categories = await getCategoriesByUser(req.user.id);
  if (categories) {
    for (let category of categories) {
      await deleteCategory(category.id);
    }
  }
  const user = await getUserById(req.user.id);
  if (!user) {
    return res.status(401).json({ error: "User not found!" });
  }
  else {
    const deleted = await deleteUser(req.user.id);
    if (!deleted) {
      return res.status(401).json({ error: "Account deletion failed!" });
    }
    await deleteAccountEmail(user.firstname, user.email);
    res.status(200).json({ message: "Account deleted successfully!" });
  }
})

app.post("/change-password", authenticateToken, async (req, res) => {
  const { oldPassword, newPassword } = req.body;
  const user = await getUserById(req.user.id);
  if (!user) {
    console.log("User not found!");
    return res.status(401).json({ error: "User not found!" });
  }
  const match = await bcrypt.compare(oldPassword, user.password);
  if (!match) {
    console.log("Invalid credentials!");
    return res.status(401).json({ error: "Invalid credentials!" });
  }
  const new_password_hash = await bcrypt.hash(newPassword, 10);
  const updated = await updatePassword(req.user.id, new_password_hash);
  if (!updated) {
    console.log("Password change failed!");
    return res.status(401).json({ error: "Password change failed!" });
  }
  res.status(200).json({ message: "Password changed successfully!" });
})

app.post("/change-name", authenticateToken, async (req, res) => {
  const { new_firstname, new_lastname } = req.body;
  const updated = await updateName(req.user.id, new_firstname, new_lastname);
  if (!updated) {
    return res.status(401).json({ error: "Name change failed!" });
  }
  res.status(200).json({ message: "Name changed successfully!" });
})

app.get("/history", authenticateToken, async (req, res) => {
  const history = await getHistoryByUser(req.user.id);
  for (const monthlyHistory of history) {
    const expenses = await getExpensesByMonth(req.user.id, monthlyHistory.month, monthlyHistory.year);
    monthlyHistory.expenses = expenses || [];
    const categories = await Promise.all(expenses.map(expense => getCategoryById(expense.category_id)));
    monthlyHistory.categories = categories || [];
  }
  if (!history) {
    return res.status(401).json({ error: "Data fetch failed!" });
  }
  console.log("Data fetch successfully!");
  return res.status(200).json(history);
});

const port = process.env.PORT || 10000;

app.listen(port, () => {
  console.log(`Server listening on port ${port}...`);
});
