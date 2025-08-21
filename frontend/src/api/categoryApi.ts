import axios from 'axios'
import { Category, NewCategory } from '../types'
import { api } from './apiService'

/**
 * Fetches all categories data from the backend API.
 *
 * @returns {Promise<Category[] | { error: string }>}
 *   A promise that resolves to an array of Category objects on success,
 *   or an object containing an error message on failure.
 *
 */
export async function FetchCategoriesData (): Promise<
  Category[] | { error: string }
> {
  try {
    const res = await api.get('/all-categories')
    return res.data
  } catch (err: any) {
    // If it's an Axios error, get the backend error message if present
    if (axios.isAxiosError(err) && err.response && err.response.data) {
      return { error: err.response.data.error || 'Unknown error occurred.' }
    }
    // Otherwise, return a generic error
    return { error: 'Failed to connect to the server. Please try again later.' }
  }
}

/**
 * Generates default categories in the backend.
 *
 * Sends a GET request to the `/generate-default-categories` endpoint.
 *
 * @returns A promise that resolves to void if successful, or an object containing an error message if the operation fails.
 *
 */
export async function GenerateCategoryData (): Promise<void | {
  error: string
}> {
  try {
    await api.get('/generate-default-categories')
    console.log('Default categories generated successfully.')
  } catch (err: any) {
    // If it's an Axios error, get the backend error message if present
    if (axios.isAxiosError(err) && err.response && err.response.data) {
      return { error: err.response.data.error || 'Unknown error occurred.' }
    }
    // Otherwise, return a generic error
    return { error: 'Failed to connect to the server. Please try again later.' }
  }
}

/**
 * Fetches a specific category by its ID.
 *
 * @param category_id The ID of the category to fetch.
 * @returns A promise that resolves to the Category object if found,
 *          or an object containing an error message if not found.
 */
export async function GetCategory (
  category_id: string
): Promise<Category | { error: string }> {
  try {
    const res = await api.get(`/get-category?category_id=${category_id}`)
    return res.data
  } catch (err: any) {
    // If it's an Axios error, get the backend error message if present
    if (axios.isAxiosError(err) && err.response && err.response.data) {
      return { error: err.response.data.error || 'Unknown error occurred.' }
    }
    // Otherwise, return a generic error
    return { error: 'Failed to connect to the server. Please try again later.' }
  }
}

/**
 * Adds a new category.
 *
 * @param category The category data to add.
 * @returns A promise that resolves to the created Category object,
 *          or an object containing an error message if the operation fails.
 */
export async function AddCategory (
  category: NewCategory
): Promise<Category | { error: string }> {
  try {
    const { name, month, year, total_expenses, description } = category
    const res = await api.post('/add-category', {
      name,
      month,
      year,
      total_expenses,
      description
    })
    return res.data
  } catch (err: any) {
    // If it's an Axios error, get the backend error message if present
    if (axios.isAxiosError(err) && err.response && err.response.data) {
      return { error: err.response.data.error || 'Unknown error occurred.' }
    }
    // Otherwise, return a generic error
    return { error: 'Failed to connect to the server. Please try again later.' }
  }
}

/**
 * Updates the name of a specific category.
 *
 * @param category_id The ID of the category to update.
 * @param name The new name for the category.
 * @returns A promise that resolves to the updated Category object,
 *          or an object containing an error message if the operation fails.
 */
export async function UpdateCategoryName (
  category_id: string,
  name: string
): Promise<Category | { error: string }> {
  try {
    const res = await api.post('/update-category-name', { category_id, name })
    return res.data
  } catch (err: any) {
    // If it's an Axios error, get the backend error message if present
    if (axios.isAxiosError(err) && err.response && err.response.data) {
      return { error: err.response.data.error || 'Unknown error occurred.' }
    }
    // Otherwise, return a generic error
    return { error: 'Failed to connect to the server. Please try again later.' }
  }
}

/**
 * Updates the description of a specific category.
 *
 * @param category_id The ID of the category to update.
 * @param description The new description for the category.
 * @returns A promise that resolves to the updated Category object,
 *          or an object containing an error message if the operation fails.
 */
export async function UpdateCategoryDescription (
  category_id: string,
  description: string
): Promise<Category | { error: string }> {
  try {
    const res = await api.post(`/update-category-description`, {
      category_id,
      description
    })
    return res.data
  } catch (err: any) {
    // If it's an Axios error, get the backend error message if present
    if (axios.isAxiosError(err) && err.response && err.response.data) {
      return { error: err.response.data.error || 'Unknown error occurred.' }
    }
    // Otherwise, return a generic error
    return { error: 'Failed to connect to the server. Please try again later.' }
  }
}

/**
 * Updates the budget of a specific category.
 *
 * @param category_id The ID of the category to update.
 * @param budget The new budget for the category.
 * @returns A promise that resolves to the updated Category object,
 *          or an object containing an error message if the operation fails.
 */
export async function UpdateCategoryBudget (
  category_id: string,
  budget: number
): Promise<Category | { error: string }> {
  try {
    const res = await api.post('/update-category-budget', {
      category_id,
      budget
    })
    return res.data
  } catch (err: any) {
    // If it's an Axios error, get the backend error message if present
    if (axios.isAxiosError(err) && err.response && err.response.data) {
      return { error: err.response.data.error || 'Unknown error occurred.' }
    }
    // Otherwise, return a generic error
    return { error: 'Failed to connect to the server. Please try again later.' }
  }
}

/**
 * Updates the icon of a specific category.
 *
 * @param category_id - The unique identifier of the category to update.
 * @param icon - The new icon to assign to the category.
 * @returns A promise that resolves to the updated `Category` object, or an object containing an error message.
 *
 * @remarks
 * This function sends a POST request to the `/update-category-icon` endpoint.
 * If the request fails, it returns an error message, either from the backend or a generic one.
 */
export async function UpdateCategoryIcon (
  category_id: string,
  icon: string
): Promise<Category | { error: string }> {
  try {
    const res = await api.post('/update-category-icon', { category_id, icon })
    return res.data
  } catch (err: any) {
    // If it's an Axios error, get the backend error message if present
    if (axios.isAxiosError(err) && err.response && err.response.data) {
      return { error: err.response.data.error || 'Unknown error occurred.' }
    }
    // Otherwise, return a generic error
    return { error: 'Failed to connect to the server. Please try again later.' }
  }
}

/**
 * Deletes a category by its ID.
 *
 * Sends a DELETE request to the backend API to remove the specified category.
 *
 * @param category_id - The unique identifier of the category to delete.
 * @returns A promise that resolves to `void` if successful, or an object containing an error message if the operation fails.
 *
 */
export async function DeleteCategory (
  category_id: string
): Promise<void | { error: string }> {
  try {
    await api.delete(`/delete-category/${category_id}`)
    console.log('Category deleted successfully.')
  } catch (err: any) {
    // If it's an Axios error, get the backend error message if present
    if (axios.isAxiosError(err) && err.response && err.response.data) {
      return { error: err.response.data.error || 'Unknown error occurred.' }
    }
    // Otherwise, return a generic error
    return { error: 'Failed to connect to the server. Please try again later.' }
  }
}
