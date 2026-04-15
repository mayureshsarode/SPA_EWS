import mongoose, { Schema, Document } from "mongoose";

export interface IChatMessage extends Document {
  senderId: string;    // PostgreSQL User.id (bridge between PG and Mongo)
  receiverId: string;  // PostgreSQL User.id
  content: string;
  isRead: boolean;
  createdAt: Date;
}

const ChatMessageSchema = new Schema<IChatMessage>(
  {
    senderId: {
      type: String,
      required: true,
      index: true,
    },
    receiverId: {
      type: String,
      required: true,
      index: true,
    },
    content: {
      type: String,
      required: true,
      trim: true,
    },
    isRead: {
      type: Boolean,
      default: false,
    },
  },
  {
    timestamps: true, // Adds createdAt and updatedAt automatically
  }
);

// Compound index for efficient conversation queries
ChatMessageSchema.index({ senderId: 1, receiverId: 1, createdAt: -1 });

export const ChatMessage = mongoose.model<IChatMessage>("ChatMessage", ChatMessageSchema);
