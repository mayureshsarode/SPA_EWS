import { Request, Response } from "express";
import { loginUser, getUserById } from "../services/auth.service";

const COOKIE_OPTIONS = {
  httpOnly: true,
  secure: process.env.NODE_ENV === "production",
  sameSite: "lax" as const,
  maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days
  path: "/",
};

/**
 * POST /api/auth/login
 * Body: { email, password, role }
 */
export async function login(req: Request, res: Response) {
  const { email, password, role } = req.body;

  if (!email || !password || !role) {
    res.status(400).json({ success: false, message: "Email, password and role are required" });
    return;
  }

  const { token, profile } = await loginUser({ email, password, role });

  res.cookie("token", token, COOKIE_OPTIONS);
  res.json({ success: true, user: profile });
}

/**
 * GET /api/auth/me
 * Returns the current user's profile from the JWT cookie.
 */
export async function me(req: Request, res: Response) {
  if (!req.user) {
    res.status(401).json({ success: false, message: "Not authenticated" });
    return;
  }

  const profile = await getUserById(req.user.userId);
  res.json({ success: true, user: profile });
}

/**
 * POST /api/auth/logout
 * Clears the JWT cookie.
 */
export async function logout(_req: Request, res: Response) {
  res.clearCookie("token", { path: "/" });
  res.json({ success: true, message: "Logged out" });
}

/**
 * PUT /api/auth/change-password
 * Body: { currentPassword, newPassword }
 */
export async function changePassword(req: Request, res: Response) {
  const { currentPassword, newPassword } = req.body;
  if (!currentPassword || !newPassword) {
    res.status(400).json({ success: false, message: "Missing required fields" });
    return;
  }
  const data = await import("../services/auth.service").then(m => m.changePasswordUser(req.user!.userId, currentPassword, newPassword));
  res.json({ success: true, ...data });
}

export async function requestOtpHandler(req: Request, res: Response) {
  const { email } = req.body;
  if (!email) {
    res.status(400).json({ success: false, message: "Email required" });
    return;
  }
  const data = await import("../services/auth.service").then(m => m.requestAdminOtp(email));
  res.json({ success: true, ...data });
}

export async function verifyOtpHandler(req: Request, res: Response) {
  const { email, otp } = req.body;
  if (!email || !otp) {
    res.status(400).json({ success: false, message: "Missing fields" });
    return;
  }
  const { token, profile } = await import("../services/auth.service").then(m => m.verifyAdminOtp(email, otp));
  res.cookie("token", token, COOKIE_OPTIONS);
  res.json({ success: true, user: profile });
}

export async function forgotPassword(req: Request, res: Response) {
  const { email } = req.body;
  console.log(`Mocking password reset email to ${email}`);
  res.json({ success: true, message: "If an account matches, a reset link has been sent." });
}
