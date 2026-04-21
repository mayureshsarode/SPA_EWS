import { Router } from "express";
import {
  dashboard,
  departments,
  createDepartmentHandler,
  updateDepartmentHandler,
  users,
  courses,
  createCourseHandler,
  updateCourseHandler,
  deleteCourseHandler,
  createUserHandler,
  updateUserHandler,
  deleteUserHandler,
  leadership,
  auditLog,
  thresholds,
  getThresholdsHandler,
  alertsHandler,
  assignMentorHandler,
  assignCCHandler,
  exportUsersHandler,
  exportCoursesHandler,
} from "../controllers/admin.controller";
import { authenticate } from "../middleware/auth";
import { roleGuard } from "../middleware/role-guard";
import { asyncHandler } from "../middleware/error-handler";

const router = Router();

router.use(authenticate, roleGuard("ADMIN", "SUPER_ADMIN"));

// Read operations
router.get("/dashboard", asyncHandler(dashboard));
router.get("/departments", asyncHandler(departments));
router.get("/users", asyncHandler(users));
router.get("/courses", asyncHandler(courses));
router.get("/leadership", asyncHandler(leadership));
router.get("/audit-log", asyncHandler(auditLog));
router.get("/thresholds", asyncHandler(getThresholdsHandler));
// NOTE: /alerts removed - alerts only for faculty via /faculty/alerts

// Export operations
router.get("/export/users", asyncHandler(exportUsersHandler));
router.get("/export/courses", asyncHandler(exportCoursesHandler));

// User write operations
router.post("/users", asyncHandler(createUserHandler));
router.put("/users/:id", asyncHandler(updateUserHandler));
router.delete("/users/:id", asyncHandler(deleteUserHandler));

// Course write operations
router.post("/courses", asyncHandler(createCourseHandler));
router.put("/courses/:id", asyncHandler(updateCourseHandler));
router.delete("/courses/:id", asyncHandler(deleteCourseHandler));

// Department write operations
router.post("/departments", asyncHandler(createDepartmentHandler));
router.put("/departments/:id", asyncHandler(updateDepartmentHandler));

// Threshold operations
router.put("/thresholds", asyncHandler(thresholds));

// Assignment operations
router.put("/assignments/mentor", asyncHandler(assignMentorHandler));
router.put("/assignments/cc", asyncHandler(assignCCHandler));

// Reports
const { getReportsHandler, generateReportHandler } = require("../controllers/admin.controller");
router.get("/reports", asyncHandler(getReportsHandler));
router.post("/reports/generate", asyncHandler(generateReportHandler));

export default router;
