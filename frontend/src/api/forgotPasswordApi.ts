export async function ForgotPassword(email: string): Promise<void> {
    try {
        const res = await fetch(`${process.env.REACT_APP_API_URL}/forgot-password`, {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
            },
            credentials: "include",
            body: JSON.stringify({ email }),
        });
        if (res.status === 200) {
            console.log("Email sent successfully");
        }
    } catch (err) {
        console.error(`Error sending email ${err}`);
    }
}