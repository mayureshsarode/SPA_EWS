import { Router } from "express";
import { dashboard, faculty } from "../controllers/student.controller";
import { authenticate } from "../middleware/auth";
import { roleGuard } from "../middleware/role-guard";
import { asyncHandler } from "../middleware/error-handler";

const router = Router();

router.use(authenticate, roleGuard("STUDENT"));

router.get("/me/dashboard", asyncHandler(dashboard));
router.get("/me/faculty", asyncHandler(faculty));

const { assessmentsHandler, uploadAssessmentHandler } = require("../controllers/student.controller");
router.get("/me/assessments", asyncHandler(assessmentsHandler));
router.post("/me/assessments/upload", asyncHandler(uploadAssessmentHandler));

export default router;
