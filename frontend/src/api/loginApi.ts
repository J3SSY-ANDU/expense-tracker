import { User } from "../types";

export async function Login(email: string, password: string): Promise<User | {error: string}> {
    try {
        const res = await fetch(`${process.env.REACT_APP_API_URL}/process-login`, {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
            },
            credentials: "include",
            body: JSON.stringify({ email, password }),
        });
        if (res.status === 200) {
            console.log("Login successful!");
            return res.json();
        } else {
            console.error("Login failed!");
            const data = await res.json();
            return {error: data.error ?? "Unknown error occurred."};
        }
    } catch (err) {
        console.error(`Error fetching the API: ${err}`);
        return {error: "Failed to connect to the server. Please try again later."};
    }
}