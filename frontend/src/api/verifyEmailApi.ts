import { api } from './apiService'
import axios from 'axios'

/**
 * Verifies a user's email address using the provided token.
 *
 * Sends a GET request to the backend API to verify the email associated with the token.
 * Returns a message and a new token on success, or an error message on failure.
 *
 * @param token - The email verification token to be validated.
 * @returns A promise that resolves to an object containing either a success message and token,
 *          or an error message if verification fails.
 */
export async function VerifyEmail (
  token: string
): Promise<{ message?: string; token?: string; error?: string }> {
  try {
    const res = await api.get(`/verify-email/${encodeURIComponent(token)}`)
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
 * Resends the verification email to the user using one of the provided identifiers: id, token, or email.
 *
 * @param id - (Optional) The user's unique identifier.
 * @param token - (Optional) The verification token associated with the user.
 * @param email - (Optional) The user's email address.
 * @returns A promise that resolves to an object containing either a success message or an error message.
 *
 * @remarks
 * - At least one of `id`, `token`, or `email` must be provided.
 * - If the request fails due to a server or network error, an appropriate error message is returned.
 */
export async function ResendVerificationEmail (
  id?: string | null,
  token?: string | null,
  email?: string | null
): Promise<{ message: string } | { error: string }> {
  try {
    if (!id && !token && !email) {
      return {
        error:
          'User ID, token, or email is required to resend verification email.'
      }
    }
    // Pick only the one that is defined
    const payload: { id?: string; token?: string; email?: string } = {}
    if (id) payload.id = id
    else if (token) payload.token = token
    else if (email) payload.email = email

    await api.post('/resend-verification-email', payload)
    console.log('Email verification resent successfully')
    return { message: 'Verification email resent successfully!' }
  } catch (err: any) {
    // If it's an Axios error, get the backend error message if present
    if (axios.isAxiosError(err) && err.response && err.response.data) {
      return { error: err.response.data.error || 'Unknown error occurred.' }
    }
    // Otherwise, return a generic error
    return { error: 'Failed to connect to the server. Please try again later.' }
  }
}
