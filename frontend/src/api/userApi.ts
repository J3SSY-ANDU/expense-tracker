import { User } from '../types'
import {} from 'react-router-dom'
import { api } from './apiService'
import axios from 'axios'

/**
 * Fetches the current user's data from the backend API.
 *
 * Makes a GET request to the `/user-data` endpoint and returns the user data on success.
 * If an error occurs, returns an object containing an error message.
 *
 * @returns {Promise<User | { error: string }>} A promise that resolves to the user data or an error object.
 */
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

/**
 * Changes the user's password by sending the old and new passwords to the backend API.
 *
 * @param oldPassword - The user's current password.
 * @param newPassword - The new password to set for the user.
 * @returns A promise that resolves to an object containing either a success message or an error message.
 *
 */
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

/**
 * Sends a request to change the user's first and last name.
 *
 * @param newFirstname - The new first name to update.
 * @param newLastname - The new last name to update.
 * @returns A promise that resolves to an object containing either a success message or an error message.
 *
 */
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

/**
 * Deletes the current user by sending a DELETE request to the backend.
 *
 * On successful deletion:
 * - Removes the authentication token from localStorage.
 * - Redirects the user to the signup page.
 *
 * @returns {Promise<void | { error: string }>} Resolves with void on success, or an error object on failure.
 *
 * @throws Will return an error object if the request fails or if there is a network/server error.
 */
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
