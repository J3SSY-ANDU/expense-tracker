import { api } from "./apiService";
import axios from "axios";

export async function VerifyEmail(token: string): Promise<{ message?: string; token?: string; error?: string }> {
  try {
    const res = await api.get(`/verify-email?token=${encodeURIComponent(token)}`)
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
