import { api } from './apiService'
import axios from 'axios'

export async function VerifyEmail(
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

export async function ResendVerificationEmail(
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
