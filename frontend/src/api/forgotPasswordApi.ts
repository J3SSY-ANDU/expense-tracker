import { api } from './apiService'

export async function ForgotPassword (email: string): Promise<void> {
  try {
    const res = await api.post('/forgot-password', { email })
    if (res.status === 200) {
      console.log('Email sent successfully')
    }
  } catch (err) {
    console.error(`Error sending email ${err}`)
  }
}
