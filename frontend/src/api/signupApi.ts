import { User } from "../types";

export async function Signup(
  firstname: string,
  lastname: string,
  email: string,
  password: string
): Promise<User | {}> {
  try {
    const res = await fetch(`${process.env.API_URL}/process-signup`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ firstname, lastname, email, password }),
    });
    if (res.status === 200) {
      console.log("Signed up successfully");
      return res.json();
    } else {
      console.log("Failed to sign up");
      return {};
    }
  } catch (err) {
    console.error(`Error signing up ${err}`);
    return {};
  }
}
