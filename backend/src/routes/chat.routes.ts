import { Router } from "express";
import { conversations, messages, send, read, unread } from "../controllers/chat.controller";
import { authenticate } from "../middleware/auth";
import { asyncHandler } from "../middleware/error-handler";

const router = Router();

// All chat routes require authentication (any role)
router.use(authenticate);

router.get("/conversations", asyncHandler(conversations));
router.get("/unread", asyncHandler(unread));
router.get("/messages/:otherUserId", asyncHandler(messages));
router.post("/send", asyncHandler(send));
router.put("/read/:otherUserId", asyncHandler(read));

export default router;
