import { api } from './apiService'

export async function ResetForgotPassword (
  token: string,
  new_password: string
): Promise<void> {
  try {
    const res = await api.post('/reset-forgot-password', {
      token,
      new_password
    })
    if (res.status === 200) {
      console.log('Password reset successfully')
      window.location.href = '/login'
    }
  } catch (err) {
    console.error(`Error resetting password ${err}`)
  }
}
