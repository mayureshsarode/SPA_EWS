import { ChatMessage } from "../models/ChatMessage";
import prisma from "../config/prisma";

/**
 * Get all conversations for a user.
 * Returns the most recent message from each unique conversation partner.
 */
export async function getConversations(userId: string) {
  // Get all messages where the user is either sender or receiver
  const messages = await ChatMessage.find({
    $or: [{ senderId: userId }, { receiverId: userId }],
  })
    .sort({ createdAt: -1 })
    .lean();

  // Group by conversation partner and pick the latest message
  const conversationMap = new Map<string, any>();

  for (const msg of messages) {
    const partnerId = msg.senderId === userId ? msg.receiverId : msg.senderId;
    if (!conversationMap.has(partnerId)) {
      // Count unread messages in this conversation
      const unreadCount = await ChatMessage.countDocuments({
        senderId: partnerId,
        receiverId: userId,
        isRead: false,
      });

      conversationMap.set(partnerId, {
        partnerId,
        lastMessage: msg.content,
        lastMessageAt: msg.createdAt,
        isLastMessageMine: msg.senderId === userId,
        unreadCount,
      });
    }
  }

  // Fetch partner names from PostgreSQL
  const partnerIds = Array.from(conversationMap.keys());
  const partners = await prisma.user.findMany({
    where: { id: { in: partnerIds } },
    select: { id: true, name: true, email: true, role: true },
  });

  const partnerMap = new Map(partners.map((p) => [p.id, p]));

  return Array.from(conversationMap.values()).map((conv) => ({
    ...conv,
    partner: partnerMap.get(conv.partnerId) || {
      id: conv.partnerId,
      name: "Unknown User",
      email: "",
      role: "UNKNOWN",
    },
  }));
}

/**
 * Get message history between two users, paginated.
 */
export async function getMessages(
  userId: string,
  otherUserId: string,
  limit: number = 50,
  before?: string
) {
  const query: any = {
    $or: [
      { senderId: userId, receiverId: otherUserId },
      { senderId: otherUserId, receiverId: userId },
    ],
  };

  if (before) {
    query.createdAt = { $lt: new Date(before) };
  }

  const messages = await ChatMessage.find(query)
    .sort({ createdAt: -1 })
    .limit(limit)
    .lean();

  // Reverse to get chronological order
  return messages.reverse().map((msg) => ({
    id: msg._id,
    senderId: msg.senderId,
    receiverId: msg.receiverId,
    content: msg.content,
    isRead: msg.isRead,
    isMine: msg.senderId === userId,
    createdAt: msg.createdAt,
  }));
}

/**
 * Send a new message.
 */
export async function sendMessage(
  senderId: string,
  receiverId: string,
  content: string
) {
  if (!content.trim()) {
    throw Object.assign(new Error("Message content cannot be empty"), { statusCode: 400 });
  }

  // Verify receiver exists
  const receiver = await prisma.user.findUnique({
    where: { id: receiverId },
    select: { id: true, name: true },
  });

  if (!receiver) {
    throw Object.assign(new Error("Recipient not found"), { statusCode: 404 });
  }

  const message = await ChatMessage.create({
    senderId,
    receiverId,
    content: content.trim(),
    isRead: false,
  });

  return {
    id: message._id,
    senderId: message.senderId,
    receiverId: message.receiverId,
    content: message.content,
    isRead: message.isRead,
    isMine: true,
    createdAt: message.createdAt,
  };
}

/**
 * Mark all messages from a specific sender as read.
 */
export async function markAsRead(userId: string, otherUserId: string) {
  const result = await ChatMessage.updateMany(
    {
      senderId: otherUserId,
      receiverId: userId,
      isRead: false,
    },
    { isRead: true }
  );

  return { markedAsRead: result.modifiedCount };
}

/**
 * Get total unread message count for a user.
 */
export async function getUnreadCount(userId: string) {
  const count = await ChatMessage.countDocuments({
    receiverId: userId,
    isRead: false,
  });
  return { unreadCount: count };
}
