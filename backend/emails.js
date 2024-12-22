const nodemailer = require("nodemailer");
const dotenv = require("dotenv").config();
const { getEmailConfirmationToken } = require("./database/emailConfirmation");
const { getForgotPasswordToken } = require("./database/forgotPassword");

const transporter = nodemailer.createTransport({
  service: "gmail", // Replace with your email provider
  auth: {
    user: process.env.EMAIL, // Your email
    pass: process.env.EMAIL_PASSWORD, // Your email password or app password
  },
});

const sendEmail = async (email, user_id) => {
    try {
        const token = await getEmailConfirmationToken(user_id);
        if (!token) {
            console.log("Token not found.");
            return null;
        }

        const verificationUrl = `${process.env.CLIENT_URL}/verify-email?token=${token}`;

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
        return null;
    }
}

const forgotPasswordEmail = async (email) => {
    try {
        const token = await getForgotPasswordToken(email);
        if (!token) {
            console.log("Token not found.");
            return null;
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
        return null;
    }
}

module.exports = { sendEmail, forgotPasswordEmail };
