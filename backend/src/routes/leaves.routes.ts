import { Router } from "express";
import { submitRequest, listRequests, updateStatus } from "../controllers/leaves.controller";
import { authenticate } from "../middleware/auth";
import { roleGuard } from "../middleware/role-guard";
import { asyncHandler } from "../middleware/error-handler";

const router = Router();

router.use(authenticate);

// Faculty requests DL/Exemption
router.post("/request", roleGuard("FACULTY"), asyncHandler(submitRequest));

// Admin/HOD manages requests
router.get("/", roleGuard("ADMIN", "SUPER_ADMIN", "FACULTY"), asyncHandler(listRequests));
router.put("/:requestId/status", roleGuard("ADMIN", "SUPER_ADMIN", "FACULTY"), asyncHandler(updateStatus));

export default router;
