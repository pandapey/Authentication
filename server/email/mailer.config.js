import nodemailer from "nodemailer";
import dotenv from "dotenv";

dotenv.config();

const GMAIL_USER = process.env.GMAIL_USER;
const GMAIL_APP_PASSWORD = process.env.GMAIL_APP_PASSWORD;

// Null when credentials are missing (local dev / tests) — email.js
// then skips sending instead of crashing.
const transporter =
  GMAIL_USER && GMAIL_APP_PASSWORD
    ? nodemailer.createTransport({
        service: "gmail",
        auth: {
          user: GMAIL_USER,
          pass: GMAIL_APP_PASSWORD,
        },
      })
    : null;

export const senderName = process.env.MAIL_SENDER_NAME || "AUTH App";

export const isEmailConfigured = () => Boolean(transporter);

export const getTransporter = () => transporter;
export const getSenderAddress = () =>
  GMAIL_USER
    ? `"${senderName}" <${GMAIL_USER}>`
    : `"${senderName}" <no-reply@localhost>`;
