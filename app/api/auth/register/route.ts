import { NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import { connectMongoDB } from "@/lib/mongodb";
import User from "@/models/User";

export async function POST(req: Request) {
  try {
    const { name, email, password } = await req.json();
    await connectMongoDB();

    // Kiểm tra xem email đã tồn tại chưa
    const exists = await User.findOne({ email });
    if (exists) {
      return NextResponse.json({ message: "Email này đã được sử dụng!" }, { status: 400 });
    }

    // Mã hóa mật khẩu (bảo mật tuyệt đối, kể cả admin cũng không thấy pass thật)
    const hashedPassword = await bcrypt.hash(password, 10);
    
    // Lưu vào Database
    await User.create({ name, email, password: hashedPassword });

    return NextResponse.json({ message: "Đăng ký thành công!" }, { status: 201 });
  } catch (error) {
    console.log("LỖI ĐĂNG KÝ TỪ DATABASE:", error);
    return NextResponse.json({ message: "Đã xảy ra lỗi khi đăng ký!" }, { status: 500 });
  }
  
}
