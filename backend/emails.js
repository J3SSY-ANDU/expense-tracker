const nodemailer = require("nodemailer");
const dotenv = require("dotenv").config({
    path:
        process.env.NODE_ENV === "production"
            ? ".env.production"
            : ".env.development",
});
const { getForgotPasswordToken } = require("./database/forgotPassword");
const { getUserById } = require("./database/users");
const { createEmailVerificationToken } = require("./database/emailVerification");

const transporter = nodemailer.createTransport({
    service: "gmail",
    auth: {
        user: process.env.EMAIL,
        pass: process.env.EMAIL_PASSWORD,
    },
});

const sendEmailVerification = async (email) => {
    try {
        const token = await createEmailVerificationToken(email);

        const verificationUrl = `${process.env.CLIENT_URL}/verify-email/${token}`;

        const mailOptions = {
            from: process.env.EMAIL,
            to: email,
            subject: "Account Verification",
            html: `
                <h1>Verify Your Email</h1>
                <p>Thank you for signing up! Please verify your email by clicking the link below:</p>
                <a href="${verificationUrl}" target="_blank">Verify Email</a>
                <p>This link will expire in half an hour.</p>
            `,
        };

        await transporter.sendMail(mailOptions);
        console.log("Email sent successfully!");
    } catch (err) {
        console.error(`Error sending email: ${err}`);
        throw err;
    }
}

const forgotPasswordEmail = async (email) => {
    try {
        const token = await getForgotPasswordToken(email);
        if (!token) {
            console.log("Token not found.");
            throw new Error("TOKEN_NOT_FOUND");
        }

        const resetUrl = `${process.env.CLIENT_URL}/reset-forgot-password?token=${token}`;

        const mailOptions = {
            from: process.env.EMAIL,
            to: email,
            subject: "Reset Password",
            html: `
                <h1>Reset Your Password</h1>
                <p>You requested a password reset. Click the link below to reset your password:</p>
                <a href="${resetUrl}" target="_blank">Reset Password</a>
                <p>This link will expire in half an hour.</p>
            `,
        };

        await transporter.sendMail(mailOptions);
        console.log("Email sent successfully!");
    } catch (err) {
        console.error(`Error sending email: ${err}`);
        throw err;
    }
}

const deleteAccountEmail = async (name, email) => {
    try {
        const mailOptions = {
            from: process.env.EMAIL,
            to: email,
            subject: "Account Deletion Confirmation",
            html: `
                <p>Hey <strong>${name}</strong>,</p>
                <p>
                    Just a quick note to let you know that your <strong>Expense Tracker</strong> account has been successfully deleted.
                </p>
                <p>Here’s what this means:</p>
                <ul>
                    <li>✅ All your expenses and categories have been removed.</li>
                    <li>✅ You won’t be able to log in anymore.</li>
                    <li>✅ If you did this by mistake or change your mind, let us know—we’re happy to help!</li>
                </ul>
                <p>Thanks for trying <strong>Expense Tracker</strong>! We appreciate you and hope to see you again in the future.</p>
            `,
        };

        await transporter.sendMail(mailOptions);
        console.log("Email sent successfully!");
    } catch (err) {
        console.error(`Error sending email: ${err}`);
        throw err;
    }
}

module.exports = { sendEmailVerification, forgotPasswordEmail, deleteAccountEmail };
