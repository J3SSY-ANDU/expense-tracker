import axios from 'axios'
import { Expense, NewExpense } from '../types/Expense'
import { api } from './apiService'

export async function FetchExpensesData (): Promise<Expense[] | { error: string }> {
  try {
    const res = await api.get(`/all-monthly-expenses`)
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

export async function CreateExpense (
  expense: NewExpense
): Promise<Expense | { error: string }> {
  try {
    const { name, user_id, amount, category_id, date, notes } = expense
    const res = await api.post('/create-expense', {
      name,
      user_id,
      amount,
      category_id,
      date,
      notes
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

export async function UpdateExpense (
  expense: Expense
): Promise<Expense | { error: string }> {
  try {
    const { id, name, amount, category_id, date, notes } = expense
    const res = await api.put('/update-expense', {
      id,
      name,
      amount,
      category_id,
      date,
      notes
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

export async function DeleteExpense (expense_id: string): Promise<boolean | { error: string }> {
  try {
    const res = await api.post('/delete-expense', { expense_id })
    return res.data;
  } catch (err: any) {
    // If it's an Axios error, get the backend error message if present
    if (axios.isAxiosError(err) && err.response && err.response.data) {
      return { error: err.response.data.error || 'Unknown error occurred.' }
    }
    // Otherwise, return a generic error
    return { error: 'Failed to connect to the server. Please try again later.' }
  }
}
