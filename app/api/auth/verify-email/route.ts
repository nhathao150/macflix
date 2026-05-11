import { NextResponse } from "next/server";
import { connectMongoDB } from "@/lib/mongodb";
import User from "@/models/User";

export async function POST(req: Request) {
  try {
    const { email, otp } = await req.json();

    if (!email || !otp) {
      return NextResponse.json({ message: "Vui lòng cung cấp đầy đủ email và mã OTP!" }, { status: 400 });
    }

    await connectMongoDB();

    const user = await User.findOne({ email });

    if (!user) {
      return NextResponse.json({ message: "Không tìm thấy tài khoản!" }, { status: 404 });
    }

    if (user.isVerified) {
      return NextResponse.json({ message: "Tài khoản này đã được xác thực từ trước!" }, { status: 400 });
    }

    if (user.verificationToken !== otp) {
      return NextResponse.json({ message: "Mã xác thực không chính xác!" }, { status: 400 });
    }

    if (user.verificationTokenExpires < Date.now()) {
      return NextResponse.json({ message: "Mã xác thực đã hết hạn! Vui lòng đăng ký lại." }, { status: 400 });
    }

    // OTP Hợp lệ, tiến hành xác thực tài khoản
    user.isVerified = true;
    user.verificationToken = undefined;
    user.verificationTokenExpires = undefined;
    await user.save();

    return NextResponse.json({ message: "Xác thực email thành công! Bạn có thể đăng nhập ngay bây giờ." }, { status: 200 });
  } catch (error) {
    console.error("LỖI XÁC THỰC EMAIL:", error);
    return NextResponse.json({ message: "Đã xảy ra lỗi khi xác thực!" }, { status: 500 });
  }
}
