export async function ResendVerificationEmail(token: string): Promise<void> {
  try {
    const res = await fetch(`${process.env.REACT_APP_API_URL}/resend-verification-email`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      credentials: "include",
      body: JSON.stringify({ token }),
    });
    if (res.status === 200) {
      console.log("Email verification resent successfully");
    } else {
      throw new Error(res.statusText);
    }
  } catch (err) {
    console.error(`Error resending email verification ${err}`);
  }
}