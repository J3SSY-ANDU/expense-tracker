const express = require('express')
const jwt = require('jsonwebtoken')
const dotenv = require('dotenv').config({
  path:
    process.env.NODE_ENV === 'production'
      ? '.env.production'
      : '.env.development'
})
const cors = require('cors')
const bcrypt = require('bcrypt')
const path = require('path')

const app = express()
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
} = require('./database/users')
const {
  createExpense,
  deleteExpense,
  updateExpense,
  getOrganizedExpenses,
  getExpensesByMonth
} = require('./database/expenses')
const {
  createCategory,
  deleteCategory,
  updateCategoryDescription,
  updateCategoryName,
  getOrderedCategories,
  getCategoryById,
  createDefaultCategories
} = require('./database/categories')
const { sendEmailVerification, forgotPasswordEmail } = require('./emails')
const {
  createForgotPassword,
  changeForgotPassword
} = require('./database/forgotPassword')
const { getHistoryByUser } = require('./database/history')
const { validateEmailVerificationToken, invalidateTokensByEmail, getEmailByVerificationToken } = require('./database/emailVerification')

const authenticateToken = (req, res, next) => {
  const authHeader = req.headers['authorization']
  const token = authHeader && authHeader.split(' ')[1] // Support "Bearer <token>"
  if (!token) {
    return res.status(401).json({ error: 'Unauthorized' })
  }
  jwt.verify(token, process.env.AUTH_SECRET, (err, user) => {
    if (err) {
      return res.status(403).json({ error: 'Forbidden' })
    }
    req.user = user
    next()
  })
}

app.use(express.json())
app.use(express.urlencoded({ extended: true }))
app.set('trust proxy', 1) // trust Render’s proxy

app.use(
  cors({
    origin: [
      'http://localhost:3000', // local dev
      'https://expense-tracker-gules-pi.vercel.app',
      'https://expense-tracker-jessys-projects-8b4c4acf.vercel.app',
      'https://expense-tracker-git-main-jessys-projects-8b4c4acf.vercel.app',
      'https://expense-tracker-fvkn74p8t-jessys-projects-8b4c4acf.vercel.app'
    ],
    credentials: true
  })
)

app.get('/user-data', authenticateToken, async (req, res) => {
  try {
    const user = await getUserById(req.user.id)
    if (!user) {
      return res.status(401).json({ error: 'User not found!' })
    }
    // EXCLUDE PASSWORD FROM RESPONSE
    res.status(200).json({
      user_id: user.id,
      firstname: user.firstname,
      lastname: user.lastname,
      fullname: user.fullname,
      email: user.email,
      is_verified: user.is_verified
    })
  } catch (error) {
    console.error('Error fetching user data:', error)
    res.status(500).json({ error: 'Failed to fetch user data.' })
  }
})

app.post('/process-signup', async (req, res) => {
  try {
    const { firstname, lastname, email, password } = req.body
    const hashedPassword = await bcrypt.hash(password, 10)
    const user = await createUser(firstname, lastname, email, hashedPassword)
    await sendEmailVerification(user.email)
    // EXCLUDE PASSWORD FROM RESPONSE
    res.status(200).json({ user_id: user.id, emailSent: true })
  } catch (error) {
    console.error('Error processing signup:', error)
    if (error.message === 'USER_EXISTS') {
      return res.status(409).json({ error: 'User already exists!' })
    } else if (error.message === 'USER_CREATION_FAILED') {
      return res.status(500).json({ error: 'Failed to create user.' })
    } else {
      return res.status(500).json({ error: 'Unknown server error.' })
    }
  }
})

// Needs to be fixed
app.get('/verify-email/:token', async (req, res) => {
  const { token } = req.params
  if (!token) {
    return res.status(400).json({ error: 'Token is required' })
  }
  try {
    const email = await validateEmailVerificationToken(token);
    if (!email) {
      return res.status(401).json({ error: 'Invalid or expired token' })
    }
    const user = await getUserByEmail(email);
    if (!user) {
      return res.status(404).json({ error: 'Verification email could not be sent' })
    }
    if (user.is_verified) {
      return res.status(200).json({ message: 'Email already verified! Please log in.' })
    } else {
      await verifyUser(user.id)
      await invalidateTokensByEmail(email)
      await createDefaultCategories(user.id)

      const authToken = jwt.sign(
        { id: user.id, purpose: 'authentication' },
        process.env.AUTH_SECRET,
        {
          expiresIn: '30m'
        }
      )
      return res
        .status(200)
        .json({ message: 'Email verification successful!', token: authToken })
    }
  } catch (err) {
    console.error('Error verifying token or user:', err)
    if (err.message === 'USER_VERIFICATION_FAILED') {
      return res.status(500).json({ error: 'User verification failed!' })
    }
    return res.status(401).json({ error: 'Email verification failed!' })
  }
})

