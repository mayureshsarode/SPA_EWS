import { Request, Response, NextFunction } from "express";
import jwt from "jsonwebtoken";

const JWT_SECRET = process.env.JWT_SECRET || "spa-ews-dev-secret";

export interface JwtPayload {
  userId: string;
  role: string;
  departmentId: string;
  adminRole?: string; // DEPARTMENT_ADMIN, SUPER_ADMIN, NONE
}

// Extend Express Request to carry our user
declare global {
  namespace Express {
    interface Request {
      user?: JwtPayload;
    }
  }
}

/**
 * Verifies the JWT from the `token` cookie and attaches
 * the decoded payload to `req.user`.
 */
export function authenticate(req: Request, res: Response, next: NextFunction) {
  const token = req.cookies?.token;

  if (!token) {
    res.status(401).json({ success: false, message: "Not authenticated" });
    return;
  }

  try {
    const decoded = jwt.verify(token, JWT_SECRET) as JwtPayload;
    req.user = decoded;
    next();
  } catch {
    res.status(401).json({ success: false, message: "Invalid or expired token" });
    return;
  }
}
