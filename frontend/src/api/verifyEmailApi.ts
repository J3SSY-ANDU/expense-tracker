import { api } from "./apiService";

export async function VerifyEmail(token: string): Promise<{ message?: string; token?: string; error?: string }> {
  try {
    const res = await api.get(`/verify-email?token=${encodeURIComponent(token)}`)
    if (res.status !== 200) {
      throw new Error(res.data.error || "Email verification failed.");
    }
    return res.data;
  } catch (err: any) {
    return { error: err.message || "Unknown error" };
  }
}
