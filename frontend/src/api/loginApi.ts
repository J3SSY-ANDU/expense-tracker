import { User } from '../types'
import { api } from './apiService'

export async function LogIn (
  email: string,
  password: string
): Promise<{ user: User; token: string } | { error: string }> {
  try {
    const res = await api.post('/process-login', { email, password })
    if (res.status === 200) {
      console.log('Login successful!')
      return res.data
    } else {
      console.error('Login failed!')
      return { error: res.data.error ?? 'Unknown error occurred.' }
    }
  } catch (err) {
    console.error(`Error fetching the API: ${err}`)
    return { error: 'Failed to connect to the server. Please try again later.' }
  }
}
