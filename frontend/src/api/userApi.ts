import { User } from "../types";

export async function fetchUserData(): Promise<User | null> {
  try {
    const res = await fetch("/user-data", {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
      },
    });
    if (res.status === 200) {
      const userData: User = await res.json(); // Make sure that the response is of type User
      return userData;
    }
  } catch (err) {
    console.error(`Error fetching user data ${err}`);
  }
  return null;
}
