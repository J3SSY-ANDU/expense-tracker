import { User } from "../types";
import { } from "react-router-dom";

export async function FetchUserData(): Promise<User | null> {
  try {
    const res = await fetch(`${process.env.REACT_APP_API_URL}/user-data`, {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
      },
      credentials: "include",
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

export async function GetUserVerificationStatus(id: string): Promise<string | null> {
  try {
    const res = await fetch(`${process.env.REACT_APP_API_URL}/verify-user-creation?id=${id}`, {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
      },
      credentials: "include",
    });
    if (res.status === 200) {
      console.log("User creation verified");
      window.location.href = "/login";
      return 'Verified';
    } else if (res.status === 401) {
      console.log("User creation not verified");
      return 'Not Verified';
    } else if (res.status === 404) {
      console.log("User not found");
      window.location.href = "/signup";
      return 'Not Found';
    }
  } catch (err) {
    console.error(`Error verifying user creation ${err}`);
  }
  return null;
}

export async function ChangePassword(
  oldPassword: string,
  newPassword: string
): Promise<boolean> {
  try {
    const res = await fetch(`${process.env.REACT_APP_API_URL}/change-password`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      credentials: "include",
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
    const res = await fetch(`${process.env.REACT_APP_API_URL}/change-name`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      credentials: "include",
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
    const res = await fetch(`${process.env.REACT_APP_API_URL}/delete-user`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      credentials: "include",
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
