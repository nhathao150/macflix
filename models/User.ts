import mongoose, { Schema, models } from "mongoose";

const userSchema = new Schema(
  {
    name: { type: String, required: true },
    email: { type: String, required: true, unique: true },
    password: { type: String, required: true },
    avatar: { type: String, default: '' },
    // Mảng 1: Lịch sử xem phim
    watchHistory: [
      {
        slug: String,
        name: String,
        imageSrc: String,
        episodeName: String,
        episodeIndex: Number,
        serverIndex: Number,
        timestamp: { type: Date, default: Date.now }
      }
    ],
    // Mảng 2: Phim yêu thích (MỚI)
    favorites: [
      {
        slug: String,
        name: String,
        imageSrc: String,
        timestamp: { type: Date, default: Date.now }
      }
    ]
  },
  { timestamps: true }
);

const User = models.User || mongoose.model("User", userSchema);
export default User;