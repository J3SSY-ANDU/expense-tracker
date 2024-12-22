export async function ForgotPassword(email: string): Promise<void> {
    try {
        const res = await fetch("/forgot-password", {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
            },
            body: JSON.stringify({ email }),
        });
        if (res.status === 200) {
            console.log("Email sent successfully");
        }
    } catch (err) {
        console.error(`Error sending email ${err}`);
    }
}