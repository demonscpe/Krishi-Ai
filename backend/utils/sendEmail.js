const nodemailer = require("nodemailer");
const { EMAIL_USER, EMAIL_PASS } = require("../config/env");

const transporter = nodemailer.createTransport({
  service: "gmail",
  auth: {
    user: EMAIL_USER,
    pass: EMAIL_PASS,
  },
});

/**
 * Send Email
 */
const sendEmail = async (to, subject, html) => {
  try {
    await transporter.sendMail({
      from: `"Krishi-Ai" <${EMAIL_USER}>`,
      to,
      subject,
      html,
    });

    console.log(`📧 Email sent to ${to}`);
  } catch (error) {
    console.error("❌ Email error:", error.message);
    throw error;
  }
};

/**
 * Verification Email
 */
const sendVerificationEmail = async (email, token) => {
  const url = `${process.env.FRONTEND_URL}/verify-account?token=${token}`;

  const html = `
    <h2>Verify Your Account</h2>
    <p>Click below to verify:</p>
    <a href="${url}">${url}</a>
  `;

  return sendEmail(email, "Verify your account", html);
};

module.exports = {
  sendEmail,
  sendVerificationEmail,
};