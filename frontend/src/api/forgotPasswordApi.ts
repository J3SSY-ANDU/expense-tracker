import axios from 'axios'
import { api } from './apiService'

/**
 * Sends a forgot password request to the backend API with the provided email address.
 *
 * @param email - The email address of the user requesting a password reset.
 * @returns A promise that resolves to `void` if the email was sent successfully,
 *          or an object containing an error message if the request failed.
 *
 */
export async function ForgotPassword (
  email: string
): Promise<void | { error: string }> {
  try {
    await api.post('/forgot-password', { email })
    console.log('Email sent successfully')
  } catch (err: any) {
    // If it's an Axios error, get the backend error message if present
    if (axios.isAxiosError(err) && err.response && err.response.data) {
      return { error: err.response.data.error || 'Unknown error occurred.' }
    }
    // Otherwise, return a generic error
    return { error: 'Failed to connect to the server. Please try again later.' }
  }
}
