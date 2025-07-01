const token = localStorage.getItem("authToken");
export async function Logout(): Promise<void> {
  try {
    const res = await fetch(`${process.env.REACT_APP_API_URL}/logout`, {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${token}`, // Include the token in the Authorization header
        "Content-Type": "application/json",
      },
      credentials: "include",
    });
    if (res.status === 200) {
      console.log("Logged out successfully");
      localStorage.removeItem("authToken"); // Clear the token from local storage
      window.location.href = "/login";
    }
  } catch (err) {
    console.error(`Error logging out ${err}`);
  }
}