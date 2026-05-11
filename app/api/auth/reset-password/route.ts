import { NextResponse } from "next/server";
import crypto from "crypto";
import bcrypt from "bcryptjs";
import { connectMongoDB } from "@/lib/mongodb";
import User from "@/models/User";

export async function PUT(req: Request) {
  try {
    const { token, newPassword } = await req.json();

    if (!token || !newPassword) {
      return NextResponse.json({ message: "Dữ liệu không hợp lệ!" }, { status: 400 });
    }

    await connectMongoDB();

    // 1. Mã hóa token nhận được từ URL để so sánh với token trong Database
    const hashedToken = crypto.createHash('sha256').update(token).digest('hex');

    // 2. Tìm user có token khớp và thời gian hết hạn (expires) lớn hơn hiện tại
    const user = await User.findOne({
      resetPasswordToken: hashedToken,
      resetPasswordExpires: { $gt: Date.now() }
    });

    if (!user) {
      return NextResponse.json({ message: "Link khôi phục không hợp lệ hoặc đã hết hạn!" }, { status: 400 });
    }

    // 3. Mã hóa mật khẩu mới
    const hashedPassword = await bcrypt.hash(newPassword, 10);

    // 4. Lưu mật khẩu mới và xóa Token bảo mật đi
    user.password = hashedPassword;
    user.resetPasswordToken = undefined;
    user.resetPasswordExpires = undefined;
    await user.save();

    return NextResponse.json({ message: "Mật khẩu đã được cập nhật thành công!" }, { status: 200 });

  } catch (error) {
    console.error("LỖI ĐẶT LẠI MẬT KHẨU:", error);
    return NextResponse.json({ message: "Đã xảy ra lỗi, vui lòng thử lại!" }, { status: 500 });
  }
}
