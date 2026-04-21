import { Router } from "express";
import {
  dashboard,
  studentProfile,
  alertsHandler,
  updateProfile,
  getActionLog,
  addActionLog,
  exportAttendance,
  exportMarks,
  exportDefaulters,
} from "../controllers/faculty.controller";
import { authenticate } from "../middleware/auth";
import { roleGuard } from "../middleware/role-guard";
import { asyncHandler } from "../middleware/error-handler";

const router = Router();

router.use(authenticate, roleGuard("FACULTY", "ADMIN", "SUPER_ADMIN"));

// Dashboard
router.get("/me/dashboard", asyncHandler(dashboard));

// Profile
router.put("/me/profile", asyncHandler(updateProfile));

// Alerts
router.get("/me/alerts", asyncHandler(alertsHandler));

// Student data
router.get("/students/:id", asyncHandler(studentProfile));

// Student action log (counselling notes)
router.get("/students/:id/action-log", asyncHandler(getActionLog));
router.post("/students/:id/action-log", asyncHandler(addActionLog));

// CSV exports
router.get("/export/attendance", asyncHandler(exportAttendance));
router.get("/export/marks", asyncHandler(exportMarks));
router.get("/export/defaulters", asyncHandler(exportDefaulters));

// CC Stats
const { ccStatsHandler, attendanceHistoryHandler } = require("../controllers/faculty.controller");
router.get("/me/cc-stats", asyncHandler(ccStatsHandler));
router.get("/attendance/:offeringId/history", asyncHandler(attendanceHistoryHandler));

export default router;
