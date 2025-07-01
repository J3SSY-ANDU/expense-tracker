import { User } from "../types";

export async function Signup(
  firstname: string,
  lastname: string,
  email: string,
  password: string
): Promise<{user: User; token: string} | {error: string}> {
  try {
    const res = await fetch(`${process.env.REACT_APP_API_URL}/process-signup`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      credentials: "include",
      body: JSON.stringify({ firstname, lastname, email, password }),
    });
    if (res.status === 200) {
      console.log("Signed up successfully");
      const data = await res.json();
      return data.user;
    } else {
      console.log("Failed to sign up");
      const data = await res.json();
      return {error: data.error ?? "An error occurred during signup. Please try again."};
    }
  } catch (err) {
    console.error(`Error signing up ${err}`);
    return {error: "Failed to connect to the server. Please try again later."};
  }
}
