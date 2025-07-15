import { Expense, NewExpense } from '../types/Expense'
import { api } from './apiService'

export async function FetchExpensesData (): Promise<Expense[] | null> {
  try {
    const res = await api.get(`/all-monthly-expenses`)
    if (res.status === 200) {
      return res.data
    }
  } catch (err) {
    console.error(`Error fetching expenses data ${err}`)
  }
  return null
}

export async function CreateExpense (
  expense: NewExpense
): Promise<Expense | null> {
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
    if (res.status === 201) {
      return res.data
    }
  } catch (err) {
    console.error(`Error creating expense ${err}`)
  }
  return null
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
    if (res.status === 200) {
      return res.data
    } else {
      return res.data.error
        ? { error: res.data.error }
        : { error: 'Failed to update expense' }
    }
  } catch (err) {
    console.error(`Error updating expense ${err}`)
    return { error: 'Something went wrong. Please try again.' }
  }
}

export async function DeleteExpense (expense_id: string): Promise<boolean> {
  try {
    const res = await api.post('/delete-expense', { expense_id })
    if (res.status === 200) {
      return true
    }
  } catch (err) {
    console.error(`Error deleting expense ${err}`)
  }
  return false
}
