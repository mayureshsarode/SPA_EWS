import { Router } from "express";
import { getMarks, submitMarks } from "../controllers/marks.controller";
import { authenticate } from "../middleware/auth";
import { roleGuard } from "../middleware/role-guard";
import { asyncHandler } from "../middleware/error-handler";

const router = Router();

// Only faculty should enter marks
router.use(authenticate, roleGuard("FACULTY"));

router.get("/:offeringId/cie/:cieNumber", asyncHandler(getMarks));
router.post("/save", asyncHandler(submitMarks));

export default router;
