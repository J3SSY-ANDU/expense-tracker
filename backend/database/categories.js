const { connectionPool } = require("./db");
const dotenv = require("dotenv").config();
const { v4: uuidv4 } = require("uuid");

(async () => {
  await connectionPool.query(`
        CREATE TABLE IF NOT EXISTS categories (
            id VARCHAR(100) PRIMARY KEY NOT NULL,
            user_id VARCHAR(100) NOT NULL,
            name VARCHAR(50) NOT NULL,
            total_expenses DECIMAL(10,2) NOT NULL,
            description TEXT,
            \`order\` INT AUTO_INCREMENT UNIQUE NOT NULL,
            FOREIGN KEY (user_id) REFERENCES users(id),
            UNIQUE (user_id, name)
        );
    `);
  console.log("Table created successfully!");
})();

const createCategory = async (name, user_id, total_expenses, description) => {
  try {
    if (await getCategoryByName(user_id, name)) {
      console.log(`Category already exists.`);
      return null;
    }
    const id = uuidv4();
    await connectionPool.query(
      `INSERT INTO categories (id, user_id, name, total_expenses, description) VALUES (?, ?, ?, ?, ?)`,
      [id, user_id, name, total_expenses, description]
    );
    const category = await getCategoryById(id);
    if (!category) {
      console.log(`Failed. Try again.`);
      return null;
    }
    console.log("Category created successfully!");
    return category;
  } catch (err) {
    console.error(`Error creating category: ${err}`);
    return null;
  }
};

const getCategoriesByUser = async (user_id) => {
  try {
    const [categories] = await connectionPool.query(
      `SELECT * FROM categories WHERE user_id = ?`,
      [user_id]
    );
    return categories;
  } catch (err) {
    console.error(`Error getting categories: ${err}`);
    return null;
  }
};

const getOrderedCategories = async (userId) => {
  try {
    const [rows] = await connectionPool.query(
      `SELECT * FROM categories WHERE user_id = ? ORDER BY \`order\` ASC`,
      [userId]
    );
    return rows;
  } catch (err) {
    console.error(`Error fetching ordered categories: ${err}`);
    return [];
  }
};

const getCategoryById = async (id) => {
  try {
    const [category] = await connectionPool.query(
      `SELECT * FROM categories WHERE id = ?`,
      [id]
    );
    if (!category) {
      console.log(`Category not found.`);
      return null;
    }
    return category[0];
  } catch (err) {
    console.error(`Error getting category: ${err}`);
    return null;
  }
};

const getCategoryByName = async (user_id, name) => {
  try {
    const [category] = await connectionPool.query(
      `SELECT * FROM categories WHERE name = ? AND user_id = ?`,
      [name, user_id]
    );
    if (!category) {
      console.log(`Category not found.`);
      return null;
    }
    return category[0];
  } catch (err) {
    console.error(`Error getting category: ${err}`);
    return null;
  }
};

const updateCategoryName = async (id, name) => {
  try {
    await connectionPool.query(`UPDATE categories SET name = ? WHERE id = ?`, [
      name,
      id,
    ]);
    const updatedCategory = await getCategoryById(id);
    if (updatedCategory.name !== name) {
      console.log(`Failed. Try again.`);
      return null;
    }
    console.log("Category updated successfully!");
    return updatedCategory;
  } catch (err) {
    console.error(`Error updating category: ${err}`);
    return null;
  }
};

const updateCategoryDescription = async (id, description) => {
  try {
    await connectionPool.query(
      `UPDATE categories SET description = ? WHERE id = ?`,
      [description, id]
    );
    const updatedCategory = await getCategoryById(id);
    if (updatedCategory.description !== description) {
      console.log(`Failed. Try again.`);
      return null;
    }
    console.log("Category updated successfully!");
    return updatedCategory;
  } catch (err) {
    console.error(`Error updating category: ${err}`);
    return null;
  }
};

const updateCategoryTotalExpenses = async (id, amount) => {
  try {
    const category = await getCategoryById(id);
    const newAmount = parseFloat(category.total_expenses) + parseFloat(amount);
    await connectionPool.query(
      `UPDATE categories SET total_expenses = ? WHERE id = ?`,
      [newAmount, id]
    );
    const updatedCategory = await getCategoryById(id);
    if (parseFloat(updatedCategory.total_expenses) !== newAmount) {
      console.log(`Failed. Try again.`);
      return null;
    }
    console.log("Category updated successfully!");
    return updatedCategory;
  } catch (err) {
    console.error(`Error updating category: ${err}`);
    return null;
  }
};

const deleteCategory = async (id) => {
  try {
    await connectionPool.query(`DELETE FROM categories WHERE id = ?`, [id]);
    console.log("Category deleted successfully!");
    return true;
  } catch (err) {
    console.error(`Error deleting category: ${err}`);
    return false;
  }
};

module.exports = {
  createCategory,
  getCategoryById,
  getCategoryByName,
  getCategoriesByUser,
  updateCategoryName,
  updateCategoryDescription,
  updateCategoryTotalExpenses,
  deleteCategory,
  getOrderedCategories,
};
