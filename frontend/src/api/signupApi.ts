import { api } from './apiService'
import axios from 'axios'

/**
 * Sends a signup request to the backend API with the provided user details.
 *
 * @param firstname - The first name of the user.
 * @param lastname - The last name of the user.
 * @param email - The email address of the user.
 * @param password - The password for the new account.
 * @returns A promise that resolves to an object containing either the user ID and email sent status,
 *          or an error message if the signup fails.
 *
 */
export async function SignUp (
  firstname: string,
  lastname: string,
  email: string,
  password: string
): Promise<{ user_id: string; emailSent: boolean } | { error: string }> {
  try {
    const res = await api.post('/process-signup', {
      firstname,
      lastname,
      email,
      password
    })
    console.log('Signed up successfully')
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
