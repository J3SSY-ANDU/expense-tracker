export async function Login(email: string, password: string): Promise<boolean> {
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
            return true;
        } else {
            console.error("Login failed!");
            return false;
        }
    } catch (err) {
        console.error(`Error fetching the API: ${err}`);
        return false;
    }
}