import axios from 'axios'
import { api } from './apiService'

/**
 * Attempts to log in a user with the provided email and password.
 *
 * Sends a POST request to the `/process-login` endpoint with the user's credentials.
 * On success, returns an object containing a JWT token.
 * On failure, returns an object containing an error message.
 *
 * @param email - The user's email address.
 * @param password - The user's password.
 * @returns A promise that resolves to an object with either a `token` property (on success)
 *          or an `error` property (on failure).
 */
export async function LogIn (
  email: string,
  password: string
): Promise<{ token: string } | { error: string }> {
  try {
    const res = await api.post('/process-login', { email, password })
    console.log('Login successful!')
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
