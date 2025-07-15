import { User } from '../types'
import { api } from './apiService'

export async function SignUp (
  firstname: string,
  lastname: string,
  email: string,
  password: string
): Promise<{ user: User; token: string } | { error: string }> {
  try {
    const res = await api.post('/process-signup', {
      firstname,
      lastname,
      email,
      password
    })
    if (res.status === 200) {
      console.log('Signed up successfully')
      return res.data.user
    } else {
      console.log('Failed to sign up')
      return {
        error:
          res.data.error ?? 'An error occurred during signup. Please try again.'
      }
    }
  } catch (err) {
    console.error(`Error signing up ${err}`)
    return { error: 'Failed to connect to the server. Please try again later.' }
  }
}
