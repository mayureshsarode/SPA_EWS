import { Router } from "express";
import { getStudents, submitAttendance } from "../controllers/attendance.controller";
import { authenticate } from "../middleware/auth";
import { roleGuard } from "../middleware/role-guard";
import { asyncHandler } from "../middleware/error-handler";

const router = Router();

// Only faculty should mark attendance
router.use(authenticate, roleGuard("FACULTY"));

router.get("/:offeringId/students", asyncHandler(getStudents));
router.post("/:offeringId/mark", asyncHandler(submitAttendance));

export default router;
