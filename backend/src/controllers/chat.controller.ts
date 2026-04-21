import { Request, Response } from "express";
import {
  getConversations,
  getMessages,
  sendMessage,
  markAsRead,
  getUnreadCount,
} from "../services/chat.service";

/**
 * GET /api/chat/conversations
 * Returns all conversations for the current user.
 */
export async function conversations(req: Request, res: Response) {
  const data = await getConversations(req.user!.userId);
  res.json({ success: true, data });
}

/**
 * GET /api/chat/messages/:otherUserId
 * Returns message history with a specific user.
 */
export async function messages(req: Request, res: Response) {
  const otherUserId = req.params.otherUserId as string;
  const { limit, before } = req.query;

  const data = await getMessages(
    req.user!.userId,
    otherUserId,
    limit ? parseInt(limit as string) : undefined,
    before as string | undefined
  );
  res.json({ success: true, data });
}

/**
 * POST /api/chat/send
 * Sends a new message.
 * Body: { receiverId, content }
 */
export async function send(req: Request, res: Response) {
  const { receiverId, content } = req.body;

  if (!receiverId || !content) {
    res.status(400).json({
      success: false,
      message: "receiverId and content are required",
    });
    return;
  }

  const data = await sendMessage(req.user!.userId, receiverId, content);
  res.status(201).json({ success: true, data });
}

/**
 * PUT /api/chat/read/:otherUserId
 * Marks all messages from a user as read.
 */
export async function read(req: Request, res: Response) {
  const otherUserId = req.params.otherUserId as string;
  const data = await markAsRead(req.user!.userId, otherUserId);
  res.json({ success: true, ...data });
}

/**
 * GET /api/chat/unread
 * Returns total unread message count.
 */
export async function unread(req: Request, res: Response) {
  const data = await getUnreadCount(req.user!.userId);
  res.json({ success: true, ...data });
}