// Needs to be fixed
app.post('/resend-verification-email', async (req, res) => {
  try {
    const { id, token, email } = req.body;
    let user;

    if (id) {
      user = await getUserById(id);
    } else if (token) {
      // Lookup email by token, even if expired, then get the user by email
      const email = await getEmailByVerificationToken(token);
      if (!email) {
        return res.status(400).json({ error: 'Invalid token.' });
      }
      user = await getUserByEmail(email);
    } else if (email) {
      user = await getUserByEmail(email);
    } else {
      return res.status(400).json({ error: 'User ID, token or email required.' });
    }

    if (!user) {
      return res.status(404).json({ error: 'Verification email could not be resent.' });
    }
    if (user.is_verified) {
      return res.status(400).json({ error: 'Email is already verified.' });
    }

    await sendEmailVerification(user.email, user.id);
    res.status(200).json({ message: 'Verification email sent!' })
  } catch (error) {
    console.error('Error resending verification email:', error)
    return res.status(500).json({ error: 'Failed to resend verification email.' })
  }
})

app.post('/process-login', async (req, res) => {
  try {
    const { email, password } = req.body
    const user = await authenticateUser(email, password)
    const isVerified = await userIsVerified(user.id)
    if (!isVerified) {
      console.log('Email not verified!')
      return res
        .status(403)
        .json({ error: 'Email not verified. Please verify your email.' })
    }
    // Generate JWT token for the user
    const token = jwt.sign(
      { id: user.id, purpose: 'authentication' },
      process.env.AUTH_SECRET,
      {
        expiresIn: '30m'
      }
    )
    res.status(200).json({ token })
  } catch (error) {
    console.error('Error processing login:', error)
    // Do not reveal if user or password is wrong
    if (
      error.message === 'USER_NOT_FOUND' ||
      error.message === 'INVALID_CREDENTIALS'
    ) {
      return res.status(401).json({ error: 'Invalid email or password!' })
    }
    return res.status(500).json({ error: 'Unknown server error.' })
  }
})

// Needs to be fixed
app.post('/forgot-password', async (req, res) => {
  const { email } = req.body
  const user = await getUserByEmail(email)
  if (!user) {
    return res.status(401).send('User not found!')
  }
  await createForgotPassword(email, user.id)
  await forgotPasswordEmail(email)
  res.status(200).send('Password reset email sent!')
})

// Need to be fixed
app.post('/reset-forgot-password', async (req, res) => {
  const { token, new_password } = req.body
  if (!token || !new_password) {
    return res.status(401).send('Password reset failed!')
  }
  const new_password_hash = await bcrypt.hash(new_password, 10)
  const new_user = await changeForgotPassword(token, new_password_hash)
  if (!new_user) {
    return res.status(401).send('Password reset failed!')
  }
  res.status(200).send('Password reset successfully!')
})

app.get('/all-categories', authenticateToken, async (req, res) => {
  try {
    const categories = await getOrderedCategories(req.user.id)
    res.status(200).json(categories)
  } catch (error) {
    console.error('Error fetching categories:', error)
    res.status(500).json({ error: 'Failed to fetch categories.' })
  }
})

app.get('/generate-default-categories', authenticateToken, async (req, res) => {
  try {
    const date = new Date()
    const month = date.getMonth() + 1
    const year = date.getFullYear()
    for (let category of categoriesData) {
      await createCategory(
        category.name,
        req.user.id,
        month,
        year,
        category.total_expenses,
        category.description
      )
    }
    res.status(200).json({ message: 'Default categories created!' })
  } catch (error) {
    console.error('Error generating default categories:', error)
    // Always return an error object for frontend consistency
    res.status(500).json({ error: 'Failed to generate default categories.' })
  }
})

app.get('/get-category', authenticateToken, async (req, res) => {
  try {
    const { category_id } = req.query
    if (!category_id) {
      return res.status(400).json({ error: 'category_id is required.' })
    }
    const category = await getCategoryById(category_id)
    if (!category) {
      return res.status(404).json({ error: 'Category not found!' })
    }
    res.status(200).json(category)
  } catch (error) {
    console.error('Error fetching category:', error)
    res.status(500).json({ error: 'Failed to fetch category.' })
  }
})

