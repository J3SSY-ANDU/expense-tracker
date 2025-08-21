import { Budget } from '../types'
import { api } from './apiService'
import axios from 'axios'

/**
 * Fetches the budget data from the backend API.
 *
 * @returns A promise that resolves to the Budget object on success,
 *          or an object containing an error message on failure.
 */
export const FetchBudgetData = async (): Promise<
  Budget | { error: string }
> => {
  try {
    const budget = await api.get('/get-budget')
    return budget.data
  } catch (err) {
    // If it's an Axios error, get the backend error message if present
    if (axios.isAxiosError(err) && err.response && err.response.data) {
      return { error: err.response.data.error || 'Unknown error occurred.' }
    }
    // Otherwise, return a generic error
    return { error: 'Failed to connect to the server. Please try again later.' }
  }
}

/**
 * Adds a new budget entry.
 *
 * @param id The ID of the budget to update.
 * @param amount The amount to add to the budget.
 * @returns A promise that resolves to the updated Budget object,
 *          or an object containing an error message if the operation fails.
 */
export const AddBudget = async (
  id: string,
  amount: number
): Promise<Budget | { error: string }> => {
  try {
    const budget = await api.post('/add-budget', {
      budget_id: id,
      total_income: amount
    })
    return budget.data
  } catch (err) {
    // If it's an Axios error, get the backend error message if present
    if (axios.isAxiosError(err) && err.response && err.response.data) {
      return { error: err.response.data.error || 'Unknown error occurred.' }
    }
    // Otherwise, return a generic error
    return { error: 'Failed to connect to the server. Please try again later.' }
  }
}
