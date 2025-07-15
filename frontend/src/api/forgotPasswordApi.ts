import axios from 'axios'
import { api } from './apiService'

export async function ForgotPassword (email: string): Promise<void | { error: string }> {
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
