import { Resend } from "resend";
import { config } from "../config.js";

const getResendClient = () => {
  if (!config.resendApiKey) {
    return null;
  }

  return new Resend(config.resendApiKey);
};

const sendEmail = async (to: string, subject: string, html: string) => {
  const resend = getResendClient();
  if (!resend) {
    console.warn("RESEND_API_KEY not configured. Falling back to console code output.");
    return false;
  }

  const { error } = await resend.emails.send({
    from: config.emailFrom,
    to,
    subject,
    html
  });

  if (error) {
    throw new Error(`Email send failed: ${error.message}`);
  }

  return true;
};

export const sendVerificationCodeEmail = async (email: string, code: string) => {
  return sendEmail(
    email,
    "Your Self Serve verification code",
    `<div style="font-family:Arial,sans-serif;line-height:1.5">
      <h2>Verify your Self Serve account</h2>
      <p>Use this code to verify your email:</p>
      <p style="font-size:28px;font-weight:bold;letter-spacing:3px">${code}</p>
      <p>This code expires in 15 minutes.</p>
    </div>`
  );
};

export const sendPasswordResetCodeEmail = async (email: string, code: string) => {
  return sendEmail(
    email,
    "Your Self Serve password reset code",
    `<div style="font-family:Arial,sans-serif;line-height:1.5">
      <h2>Reset your Self Serve password</h2>
      <p>Use this code to reset your password:</p>
      <p style="font-size:28px;font-weight:bold;letter-spacing:3px">${code}</p>
      <p>This code expires in 15 minutes.</p>
    </div>`
  );
};
