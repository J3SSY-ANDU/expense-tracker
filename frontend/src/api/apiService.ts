import axios from "axios";
import { User } from "../types";

const api = axios.create({
    baseURL: process.env.REACT_APP_API_URL,
    timeout: 1000,
    headers: {
        "Content-Type": "application/json",
    }
})

// Add a request interceptor
api.interceptors.request.use(
    (config) => {
        const token = localStorage.getItem("authToken");
        if (token) {
            config.headers.Authorization = `Bearer ${token}`;
        }
        return config;
    },
    (error) => Promise.reject(error)
);

const apiService = {
    signUp: async (
        firstname: string,
        lastname: string,
        email: string,
        password: string
    ): Promise<{ user: User; token: string } | { error: string }> => {
        try {
            const res = await api.post("/process-signup", { firstname, lastname, email, password })
            if (res.status === 200) {
                console.log("Signed up successfully");
                return res.data.user;
            } else {
                console.log("Failed to sign up");
                return { error: res.data.error ?? "An error occurred during signup. Please try again." };
            }
        } catch (err) {
            console.error(`Error signing up ${err}`);
            return { error: "Failed to connect to the server. Please try again later." };
        }
    },
    signIn: async (
        email: string,
        password: string
    ): Promise<{ user: User, token: string } | { error: string }> => {
        try {
            const res = await api.post("/process-login", { email, password })
            if (res.status === 200) {
                console.log("Login successful!");
                return res.data;
            } else {
                console.error("Login failed!");
                return { error: res.data.error ?? "Unknown error occurred." };
            }
        } catch (err) {
            console.error(`Error fetching the API: ${err}`);
            return { error: "Failed to connect to the server. Please try again later." };
        }
    }
}

export default apiService

