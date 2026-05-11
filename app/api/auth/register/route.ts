import { NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import { connectMongoDB } from "@/lib/mongodb";
import User from "@/models/User";
import nodemailer from "nodemailer";

export async function POST(req: Request) {
  try {
    const { name, email, password } = await req.json();
    await connectMongoDB();

    // Kiểm tra xem email đã tồn tại chưa
    const exists = await User.findOne({ email });
    if (exists) {
      if (exists.isVerified === false) {
        return NextResponse.json({ message: "Email đã tồn tại nhưng chưa xác thực! Vui lòng đăng nhập để nhận lại mã." }, { status: 400 });
      }
      return NextResponse.json({ message: "Email này đã được sử dụng!" }, { status: 400 });
    }

    // Mã hóa mật khẩu
    const hashedPassword = await bcrypt.hash(password, 10);
    
    // Tạo mã OTP 6 số
    const otp = Math.floor(100000 + Math.random() * 900000).toString();

    // Lưu vào Database với isVerified: false
    await User.create({ 
      name, 
      email, 
      password: hashedPassword,
      isVerified: false,
      verificationToken: otp,
      verificationTokenExpires: Date.now() + 15 * 60 * 1000 // 15 phút
    });

    // Gửi OTP qua email
    const transporter = nodemailer.createTransport({
      service: "gmail",
      auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS,
      },
    });

    const mailOptions = {
      from: `"Macflix Support" <${process.env.EMAIL_USER}>`,
      to: email,
      subject: "Mã xác thực tài khoản Macflix",
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 500px; margin: 0 auto; padding: 20px; border: 1px solid #ddd; border-radius: 10px;">
          <h2 style="color: #F042FF; text-align: center;">Macflix</h2>
          <p>Xin chào <strong>${name}</strong>,</p>
          <p>Cảm ơn bạn đã đăng ký tài khoản tại Macflix. Để hoàn tất đăng ký, vui lòng sử dụng mã xác thực dưới đây:</p>
          <div style="text-align: center; margin: 30px 0;">
            <span style="font-size: 32px; font-weight: bold; letter-spacing: 5px; color: #7226FF; background: #f4f4f4; padding: 15px 30px; border-radius: 8px; display: inline-block;">${otp}</span>
          </div>
          <p>Mã này sẽ hết hạn sau 15 phút.</p>
          <p>Nếu bạn không thực hiện yêu cầu này, vui lòng bỏ qua email.</p>
        </div>
      `
    };

    await transporter.sendMail(mailOptions);

    return NextResponse.json({ message: "Đăng ký thành công! Hãy kiểm tra email để nhận mã xác thực." }, { status: 201 });
  } catch (error) {
    console.error("LỖI ĐĂNG KÝ TỪ DATABASE:", error);
    return NextResponse.json({ message: "Đã xảy ra lỗi khi đăng ký!" }, { status: 500 });
  }
}
