export async function ResetForgotPassword(token: string, new_password: string): Promise<void> {
    try {
        const res = await fetch(`${process.env.API_URL}/reset-forgot-password`, {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
            },
            credentials: "include",
            body: JSON.stringify({ token, new_password }),
        });
        if (res.status === 200) {
            console.log("Password reset successfully");
            window.location.href = "/login";
        }
    } catch (err) {
        console.error(`Error resetting password ${err}`);
    }
}