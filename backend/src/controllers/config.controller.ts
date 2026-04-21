import { Request, Response } from "express";
import { getConfig, setConfigBulk } from "../services/config.service";

/**
 * GET /api/config
 * Public — returns all system config as key-value map.
 */
export async function getConfigHandler(_req: Request, res: Response) {
  const data = await getConfig();
  res.json({ success: true, data });
}

/**
 * PUT /api/config
 * Admin only — bulk updates config keys.
 * Body: { "attendance_threshold": "75", "maintenance_mode": "false", ... }
 */
export async function updateConfigHandler(req: Request, res: Response) {
  const entries = req.body;

  if (!entries || typeof entries !== "object" || Object.keys(entries).length === 0) {
    res.status(400).json({ success: false, message: "Request body must be a non-empty object" });
    return;
  }

  const result = await setConfigBulk(entries, req.user!.userId);
  res.json({ success: true, ...result });
}
