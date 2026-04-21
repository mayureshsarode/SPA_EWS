import express from "express";
import cors from "cors";
import cookieParser from "cookie-parser";
import path from "path";
import dotenv from "dotenv";

// Load .env from the backend root (one level up from src/)
dotenv.config({ path: path.resolve(__dirname, "../.env") });

import { connectMongoDB } from "./config/mongoose";

import authRoutes from "./routes/auth.routes";
import studentRoutes from "./routes/student.routes";
import facultyRoutes from "./routes/faculty.routes";
import adminRoutes from "./routes/admin.routes";
import attendanceRoutes from "./routes/attendance.routes";
import marksRoutes from "./routes/marks.routes";
import leavesRoutes from "./routes/leaves.routes";
import configRoutes from "./routes/config.routes";
import chatRoutes from "./routes/chat.routes";
import { globalErrorHandler } from "./middleware/error-handler";

const app = express();
const PORT = process.env.PORT || 5000;

// ─── Middleware ────────────────────────────────────────────
app.use(cors({
  origin: true,       // Allow all origins in dev
  credentials: true,  // Allow cookies
}));
app.use(express.json());
app.use(cookieParser());

// Request logger
app.use((req, _res, next) => {
  console.log(`[${new Date().toISOString()}] ${req.method} ${req.url}`);
  next();
});

// ─── Health Check ─────────────────────────────────────────
app.get("/api/health", (_req, res) => {
  res.json({ status: "ok", message: "SPA-EWS Backend is running" });
});

// ─── Routes ───────────────────────────────────────────────
app.use("/api/auth", authRoutes);
app.use("/api/students", studentRoutes);
app.use("/api/faculty", facultyRoutes);
app.use("/api/admin", adminRoutes);
app.use("/api/attendance", attendanceRoutes);
app.use("/api/marks", marksRoutes);
app.use("/api/leaves", leavesRoutes);
app.use("/api/config", configRoutes);
app.use("/api/chat", chatRoutes);

// ─── Global Error Handler (must be last) ──────────────────
app.use(globalErrorHandler);

// ─── Start Server ─────────────────────────────────────────
async function start() {
  // Connect to MongoDB (non-blocking — chat is optional)
  await connectMongoDB();

  app.listen(PORT, () => {
    console.log(`[server]: SPA-EWS Backend running at http://localhost:${PORT}`);
  });
}

start();
