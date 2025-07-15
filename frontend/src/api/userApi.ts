import { User } from '../types'
import {} from 'react-router-dom'
import { api } from './apiService'
import axios from 'axios'

export async function FetchUserData (): Promise<User | { error: string }> {
  try {
    const res = await api.get('/user-data')
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

export async function GetUserVerificationStatus (
  id: string
): Promise<string | { error: string }> {
  try {
    const res = await api.get(`/verify-user-creation?id=${id}`)
    return res.data;
  } catch (err: any) {
    // If it's an Axios error, get the backend error message if present
    if (axios.isAxiosError(err) && err.response && err.response.data) {
      return { error: err.response.data.error || 'Unknown error occurred.' }
    }
    // Otherwise, return a generic error
    return { error: 'Failed to connect to the server. Please try again later.' }
  }
}

export async function ChangePassword (
  oldPassword: string,
  newPassword: string
): Promise<boolean | { error: string }> {
  try {
    const res = await api.post('/change-password', { oldPassword, newPassword })
    return res.data;
  } catch (err: any) {
    // If it's an Axios error, get the backend error message if present
    if (axios.isAxiosError(err) && err.response && err.response.data) {
      return { error: err.response.data.error || 'Unknown error occurred.' }
    }
    // Otherwise, return a generic error
    return { error: 'Failed to connect to the server. Please try again later.' }
  }
}

export async function ChangeName (
  newFirstname: string,
  newLastname: string
): Promise<boolean | { error: string }> {
  try {
    const res = await api.post('/change-name', { newFirstname, newLastname })
    return res.data;
  } catch (err: any) {
    // If it's an Axios error, get the backend error message if present
    if (axios.isAxiosError(err) && err.response && err.response.data) {
      return { error: err.response.data.error || 'Unknown error occurred.' }
    }
    // Otherwise, return a generic error
    return { error: 'Failed to connect to the server. Please try again later.' }
  }
}

export async function DeleteUser (): Promise<boolean | { error: string }> {
  try {
    const res = await api.post("/delete-user");
    window.location.href = '/signup'
    return res.data;
  } catch (err: any) {
    // If it's an Axios error, get the backend error message if present
    if (axios.isAxiosError(err) && err.response && err.response.data) {
      return { error: err.response.data.error || 'Unknown error occurred.' }
    }
    // Otherwise, return a generic error
    return { error: 'Failed to connect to the server. Please try again later.' }
  }
}
