import { Router } from "express";
import { getConfigHandler, updateConfigHandler } from "../controllers/config.controller";
import { authenticate } from "../middleware/auth";
import { roleGuard } from "../middleware/role-guard";
import { asyncHandler } from "../middleware/error-handler";

const router = Router();

// Public — any authenticated user can read config
router.get("/", asyncHandler(getConfigHandler));

// Admin only — update system config
router.put("/", authenticate, roleGuard("ADMIN", "SUPER_ADMIN"), asyncHandler(updateConfigHandler));

export default router;
