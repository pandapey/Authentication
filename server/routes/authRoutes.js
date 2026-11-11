import express from "express";
import {
  login,
  logout,
  signup,
  verifyEmail,
  resendVerification,
  forgotPassword,
  resetPassword,
  checkAuth,
} from "../controllers/authController.js";
import { verifyToken } from "../middleware/verifyToken.js";
import {
  authLimiter,
  loginLimiter,
  otpLimiter,
  resendLimiter,
} from "../middleware/rateLimit.js";

const router = express.Router();

router.use(authLimiter);

router.get("/check-auth", verifyToken, checkAuth);

router.post("/signup", signup);

router.post("/login", loginLimiter, login);

router.post("/logout", logout);

router.post("/verify-email", otpLimiter, verifyEmail);

router.post("/resend-verification", resendLimiter, resendVerification);

router.post("/forgot-password", resendLimiter, forgotPassword);

router.post("/reset-password/:token", resetPassword);

export default router;
