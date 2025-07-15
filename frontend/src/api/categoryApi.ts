import { Category, NewCategory } from '../types'
import { api } from './apiService'

export async function FetchCategoriesData (): Promise<Category[] | null> {
  try {
    const res = await api.get('/all-categories')
    if (res.status === 200) {
      return res.data
    }
  } catch (err) {
    console.error(`Error fetching categories data ${err}`)
  }
  return null
}

export async function GenerateCategoryData (): Promise<Category[] | null> {
  try {
    const res = await api.get('/generate-default-categories')
    if (res.status === 200) {
      return res.data
    }
  } catch (err) {
    console.error(`Error generating categories data ${err}`)
  }
  return null
}

export async function GetCategory (
  category_id: string
): Promise<Category | null> {
  try {
    const res = await api.get(`/get-category?category_id=${category_id}`)
    if (res.status === 200) {
      return res.data
    }
  } catch (err) {
    console.error(`Error fetching category data ${err}`)
  }
  return null
}

export async function AddCategory (
  category: NewCategory
): Promise<Category | null> {
  try {
    const res = await api.post('/add-category', { category })
    if (res.status === 201) {
      return res.data
    }
  } catch (err) {
    console.error(`Error adding category ${err}`)
  }
  return null
}

export async function UpdateCategoryName (category_id: string, name: string) {
  try {
    const res = await api.post('/update-category-name', { category_id, name })
    if (res.status === 200) {
      return res.data
    }
  } catch (err) {
    console.error(`Error updating category ${err}`)
  }
  return null
}

export async function UpdateCategoryDescription (
  category_id: string,
  description: string
): Promise<Category | null> {
  try {
    const res = await api.post(`/update-category-description`, {
      category_id,
      description
    })
    if (res.status === 200) {
      return res.data
    }
  } catch (err) {
    console.error(`Error updating category ${err}`)
  }
  return null
}

export async function DeleteCategory (category_id: string): Promise<boolean> {
  try {
    const res = await api.post('/delete-category', { category_id })
    if (res.status === 200) {
      return true
    }
  } catch (err) {
    console.error(`Error deleting category ${err}`)
  }
  return false
}
