import { Request, Response, NextFunction } from "express";

/**
 * Factory that creates a middleware restricting access
 * to the listed roles only.
 *
 * Usage: `router.get("/admin/stats", roleGuard("ADMIN", "SUPER_ADMIN"), handler)`
 */
export function roleGuard(...allowedRoles: string[]) {
  return (req: Request, res: Response, next: NextFunction) => {
    if (!req.user) {
      res.status(401).json({ success: false, message: "Not authenticated" });
      return;
    }

    if (!allowedRoles.includes(req.user.role)) {
      res.status(403).json({ success: false, message: "Insufficient permissions" });
      return;
    }

    next();
  };
}
