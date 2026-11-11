import express from "express";
import dotenv from "dotenv";
import authRoutes from "./routes/authRoutes.js";
import cookieParser from "cookie-parser";
import cors from "cors";
import path from "path";
import { fileURLToPath } from "url";

dotenv.config();

const app = express();

// Required so express-rate-limit sees the real client IP behind proxies
app.set("trust proxy", 1);

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const projectRoot = path.resolve(__dirname, "..");

// Minimal security headers (no extra dependency)
app.use((req, res, next) => {
  res.setHeader("X-Content-Type-Options", "nosniff");
  res.setHeader("X-Frame-Options", "DENY");
  res.setHeader("X-XSS-Protection", "0");
  res.setHeader("Referrer-Policy", "strict-origin-when-cross-origin");
  res.setHeader(
    "Permissions-Policy",
    "camera=(), microphone=(), geolocation=()"
  );
  next();
});

app.use(cookieParser());
app.use(express.json({ limit: "100kb" }));
app.use(express.urlencoded({ extended: false, limit: "100kb" }));
app.use(
  cors({
    origin: process.env.CLIENT_URL || "http://localhost:5173",
    credentials: true,
  })
);

app.use("/api/auth", authRoutes);

app.get("/api/health", (req, res) => {
  res.status(200).json({ success: true, message: "Server is running" });
});

if (process.env.NODE_ENV === "production") {
  app.use(express.static(path.join(projectRoot, "client", "dist")));
  // SPA fallback — app.use avoids Express 5 `*` path-to-regexp breakage
  app.use((req, res) => {
    if (req.method !== "GET" || req.path.startsWith("/api/")) {
      return res.status(404).json({ success: false, message: "Not found" });
    }
    res.sendFile(path.resolve(projectRoot, "client", "dist", "index.html"));
  });
}

// 404 for unknown API routes (dev + prod)
app.use("/api", (req, res) => {
  res.status(404).json({ success: false, message: "Not found" });
});

// Global error handler — never leak stacks to clients
// eslint-disable-next-line no-unused-vars
app.use((err, req, res, next) => {
  console.error("Unhandled error:", err);
  const status = err.status || 500;
  res.status(status).json({
    success: false,
    message:
      process.env.NODE_ENV === "production"
        ? "Internal server error"
        : err.message || "Internal server error",
  });
});

export default app;
