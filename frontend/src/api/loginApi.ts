import axios from 'axios';
import { api } from './apiService'

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
      return { error: err.response.data.error || "Unknown error occurred." };
    }
    // Otherwise, return a generic error
    return { error: "Failed to connect to the server. Please try again later." };
  }
}
