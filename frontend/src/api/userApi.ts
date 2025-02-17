import { User } from "../types";

export async function FetchUserData(): Promise<User | null> {
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

export async function ChangePassword(
  oldPassword: string,
  newPassword: string
): Promise<boolean> {
  try {
    const res = await fetch("/change-password", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ oldPassword, newPassword }),
    });
    if (res.status === 200) {
      return true;
    }
  } catch (err) {
    console.error(`Error changing password ${err}`);
  }
  return false;
}

export async function ChangeName(newFirstname: string, newLastname: string): Promise<boolean> {
  try {
    const res = await fetch("/change-name", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ newFirstname, newLastname }),
    });
    if (res.status === 200) {
      return true;
    }
  } catch (err) {
    console.error(`Error changing name ${err}`);
  }
  return false;
}

export async function DeleteUser(): Promise<boolean> {
  try {
    const res = await fetch("/delete-user", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
    });
    if (res.status === 200) {
      window.location.href = "/signup";
      return true;
    }
  } catch (err) {
    console.error(`Error deleting user ${err}`);
  }
  return false;
}
