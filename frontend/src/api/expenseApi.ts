import axios from 'axios'
import { Expense, NewExpense } from '../types/Expense'
import { api } from './apiService'

/**
 * Fetches all monthly expenses from the backend API.
 *
 * @returns {Promise<Expense[] | { error: string }>} A promise that resolves to an array of expenses on success,
 * or an object containing an error message on failure.
 *
 */
export async function FetchExpensesData (): Promise<
  Expense[] | { error: string }
> {
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

/**
 * Creates a new expense by sending a POST request to the backend API.
 *
 * @param expense - The new expense data to be created.
 * @returns A promise that resolves to the created `Expense` object, or an object containing an error message.
 *
 * @remarks
 * - If the API call is successful, the created expense is returned.
 * - If an Axios error occurs, the backend error message is returned if available.
 * - If another error occurs, a generic error message is returned.
 */
export async function CreateExpense (
  expense: NewExpense
): Promise<Expense | { error: string }> {
  try {
    const { name, amount, category_id, date, notes } = expense
    const res = await api.post('/create-expense', {
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

/**
 * Updates an existing expense in the backend.
 *
 * @param expense - The expense object containing updated information.
 * @returns A promise that resolves to the updated Expense object, or an object containing an error message.
 *
 */
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

/**
 * Deletes an expense by its ID.
 *
 * Sends a DELETE request to the backend API to remove the specified expense.
 *
 * @param expense_id - The unique identifier of the expense to be deleted.
 * @returns A promise that resolves to void if successful, or an object containing an error message if the operation fails.
 *
 */
export async function DeleteExpense (
  expense_id: string
): Promise<void | { error: string }> {
  try {
    await api.delete(`/delete-expense/${expense_id}`)
    console.log(`Expense deleted successfully.`)
  } catch (err: any) {
    // If it's an Axios error, get the backend error message if present
    if (axios.isAxiosError(err) && err.response && err.response.data) {
      return { error: err.response.data.error || 'Unknown error occurred.' }
    }
    // Otherwise, return a generic error
    return { error: 'Failed to connect to the server. Please try again later.' }
  }
}
