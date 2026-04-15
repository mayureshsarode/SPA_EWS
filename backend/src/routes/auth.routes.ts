import { Router } from "express";
import { login, me, logout, changePassword } from "../controllers/auth.controller";
import { authenticate } from "../middleware/auth";
import { asyncHandler } from "../middleware/error-handler";

const router = Router();

router.post("/login", asyncHandler(login));
router.get("/me", authenticate, asyncHandler(me));
router.post("/logout", asyncHandler(logout));
router.put("/change-password", authenticate, asyncHandler(changePassword));

export default router;
