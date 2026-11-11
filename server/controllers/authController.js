import User from "../models/userModel.js";
import bcryptjs from "bcryptjs";
import crypto from "crypto";
import { generateOTP } from "../utils/generateVerificationToken.js";
import { generateTokenAndSetCookie } from "../utils/generateTokenAndSetCookie.js";
import {
  sendVerificationEmail,
  sendWelcomeEmail,
  sendPasswordResetEmail,
  sendResetSuccessEmail,
} from "../email/email.js";
import dotenv from "dotenv";

dotenv.config();

const isProduction = process.env.NODE_ENV === "production";

// Max wrong OTP guesses before the code is invalidated
const MAX_OTP_ATTEMPTS = 5;
// Min time between OTP sends (also enforced by the client timer)
const RESEND_COOLDOWN_MS = 60 * 1000;

// Strip secrets that must never leave the API (password hash, OTP,
// reset tokens). Call on user._doc before sending a user object.
const sanitizeUser = (userDoc) => ({
  ...userDoc,
  password: undefined,
  verificationOTP: undefined,
  verificationOTPExpireAt: undefined,
  verificationAttempts: undefined,
  resetPasswordToken: undefined,
  resetPasswordExpireAt: undefined,
});

const normalizeEmail = (email) => String(email || "").trim().toLowerCase();

const isValidEmail = (email) =>
  /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email) && email.length <= 254;

// Reset tokens are stored hashed so a DB read alone can't hijack accounts.
const hashResetToken = (token) =>
  crypto.createHash("sha256").update(String(token)).digest("hex");

const validatePassword = (password) => {
  if (typeof password !== "string" || password.length < 6) {
    return "Password must be at least 6 characters long";
  }
  if (password.length > 72) {
    return "Password must be at most 72 characters long";
  }
  return null;
};

export const signup = async (req, res) => {
  const { email: rawEmail, password, name: rawName } = req.body;

  try {
    const email = normalizeEmail(rawEmail);
    const name = typeof rawName === "string" ? rawName.trim() : "";

    if (!name || !email || !password) {
      return res
        .status(400)
        .json({ success: false, message: "All fields are required" });
    }

    if (!isValidEmail(email)) {
      return res
        .status(400)
        .json({ success: false, message: "Please provide a valid email" });
    }

    if (name.length > 100) {
      return res.status(400).json({
        success: false,
        message: "Name is too long",
      });
    }

    const passwordError = validatePassword(password);
    if (passwordError) {
      return res.status(400).json({
        success: false,
        message: passwordError,
      });
    }

    const userAlreadyExists = await User.findOne({ email });
    if (userAlreadyExists) {
      return res
        .status(400)
        .json({ success: false, message: "User already exists." });
    }

    const hashPassword = await bcryptjs.hash(password, 10);
    const otp = generateOTP();
    const user = new User({
      email,
      password: hashPassword,
      name,
      lastLogin: Date.now(),
      verificationOTP: otp,
      verificationOTPExpireAt: Date.now() + 5 * 60 * 1000, // 5 minutes
      verificationAttempts: 0,
      lastOTPSentAt: Date.now(),
    });
    await user.save();
    // jwt
    generateTokenAndSetCookie(res, user._id);

    // Respond immediately so the UI navigates on click — the email
    // sends in the background (SMTP can take seconds; a send failure
    // never blocks signup — the code can be resent).
    res.status(201).json({
      success: true,
      message: "User created successfully",
      ...(isProduction ? {} : { otp }),
      user: sanitizeUser(user._doc),
    });

    // Background send (skipped when Gmail is not configured).
    sendVerificationEmail(user.email, otp).catch((emailError) =>
      console.log("verification email failed :", emailError.message)
    );
  } catch (error) {
    // Duplicate-key race (parallel signups with the same email)
    if (error?.code === 11000) {
      return res
        .status(400)
        .json({ success: false, message: "User already exists." });
    }
    res.status(400).json({ success: false, message: error.message });
    console.log("error in signup :", error);
  }
};

