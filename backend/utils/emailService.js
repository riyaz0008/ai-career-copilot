
import nodemailer from "nodemailer";

const transporter = nodemailer.createTransport({
    host: process.env.BREVO_SMTP_HOST,
    port: Number(process.env.BREVO_SMTP_PORT || 587),
    secure: Number(process.env.BREVO_SMTP_PORT) === 465,
    auth: {
        user: process.env.BREVO_SMTP_USER,
        pass: process.env.BREVO_SMTP_KEY
    }
});

export const sendEmail = async ({ to, subject, text, html }) => {
    if (
        !process.env.BREVO_SMTP_USER ||
        !process.env.BREVO_SMTP_KEY ||
        !process.env.EMAIL_FROM
    ) {
        throw new Error("Email configuration is missing in .env");
    }

    return transporter.sendMail({
        from: {
            name: process.env.EMAIL_FROM_NAME || "AI Career Copilot",
            address: process.env.EMAIL_FROM
        },
        to,
        subject,
        text,
        html
    });
};

export default transporter;
