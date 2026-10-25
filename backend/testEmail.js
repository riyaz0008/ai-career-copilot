
import "dotenv/config";
import { sendEmail } from "./utils/emailService.js";

const testEmail = async () => {
    try {
        const result = await sendEmail({
            to: process.env.TEST_EMAIL_TO,
            subject: "AI Career Copilot - Test Email",
            text: "Brevo email integration is working.",
            html: `
                <h2>AI Career Copilot</h2>
                <p>Brevo email integration is working successfully.</p>
            `
        });

        console.log("Email sent successfully:", result.messageId);
    } catch (error) {
        console.error("Email sending failed:", error.message);
    }
};

testEmail();
