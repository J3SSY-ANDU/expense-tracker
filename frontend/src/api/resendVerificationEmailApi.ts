import { api } from './apiService'
import axios from 'axios'

export async function ResendVerificationEmail (token: string): Promise<void | { error: string }> {
  try {
    await api.post('/resend-verification-email', { token })
    console.log('Email verification resent successfully')
  } catch (err: any) {
    // If it's an Axios error, get the backend error message if present
    if (axios.isAxiosError(err) && err.response && err.response.data) {
      return { error: err.response.data.error || 'Unknown error occurred.' }
    }
    // Otherwise, return a generic error
    return { error: 'Failed to connect to the server. Please try again later.' }
  }
}
