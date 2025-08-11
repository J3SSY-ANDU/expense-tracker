const { connectionPool } = require('./db')
const dotenv = require('dotenv').config({
  path:
    process.env.NODE_ENV === 'production'
      ? '.env.production'
      : '.env.development'
})
const { v4: uuidv4 } = require('uuid')
const { categoriesData } = require('./categoriesData')
const cron = require('node-cron');
const { getAllUsers } = require('./users')

;(async () => {
  await connectionPool.query(`
        CREATE TABLE IF NOT EXISTS categories (
            id VARCHAR(100) PRIMARY KEY NOT NULL,
            user_id VARCHAR(100) NOT NULL,
            name VARCHAR(50) NOT NULL,
            month INT NOT NULL,
            year INT NOT NULL,
            budget DECIMAL(10,2) DEFAULT NULL,
            total_expenses DECIMAL(10,2) NOT NULL,
            description TEXT,
            icon VARCHAR(50) DEFAULT NULL,
            \`order\` INT AUTO_INCREMENT UNIQUE NOT NULL,
            FOREIGN KEY (user_id) REFERENCES users(id),
            UNIQUE (user_id, name, month, year)
        );
    `)
  console.log('Table created successfully!')
})()

const createCategory = async (
  name,
  user_id,
  month,
  year,
  budget = 0,
  total_expenses = 0,
  description = '',
  icon = ''
) => {
  if (await getCategoryByMonthYear(name, user_id, month, year)) {
    console.log(`Category already exists.`)
    return null
  }
  const id = uuidv4()
  await connectionPool.query(
    `INSERT INTO categories (id, user_id, name, month, year, budget, total_expenses, description, icon) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`,
    [id, user_id, name, month, year, budget, total_expenses, description, icon]
  )
  const category = await getCategoryById(id)
  if (!category) {
    console.log(`Failed. Try again.`)
    return null
  }
  console.log('Category created successfully!')
  return category
}

const createDefaultCategories = async (user_id, connection) => {
  const date = new Date()
  const month = date.getMonth() + 1
  const year = date.getFullYear()
  // Prepare values for bulk insert
  const values = categoriesData.map(category => [
    uuidv4(),
    user_id,
    category.name,
    month,
    year,
    0,
    category.total_expenses,
    category.description,
    category.icon
  ])
  // Insert all categories in one query
  await (connection || connectionPool).query(
    `INSERT IGNORE INTO categories (id, user_id, name, month, year, budget, total_expenses, description, icon)
     VALUES ${values.map(() => '(?, ?, ?, ?, ?, ?, ?, ?, ?)').join(', ')}`,
    values.flat()
  )
  console.log('Default categories created successfully!')
}

const getCategoriesByUser = async user_id => {
  const [categories] = await connectionPool.query(
    `SELECT * FROM categories WHERE user_id = ?`,
    [user_id]
  )
  return categories
}

const getCategoriesByMonth = async (user_id, month, year) => {
  const [categories] = await connectionPool.query(
    `SELECT * FROM categories WHERE user_id = ? AND month = ? AND year = ?`,
    [user_id, month, year]
  )
  return categories
}

const getCategoryByMonthYear = async (name, user_id, month, year) => {
  const [categories] = await connectionPool.query(
    `SELECT * FROM categories WHERE name = ? AND user_id = ? AND month = ? AND year = ?`,
    [name, user_id, month, year]
  )
  if (!categories[0]) {
    console.log(`Category not found.`)
    return null
  }
  return categories[0]
}

const getOrderedCategories = async userId => {
  try {
    const date = new Date()
    const month = date.getUTCMonth() + 1
    const year = date.getFullYear()
    const [rows] = await connectionPool.query(
      `SELECT * FROM categories WHERE user_id = ? AND month = ? AND year = ? ORDER BY \`order\` ASC`,
      [userId, month, year]
    )
    return rows
  } catch (err) {
    console.error(`Error fetching ordered categories: ${err}`)
    return []
  }
}

const getCategoryById = async id => {
  const [category] = await connectionPool.query(
    `SELECT * FROM categories WHERE id = ?`,
    [id]
  )
  if (!category) {
    console.log(`Category not found.`)
    return null
  }
  return category[0]
}

const getCategoryByName = async (user_id, name) => {
  try {
    const [category] = await connectionPool.query(
      `SELECT * FROM categories WHERE name = ? AND user_id = ?`,
      [name, user_id]
    )
    if (!category) {
      console.log(`Category not found.`)
      return null
    }
    return category[0]
  } catch (err) {
    console.error(`Error getting category: ${err}`)
    return null
  }
}

