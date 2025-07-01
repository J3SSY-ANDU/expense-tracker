export async function VerifyEmail(token: string): Promise<{ message?: string; token?: string; error?: string }> {
  try {
    const res = await fetch(`${process.env.REACT_APP_API_URL}/verify-email?token=${encodeURIComponent(token)}`, {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
      },
    });
    const data = await res.json();
    if (!res.ok) {
      throw new Error(data.error || "Email verification failed.");
    }
    return data;
  } catch (err: any) {
    return { error: err.message || "Unknown error" };
  }
}
