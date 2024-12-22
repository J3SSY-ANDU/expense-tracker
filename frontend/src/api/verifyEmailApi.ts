export async function VerifyEmail(token: string): Promise<void> {
  try {
    const res = await fetch("/verify-email", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ token }),
    });
    if (res.status === 200) {
      console.log("Email verified successfully");
      window.location.href = "/";
    } else {
      throw new Error(res.statusText);
    }
  } catch (err) {
    console.error(`Error verifying email ${err}`);
  }
}
