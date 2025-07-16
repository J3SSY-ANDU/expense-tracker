import axios from 'axios'
import { Category, NewCategory } from '../types'
import { api } from './apiService'

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

export async function GenerateCategoryData (): Promise<
  void | { error: string }
> {
  try {
    await api.get('/generate-default-categories')
    console.log("Default categories generated successfully.");
  } catch (err: any) {
    // If it's an Axios error, get the backend error message if present
    if (axios.isAxiosError(err) && err.response && err.response.data) {
      return { error: err.response.data.error || 'Unknown error occurred.' }
    }
    // Otherwise, return a generic error
    return { error: 'Failed to connect to the server. Please try again later.' }
  }
}

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

export async function AddCategory (
  category: NewCategory
): Promise<Category | { error: string }> {
  try {
    const res = await api.post('/add-category', { category })
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

export async function DeleteCategory (category_id: string): Promise<void | { error: string }> {
  try {
    await api.delete(`/delete-category/${category_id}`)
    console.log("Category deleted successfully.");
  } catch (err: any) {
    // If it's an Axios error, get the backend error message if present
    if (axios.isAxiosError(err) && err.response && err.response.data) {
      return { error: err.response.data.error || 'Unknown error occurred.' }
    }
    // Otherwise, return a generic error
    return { error: 'Failed to connect to the server. Please try again later.' }
  }
}
