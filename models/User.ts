import mongoose, { Schema, models } from "mongoose";

const userSchema = new Schema(
  {
    name: { type: String, required: true },
    email: { type: String, required: true, unique: true },
    password: { type: String, required: false }, // Cho phép null khi dùng Google OAuth
    authProvider: { type: String, default: "credentials" }, // 'credentials' hoặc 'google'
    avatar: { type: String, default: '' },
    isVerified: { type: Boolean, default: false },
    verificationToken: { type: String },
    verificationTokenExpires: { type: Date, expires: 0 },
    resetPasswordToken: { type: String },
    resetPasswordExpires: { type: Date },
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
    // Mảng 2: Phim yêu thích
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