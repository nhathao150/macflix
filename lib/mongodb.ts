// lib/mongodb.ts
import mongoose from "mongoose";

export const connectMongoDB = async () => {
  try {
    if (mongoose.connection.readyState === 1) {
      return;
    }
    if (!process.env.MONGODB_URI) {
      console.error("❌ LỖI: Chưa cấu hình MONGODB_URI trong file .env.local!");
      return;
    }
    await mongoose.connect(process.env.MONGODB_URI as string);
    console.log("✅ Đã kết nối thành công với MongoDB!");
  } catch (error) {
    console.log("❌ Lỗi kết nối MongoDB: ", error);
  }
};