const updateCategoryName = async (id, name) => {
  try {
    await connectionPool.query(`UPDATE categories SET name = ? WHERE id = ?`, [
      name,
      id
    ])
    const updatedCategory = await getCategoryById(id)
    if (updatedCategory.name !== name) {
      console.log(`Failed. Try again.`)
      return null
    }
    console.log('Category updated successfully!')
    return updatedCategory
  } catch (err) {
    console.error(`Error updating category: ${err}`)
    return null
  }
}

const updateCategoryDescription = async (id, description) => {
  try {
    await connectionPool.query(
      `UPDATE categories SET description = ? WHERE id = ?`,
      [description, id]
    )
    const updatedCategory = await getCategoryById(id)
    if (updatedCategory.description !== description) {
      console.log(`Failed. Try again.`)
      return null
    }
    console.log('Category updated successfully!')
    return updatedCategory
  } catch (err) {
    console.error(`Error updating category: ${err}`)
    return null
  }
}

const updateCategoryBudget = async (id, budget) => {
  try {
    await connectionPool.query(`UPDATE categories SET budget = ? WHERE id = ?`, [
      budget,
      id
    ])
    const updatedCategory = await getCategoryById(id)
    if (Number(updatedCategory.budget) !== budget) {
      console.log(`Failed. Try again.`)
      return null
    }
    console.log('Category budget updated successfully!')
    return updatedCategory
  } catch (err) {
    console.error(`Error updating category budget: ${err}`)
    return null
  }
}

const updateCategoryTotalExpenses = async (id, amount) => {
  try {
    const category = await getCategoryById(id)
    const newAmount = parseFloat(category.total_expenses) + parseFloat(amount)
    await connectionPool.query(
      `UPDATE categories SET total_expenses = ? WHERE id = ?`,
      [newAmount, id]
    )
    const updatedCategory = await getCategoryById(id)
    if (parseFloat(updatedCategory.total_expenses) !== newAmount) {
      console.log(`Failed. Try again.`)
      return null
    }
    console.log('Category updated successfully!')
    return updatedCategory
  } catch (err) {
    console.error(`Error updating category: ${err}`)
    return null
  }
}

const updateCategoryIcon = async (id, icon) => {
  try {
    await connectionPool.query(`UPDATE categories SET icon = ? WHERE id = ?`, [
      icon,
      id
    ])
    const updatedCategory = await getCategoryById(id)
    if (updatedCategory.icon !== icon) {
      console.log(`Failed. Try again.`)
      return null
    }
    console.log('Category icon updated successfully!')
    return updatedCategory
  } catch (err) {
    console.error(`Error updating category icon: ${err}`)
    return null
  }
}

const deleteCategory = async id => {
  const category = await getCategoryById(id)
  if (!category) {
    console.log(`Category not found.`)
    throw new Error('CATEGORY_NOT_FOUND')
  }
  await connectionPool.query(`DELETE FROM categories WHERE id = ?`, [id])
  console.log('Category deleted successfully!')
}

cron.schedule('0 0 * * *', async () => {
  // Runs every day at midnight
  const now = new Date();
  if (now.getDate() !== 1) return; // Only run on the first day of the month

  const month = now.getMonth() + 1; // JS months are 0-indexed
  const year = now.getFullYear();

  const lastMonth = month === 1 ? 12 : month - 1;
  const lastYear = month === 1 ? year - 1 : year;

  const users = await getAllUsers(); // implement this function

  for (const user of users) {
    const categoriesThisMonth = await getCategoriesByMonth(user.id, month, year);
    if (categoriesThisMonth.length > 0) continue; // Already created

    const categoriesLastMonth = await getCategoriesByMonth(user.id, lastMonth, lastYear);

    for (const cat of categoriesLastMonth) {
      await createCategory(
        cat.name,
        user.id,
        month,
        year,
        cat.budget,
        0, // reset expenses
        cat.description,
        cat.icon
      );
    }
    console.log(`Created categories for user ${user.id} for ${month}/${year}`);
  }
});

module.exports = {
  createCategory,
  createDefaultCategories,
  getCategoryById,
  getCategoryByName,
  getCategoriesByUser,
  updateCategoryName,
  updateCategoryDescription,
  updateCategoryBudget,
  updateCategoryTotalExpenses,
  updateCategoryIcon,
  deleteCategory,
  getOrderedCategories,
  getCategoryByMonthYear
}
