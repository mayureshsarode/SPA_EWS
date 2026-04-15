import mongoose from "mongoose";

const MONGO_URI = process.env.MONGO_URI;

/**
 * Connect to MongoDB Atlas.
 * Called once on server startup.
 */
export async function connectMongoDB() {
  if (!MONGO_URI) {
    console.warn("⚠️  MONGO_URI not set — chat system will be unavailable");
    return;
  }

  try {
    await mongoose.connect(MONGO_URI, {
      dbName: "spa_ews",
      tls: true,
      tlsAllowInvalidCertificates: true, // Required for some Node.js + Atlas combos
    });
    console.log("✅ MongoDB connected successfully");
  } catch (err: any) {
    console.error("❌ MongoDB connection failed:", err.message);
    console.warn("⚠️  Chat system will be unavailable. Server continues without MongoDB.");
    // Don't crash the server — chat is optional
  }
}

export default mongoose;
