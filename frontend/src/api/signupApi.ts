export async function Signup(
  firstname: string,
  lastname: string,
  email: string,
  password: string
): Promise<boolean> {
  try {
    const res = await fetch("/process-signup", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ firstname, lastname, email, password }),
    });
    if (res.status === 200) {
      console.log("Signed up successfully");
      return true;
    } else {
      console.log("Failed to sign up");
      return false;
    }
  } catch (err) {
    console.error(`Error signing up ${err}`);
    return false;
  }
}
