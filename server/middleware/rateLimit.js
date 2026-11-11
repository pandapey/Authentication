import rateLimit from "express-rate-limit";

const isTest = process.env.NODE_ENV === "test";

// In tests the limits are raised so the functional suite doesn't trip them.
const maxOr = (max) => (isTest ? 1000 : max);

const jsonHandler = (message) => (req, res) => {
  res.status(429).json({ success: false, message });
};

// General safety net for all auth endpoints
export const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: maxOr(100),
  standardHeaders: "draft-7",
  legacyHeaders: false,
  handler: jsonHandler("Too many requests. Please try again later."),
});

// Stricter: password guessing
export const loginLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: maxOr(10),
  standardHeaders: "draft-7",
  legacyHeaders: false,
  handler: jsonHandler("Too many login attempts. Please try again later."),
});

// Stricter: OTP guessing (per-user attempt cap also enforced in controller)
export const otpLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: maxOr(10),
  standardHeaders: "draft-7",
  legacyHeaders: false,
  handler: jsonHandler("Too many verification attempts. Please try again later."),
});

// Stricter: OTP/reset email resends
export const resendLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: maxOr(5),
  standardHeaders: "draft-7",
  legacyHeaders: false,
  handler: jsonHandler("Too many resend requests. Please try again later."),
});