export const verifyEmail = async (req, res) => {
  const { code, email: rawEmail } = req.body;

  try {
    if (!code) {
      return res.status(400).json({
        success: false,
        message: "Verification code is required",
      });
    }

    const email = rawEmail ? normalizeEmail(rawEmail) : null;

    // Prefer email-scoped lookup so wrong guesses can be counted per user.
    // Falls back to code-only lookup for backwards compatibility.
    let user = null;
    if (email) {
      user = await User.findOne({ email }).select(
        "+verificationOTP +verificationOTPExpireAt"
      );
      if (!user) {
        return res.status(400).json({
          success: false,
          message: "Invalid or expired OTP",
        });
      }
      if (user.isVerified) {
        return res.status(400).json({
          success: false,
          message: "Email is already verified",
        });
      }
      if ((user.verificationAttempts || 0) >= MAX_OTP_ATTEMPTS) {
        return res.status(429).json({
          success: false,
          message: "Too many wrong attempts. Please request a new code.",
          attemptsLeft: 0,
        });
      }
      const isMatch =
        user.verificationOTP === code &&
        user.verificationOTPExpireAt &&
        user.verificationOTPExpireAt > Date.now();
      if (!isMatch) {
        user.verificationAttempts = (user.verificationAttempts || 0) + 1;
        const lockedOut = user.verificationAttempts >= MAX_OTP_ATTEMPTS;
        if (lockedOut) {
          // Invalidate the code so it can't be brute-forced further
          user.verificationOTP = undefined;
          user.verificationOTPExpireAt = undefined;
        }
        await user.save();
        return res.status(lockedOut ? 429 : 400).json({
          success: false,
          message: lockedOut
            ? "Too many wrong attempts. Please request a new code."
            : "Invalid or expired OTP",
          attemptsLeft: lockedOut
            ? 0
            : MAX_OTP_ATTEMPTS - user.verificationAttempts,
        });
      }
    } else {
      user = await User.findOne({
        verificationOTP: code,
        verificationOTPExpireAt: { $gt: Date.now() },
      }).select("+verificationOTP +verificationOTPExpireAt");

      if (!user) {
        return res.status(400).json({
          success: false,
          message: "Invalid or expired OTP",
        });
      }
    }

    user.isVerified = true;
    user.verificationOTP = undefined;
    user.verificationOTPExpireAt = undefined;
    user.verificationAttempts = 0;

    await user.save();

    res.json({
      success: true,
      message: "OTP verified successfully",
      user: sanitizeUser(user._doc),
    });

    sendWelcomeEmail(user.email, user.name).catch((emailError) =>
      console.log("welcome email failed :", emailError.message)
    );
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

export const resendVerification = async (req, res) => {
  const { email: rawEmail } = req.body;

  try {
    const email = normalizeEmail(rawEmail);
    if (!email) {
      return res.status(400).json({
        success: false,
        message: "Email is required",
      });
    }

    const user = await User.findOne({ email });

    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User not found",
      });
    }

    if (user.isVerified) {
      return res.status(400).json({
        success: false,
        message: "Email is already verified",
      });
    }

    // Server-side resend cooldown (the client timer alone is bypassable)
    if (
      user.lastOTPSentAt &&
      Date.now() - new Date(user.lastOTPSentAt).getTime() < RESEND_COOLDOWN_MS
    ) {
      const retryAfter = Math.ceil(
        (RESEND_COOLDOWN_MS -
          (Date.now() - new Date(user.lastOTPSentAt).getTime())) /
          1000
      );
      return res.status(429).json({
        success: false,
        message: `Please wait ${retryAfter}s before requesting a new code.`,
        retryAfter,
      });
    }

    const otp = generateOTP();
    user.verificationOTP = otp;
    user.verificationOTPExpireAt = Date.now() + 5 * 60 * 1000; // 5 minutes
    user.verificationAttempts = 0;
    user.lastOTPSentAt = Date.now();
    await user.save();

    // Only expose OTP in non-production for local testing
    if (isProduction) {
      res.status(200).json({
        success: true,
        message: "Verification code resent successfully",
      });
    } else {
      res.status(200).json({
        success: true,
        message: "Verification code resent successfully",
        otp,
      });
    }

    sendVerificationEmail(user.email, otp).catch((emailError) =>
      console.log("verification email failed :", emailError.message)
    );
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

export const login = async (req, res) => {
  const { email: rawEmail, password } = req.body;
  try {
    const email = normalizeEmail(rawEmail);
    if (!email || !password) {
      return res
        .status(400)
        .json({ success: false, message: "Email and password are required." });
    }
    const user = await User.findOne({ email }).select(
      "+password +verificationOTP +verificationOTPExpireAt +resetPasswordToken +resetPasswordExpireAt"
    );
    if (!user) {
      return res
        .status(400)
        .json({ success: false, message: "User does not exist." });
    }
    const isPasswordValid = await bcryptjs.compare(password, user.password);
    if (!isPasswordValid) {
      return res
        .status(400)
        .json({ success: false, message: "Password is incorrect." });
    }
    generateTokenAndSetCookie(res, user._id);
    user.lastLogin = Date.now();
    await user.save();
    res.status(200).json({
      success: true,
      message: "Logged in successfully",
      user: sanitizeUser(user._doc),
    });
  } catch (error) {
    console.log("error in login :", error);
    res.status(400).json({ success: false, message: error.message });
  }
};

export const logout = async (req, res) => {
  res.clearCookie("token", {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: process.env.NODE_ENV === "production" ? "strict" : "lax",
    path: "/",
  });
  res.status(200).json({ success: true, message: "Logged out successfully" });
};

export const forgotPassword = async (req, res) => {
  const { email: rawEmail } = req.body;

  try {
    const email = normalizeEmail(rawEmail);
    if (!email) {
      return res.status(400).json({
        success: false,
        message: "Email is required",
      });
    }

    const user = await User.findOne({ email });

    // Never reveal whether an account exists (prevents email enumeration).
    // In dev we still return the token when an account exists; otherwise
    // always respond with the same generic success message.
    if (!user) {
      if (isProduction) {
        return res.status(200).json({
          success: true,
          message: "If an account exists, a reset link has been sent.",
        });
      }
      return res.status(404).json({
        success: false,
        message: "User not found",
      });
    }

    // generate reset token (raw goes to the user, hash stays in the DB)
    const resetToken = crypto.randomBytes(20).toString("hex");

    user.resetPasswordToken = hashResetToken(resetToken);
    user.resetPasswordExpireAt = Date.now() + 1 * 60 * 60 * 1000;

    await user.save();

    const resetURL = `${
      process.env.CLIENT_URL || "http://localhost:5173"
    }/reset-password/${resetToken}`;

    // LOCAL/DEV MODE response (do not expose token in production)
    if (isProduction) {
      res.status(200).json({
        success: true,
        message: "If an account exists, a reset link has been sent.",
      });
    } else {
      res.status(200).json({
        success: true,
        message: "Reset token generated",
        resetToken,
      });
    }

    sendPasswordResetEmail(user.email, resetURL).catch((emailError) =>
      console.log("password reset email failed :", emailError.message)
    );
  } catch (error) {
    console.log("error in forgotPassword :", error);
    res.status(400).json({
      success: false,
      message: error.message,
    });
  }
};

export const resetPassword = async (req, res) => {
  try {
    const { password } = req.body;
    const { token } = req.params;
    const passwordError = validatePassword(password);
    if (passwordError) {
      return res.status(400).json({
        success: false,
        message: passwordError,
      });
    }
    if (!token) {
      return res
        .status(400)
        .json({ success: false, message: "Invalid token or session expired" });
    }
    const user = await User.findOne({
      resetPasswordToken: hashResetToken(token),
      resetPasswordExpireAt: {
        $gt: Date.now(),
      },
    }).select("+resetPasswordToken +resetPasswordExpireAt");
    if (!user) {
      return res
        .status(400)
        .json({ success: false, message: "Invalid token or session expired" });
    }
    //   update password
    const hashPassword = await bcryptjs.hash(password, 10);

    user.password = hashPassword;
    user.resetPasswordToken = undefined;
    user.resetPasswordExpireAt = undefined;
    await user.save();
    res
      .status(200)
      .json({ success: true, message: "Password reset successfully" });

    sendResetSuccessEmail(user.email).catch((emailError) =>
      console.log("reset confirmation email failed :", emailError.message)
    );
  } catch (error) {
    console.log("error in resetPassword :", error);
    res.status(400).json({ success: false, message: error.message });
  }
};

export const checkAuth = async (req, res) => {
  try {
    const user = await User.findById(req.userId).select(
      "-password -verificationOTP -verificationOTPExpireAt -verificationAttempts -resetPasswordToken -resetPasswordExpireAt"
    );
    if (!user) {
      return res
        .status(404)
        .send({ success: false, message: "User not found" });
    }
    res.status(200).json({ success: true, message: "User found", user: user });
  } catch (error) {
    console.log("error in checkAuth :", error);
    res.status(400).json({ success: false, message: error.message });
  }
};
