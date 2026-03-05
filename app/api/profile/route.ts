import { NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import { connectMongoDB } from "@/lib/mongodb";
import User from "@/models/User";

// PATCH: Cập nhật tên hoặc đổi mật khẩu
export async function PATCH(req: Request) {
  try {
    const body = await req.json();
    const { email, name, currentPassword, newPassword } = body;

    if (!email) {
      return NextResponse.json({ message: "Thiếu email!" }, { status: 400 });
    }

    await connectMongoDB();
    const user = await User.findOne({ email });

    if (!user) {
      return NextResponse.json({ message: "Không tìm thấy tài khoản!" }, { status: 404 });
    }

    // Cập nhật tên
    if (name && name.trim()) {
      user.name = name.trim();
    }

    // Đổi mật khẩu
    if (currentPassword && newPassword) {
      const isMatch = await bcrypt.compare(currentPassword, user.password);
      if (!isMatch) {
        return NextResponse.json({ message: "Mật khẩu cũ không chính xác!" }, { status: 400 });
      }
      if (newPassword.length < 6) {
        return NextResponse.json({ message: "Mật khẩu mới phải có ít nhất 6 ký tự!" }, { status: 400 });
      }
      user.password = await bcrypt.hash(newPassword, 10);
    }

    await user.save();
    return NextResponse.json({ message: "Cập nhật thành công!", name: user.name }, { status: 200 });
  } catch (error) {
    console.error("Lỗi cập nhật profile:", error);
    return NextResponse.json({ message: "Lỗi server!" }, { status: 500 });
  }
}

// PUT: Cập nhật avatar (base64)
export async function PUT(req: Request) {
  try {
    const { email, avatar } = await req.json();

    if (!email || !avatar) {
      return NextResponse.json({ message: "Thiếu dữ liệu!" }, { status: 400 });
    }

    // Giới hạn kích thước ảnh ~ 1.5MB base64
    if (avatar.length > 2 * 1024 * 1024) {
      return NextResponse.json({ message: "Ảnh quá lớn! Vui lòng chọn ảnh nhỏ hơn 1MB." }, { status: 400 });
    }

    await connectMongoDB();
    const user = await User.findOneAndUpdate(
      { email },
      { avatar },
      { new: true }
    );

    if (!user) {
      return NextResponse.json({ message: "Không tìm thấy tài khoản!" }, { status: 404 });
    }

    return NextResponse.json({ message: "Cập nhật avatar thành công!", avatar: user.avatar }, { status: 200 });
  } catch (error) {
    console.error("Lỗi cập nhật avatar:", error);
    return NextResponse.json({ message: "Lỗi server!" }, { status: 500 });
  }
}

// GET: Lấy thông tin profile (bao gồm avatar, createdAt, thống kê)
export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const email = searchParams.get("email");

    if (!email) {
      return NextResponse.json({ message: "Thiếu email!" }, { status: 400 });
    }

    await connectMongoDB();
    const user = await User.findOne({ email }).select("name email avatar createdAt watchHistory favorites");

    if (!user) {
      return NextResponse.json({ message: "Không tìm thấy tài khoản!" }, { status: 404 });
    }

    return NextResponse.json({
      name: user.name,
      email: user.email,
      avatar: user.avatar || "",
      createdAt: user.createdAt,
      watchCount: user.watchHistory?.length || 0,
      favoriteCount: user.favorites?.length || 0,
    }, { status: 200 });
  } catch (error) {
    console.error("Lỗi lấy profile:", error);
    return NextResponse.json({ message: "Lỗi server!" }, { status: 500 });
  }
}
