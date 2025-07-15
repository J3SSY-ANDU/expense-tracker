import { User } from '../types'
import {} from 'react-router-dom'
import { api } from './apiService'

export async function FetchUserData (): Promise<User | null> {
  try {
    const res = await api.get('/user-data')
    if (res.status === 200) {
      return res.data
    }
  } catch (err) {
    console.error(`Error fetching user data ${err}`)
  }
  return null
}

export async function GetUserVerificationStatus (
  id: string
): Promise<string | null> {
  try {
    const res = await api.get(`/verify-user-creation?id=${id}`)
    if (res.status === 200) {
      console.log('User creation verified')
      window.location.href = '/login'
      return 'Verified'
    } else if (res.status === 401) {
      console.log('User creation not verified')
      return 'Not Verified'
    } else if (res.status === 404) {
      console.log('User not found')
      window.location.href = '/signup'
      return 'Not Found'
    }
  } catch (err) {
    console.error(`Error verifying user creation ${err}`)
  }
  return null
}

export async function ChangePassword (
  oldPassword: string,
  newPassword: string
): Promise<boolean> {
  try {
    const res = await api.post('/change-password', { oldPassword, newPassword })
    if (res.status === 200) {
      return true
    }
  } catch (err) {
    console.error(`Error changing password ${err}`)
  }
  return false
}

export async function ChangeName (
  newFirstname: string,
  newLastname: string
): Promise<boolean> {
  try {
    const res = await api.post('/change-name', { newFirstname, newLastname })
    if (res.status === 200) {
      return true
    }
  } catch (err) {
    console.error(`Error changing name ${err}`)
  }
  return false
}

export async function DeleteUser (): Promise<boolean> {
  try {
    const res = await api.post("/delete-user");
    if (res.status === 200) {
      window.location.href = '/signup'
      return true
    }
  } catch (err) {
    console.error(`Error deleting user ${err}`)
  }
  return false
}
