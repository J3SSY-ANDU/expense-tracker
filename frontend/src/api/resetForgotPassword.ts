import { api } from './apiService'
import axios from 'axios'

/**
 * Resets the user's password using a provided reset token and new password.
 *
 * Sends a POST request to the `/reset-forgot-password` endpoint with the reset token and new password.
 * On success, redirects the user to the login page.
 * On failure, returns an error object containing the error message.
 *
 * @param token - The password reset token received by the user.
 * @param new_password - The new password to set for the user.
 * @returns A promise that resolves to void on success, or an object with an error message on failure.
 */
export async function ResetForgotPassword (
  token: string,
  new_password: string
): Promise<void | { error: string }> {
  try {
    await api.post('/reset-forgot-password', {
      token,
      new_password
    })
    console.log('Password reset successfully')
    window.location.href = '/login'
  } catch (err: any) {
    // If it's an Axios error, get the backend error message if present
    if (axios.isAxiosError(err) && err.response && err.response.data) {
      return { error: err.response.data.error || 'Unknown error occurred.' }
    }
    // Otherwise, return a generic error
    return { error: 'Failed to connect to the server. Please try again later.' }
  }
}