app.post('/update-category-name', authenticateToken, async (req, res) => {
  try {
    const { category_id, name } = req.body
    if (!category_id || !name) {
      return res
        .status(400)
        .json({ error: 'category_id and name are required.' })
    }
    const updatedCategory = await updateCategoryName(category_id, name)
    if (!updatedCategory) {
      return res.status(401).json({ error: 'Category name update failed!' })
    }
    res.status(200).json(updatedCategory)
  } catch (error) {
    console.error('Error updating category name:', error)
    res.status(500).json({ error: 'Failed to update category name.' })
  }
})

app.post(
  '/update-category-description',
  authenticateToken,
  async (req, res) => {
    try {
      const { category_id, description } = req.body
      if (!category_id || !description) {
        return res
          .status(400)
          .json({ error: 'category_id and description are required.' })
      }
      const updatedCategory = await updateCategoryDescription(
        category_id,
        description
      )
      if (!updatedCategory) {
        return res
          .status(401)
          .json({ error: 'Category description update failed!' })
      }
      res.status(200).json(updatedCategory)
    } catch (error) {
      console.error('Error updating category description:', error)
      res.status(500).json({ error: 'Failed to update category description.' })
    }
  }
)

app.post('/add-category', authenticateToken, async (req, res) => {
  try {
    const { name, month, year, total_expenses, description } = req.body
    if (!name || !month || !year || total_expenses === undefined) {
      return res.status(400).json({ error: 'All fields are required.' })
    }
    const category = await createCategory(
      name,
      req.user.id,
      month,
      year,
      total_expenses,
      description
    )
    if (!category) {
      return res.status(400).json({ error: 'Category creation failed!' })
    }
    res.status(201).json(category)
  } catch (error) {
    console.error('Error creating category:', error)
    res.status(500).json({ error: 'Failed to create category.' })
  }
})

app.delete(
  '/delete-category/:category_id',
  authenticateToken,
  async (req, res) => {
    try {
      const { category_id } = req.params
      if (!category_id) {
        return res.status(400).json({ error: 'category_id is required.' })
      }
      await deleteCategory(category_id)
      res.status(204).send()
    } catch (error) {
      console.error('Error deleting category:', error)
      if (error.message === 'CATEGORY_NOT_FOUND') {
        return res.status(404).json({ error: 'Category not found!' })
      }
      res.status(500).json({ error: 'Failed to delete category.' })
    }
  }
)

// Delete if it's not been used
app.get('/all-expenses', authenticateToken, async (req, res) => {
  const expenses = await getOrganizedExpenses(req.user.id)
  if (!expenses) {
    return res.status(401).json({ error: 'Data fetch failed!' })
  }
  console.log('Data fetch successfully!')
  return res.status(200).json(expenses)
})

app.get('/all-monthly-expenses', authenticateToken, async (req, res) => {
  try {
    const date = new Date()
    const month = date.getMonth() + 1
    const year = date.getFullYear()
    const expenses = await getExpensesByMonth(req.user.id, month, year)
    if (!expenses) {
      return res.status(401).json({ error: 'Expenses fetch failed!' })
    }
    console.log('Data fetch successfully!')
    return res.status(200).json(expenses)
  } catch (error) {
    console.error('Error fetching monthly expenses:', error)
    return res.status(500).json({ error: 'Failed to fetch monthly expenses.' })
  }
})

app.post('/create-expense', authenticateToken, async (req, res) => {
  try {
    const { name, amount, category_id, date, notes } = req.body
    if (!name || !amount || !category_id || !date) {
      return res.status(400).json({ error: 'All fields are required.' })
    }
    const expense = await createExpense(
      name,
      req.user.id,
      amount,
      category_id,
      date,
      notes
    )
    if (!expense) {
      return res.status(500).json({ error: 'Expense creation failed!' })
    }
    res.status(201).json(expense)
  } catch (error) {
    console.error('Error creating expense:', error)
    res.status(500).json({ error: 'Failed to create expense.' })
  }
})

