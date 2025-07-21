import { User } from '../types'
import {} from 'react-router-dom'
import { api } from './apiService'
import axios from 'axios'

export async function FetchUserData (): Promise<User | { error: string }> {
  try {
    const res = await api.get('/user-data')
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

export async function ChangePassword (
  oldPassword: string,
  newPassword: string
): Promise<{ message: string } | { error: string }> {
  try {
    const res = await api.post('/change-password', { oldPassword, newPassword })
    console.log(res.data.message)
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

export async function ChangeName (
  newFirstname: string,
  newLastname: string
): Promise<{ message: string } | { error: string }> {
  try {
    const res = await api.post('/change-name', { newFirstname, newLastname })
    console.log(res.data.message)
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

export async function DeleteUser (): Promise<void | { error: string }> {
  try {
    const res = await api.delete('/delete-user')
    localStorage.removeItem('authToken')
    window.location.href = '/signup'
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
