import {
  getTransporter,
  getSenderAddress,
} from "./mailer.config.js";
import {
  PASSWORD_RESET_REQUEST_TEMPLATE,
  PASSWORD_RESET_SUCCESS_TEMPLATE,
  VERIFICATION_EMAIL_TEMPLATE,
} from "./emailTemplates.js";

// If Gmail credentials are missing, sending is skipped so local dev
// and tests work without an email provider.
const skipIfUnconfigured = (action) => {
  if (!getTransporter()) {
    console.log(`Email skipped (no GMAIL_USER/GMAIL_APP_PASSWORD): ${action}`);
    return true;
  }
  return false;
};

const sendMail = async (to, subject, html, category) => {
  const info = await getTransporter().sendMail({
    from: getSenderAddress(),
    to,
    subject,
    html,
  });
  console.log(`${category} email sent to ${to}:`, info.messageId);
};

export const sendVerificationEmail = async (email, verificationCode) => {
  if (skipIfUnconfigured(`verification to ${email}`)) return;
  try {
    await sendMail(
      email,
      "Verify your email",
      VERIFICATION_EMAIL_TEMPLATE.replace(
        "{verificationCode}",
        verificationCode
      ),
      "Verification"
    );
  } catch (err) {
    console.log("Error sending verification email:", err?.message ?? err);
    throw new Error("Failed to send verification email");
  }
};

export const sendWelcomeEmail = async (email, name) => {
  if (skipIfUnconfigured(`welcome to ${email}`)) return;
  try {
    await sendMail(
      email,
      "Welcome to AUTH!",
      `<p>Hi ${name},</p><p>Your email has been verified. Welcome aboard!</p>`,
      "Welcome"
    );
  } catch (error) {
    console.log("Error sending welcome email:", error?.message ?? error);
    throw new Error("Failed to send welcome email");
  }
};

export const sendPasswordResetEmail = async (email, resetURL) => {
  if (skipIfUnconfigured(`password reset to ${email}`)) return;
  try {
    await sendMail(
      email,
      "Reset your password",
      PASSWORD_RESET_REQUEST_TEMPLATE.replace("{resetURL}", resetURL),
      "Password Reset"
    );
  } catch (error) {
    console.log("Error sending password reset email:", error?.message ?? error);
    throw new Error("Failed to send password reset email");
  }
};

export const sendResetSuccessEmail = async (email) => {
  if (skipIfUnconfigured(`reset confirmation to ${email}`)) return;
  try {
    await sendMail(
      email,
      "Password Reset Successful",
      PASSWORD_RESET_SUCCESS_TEMPLATE,
      "Password Reset"
    );
  } catch (error) {
    console.log("Error sending reset confirmation email:", error?.message ?? error);
    throw new Error("Failed to send password reset confirmation email");
  }
};