app.put('/update-expense', authenticateToken, async (req, res) => {
  try {
    const { id, name, amount, category_id, date, notes } = req.body
    if (!id || !name || !amount || !category_id || !date) {
      return res.status(400).json({ error: 'Invalid expense data!' })
    }
    const updates = { name, amount, category_id, date, notes }
    const updatedExpense = await updateExpense(id, updates)
    if (!updatedExpense) {
      return res.status(404).json({ error: 'Expense not found!' })
    }
    res.status(200).json(updatedExpense)
  } catch (err) {
    console.error('Error updating expense:', err)
    if (err.message === 'EXPENSE_NOT_FOUND') {
      return res.status(404).json({ error: 'Expense not found!' })
    } else if (err.message === 'INVALID_EXPENSE_DATA') {
      return res.status(400).json({ error: 'Invalid expense data!' })
    } else {
      return res.status(500).json({ error: 'Unknown server error.' })
    }
  }
})

app.delete(
  '/delete-expense/:expense_id',
  authenticateToken,
  async (req, res) => {
    try {
      const { expense_id } = req.params
      if (!expense_id) {
        return res.status(400).json({ error: 'expense_id is required.' })
      }
      await deleteExpense(expense_id)
      res.status(204).send()
    } catch (error) {
      console.error('Error deleting expense:', error)
      if (error.message === 'EXPENSE_NOT_FOUND') {
        return res.status(404).json({ error: 'Expense not found!' })
      }
      res.status(500).json({ error: 'Failed to delete expense.' })
    }
  }
)

app.delete('/delete-user', authenticateToken, async (req, res) => {
  try {
    await deleteUser(req.user.id)
    console.log('User deleted successfully!')
    res.status(204).send()
  } catch (error) {
    if (error.message === 'USER_NOT_FOUND') {
      return res.status(404).json({ error: 'User not found!' })
    } else if (error.message === 'USER_DELETION_FAILED') {
      return res.status(500).json({ error: 'User deletion failed!' })
    }
    console.error('Error deleting user:', error)
    return res.status(500).json({ error: 'Failed to delete user.' })
  }
})

app.post('/change-password', authenticateToken, async (req, res) => {
  try {
    const { oldPassword, newPassword } = req.body
    if (!oldPassword || !newPassword) {
      return res
        .status(400)
        .json({ error: 'Old and new passwords are required.' })
    }
    const match = await bcrypt.compare(oldPassword, user.password)
    if (!match) {
      console.log('Invalid credentials!')
      return res.status(401).json({ error: 'Invalid credentials!' })
    }
    const new_password_hash = await bcrypt.hash(newPassword, 10)
    const updated = await updatePassword(req.user.id, new_password_hash)
    if (!updated) {
      return res.status(500).json({ error: 'Password update failed!' })
    }
    res.status(200).json({ message: 'Password updated successfully!' })
  } catch (error) {
    console.error('Error updating password:', error)
    res.status(500).json({ error: 'Failed to update password.' })
  }
})

app.post('/change-name', authenticateToken, async (req, res) => {
  try {
    const { new_firstname, new_lastname } = req.body
    if (!new_firstname || !new_lastname) {
      return res
        .status(400)
        .json({ error: 'First and last names are required.' })
    }
    const updated = await updateName(req.user.id, new_firstname, new_lastname)
    if (!updated) {
      return res.status(500).json({ error: 'Name update failed!' })
    }
    res.status(200).json({ message: 'Name updated successfully!' })
  } catch (error) {
    console.error('Error updating name:', error)
    res.status(500).json({ error: 'Failed to update name.' })
  }
})

// Need to be optimized
app.get('/history', authenticateToken, async (req, res) => {
  try {
    const history = await getHistoryByUser(req.user.id)
    for (const monthlyHistory of history) {
      const expenses = await getExpensesByMonth(
        req.user.id,
        monthlyHistory.month,
        monthlyHistory.year
      )
      monthlyHistory.expenses = expenses || []

      // CATEGORIES FETCHING NEEDS TO BE OPTIMIZED
      // Get unique category IDs from expenses
      const uniqueCategoryIds = [
        ...new Set((expenses || []).map(expense => expense.category_id))
      ]
      // Fetch unique categories
      const categories = await Promise.all(
        uniqueCategoryIds.map(id => getCategoryById(id))
      )
      monthlyHistory.categories = categories || []
    }
    if (!history) {
      return res.status(404).json({ error: 'History not found.' })
    }
    console.log('Data fetch successfully!')
    return res.status(200).json(history)
  } catch (error) {
    console.error('Error fetching history:', error)
    return res.status(500).json({ error: 'Failed to fetch history.' })
  }
})

const port = process.env.PORT || 10000

app.listen(port, () => {
  console.log(`Server listening on port ${port}...`)
})
