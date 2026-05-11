import { NextResponse } from "next/server";
import crypto from "crypto";
import { connectMongoDB } from "@/lib/mongodb";
import User from "@/models/User";
import nodemailer from "nodemailer";

export async function POST(req: Request) {
  try {
    const { email } = await req.json();
    await connectMongoDB();

    // 1. Kiểm tra email có tồn tại không
    const user = await User.findOne({ email });
    if (!user) {
      return NextResponse.json({ message: "Không tìm thấy tài khoản với email này!" }, { status: 404 });
    }

    // 2. Tạo một Token ngẫu nhiên để xác minh
    const resetToken = crypto.randomBytes(32).toString('hex');
    
    // 3. Mã hóa token bằng crypto để lưu vào Database (tăng cường bảo mật)
    const hashedToken = crypto.createHash('sha256').update(resetToken).digest('hex');

    // 4. Cập nhật user với Token và Thời hạn (1 tiếng)
    user.resetPasswordToken = hashedToken;
    user.resetPasswordExpires = Date.now() + 3600000; // 1 giờ = 3600000 ms
    await user.save();

    // 5. Tạo đường dẫn đặt lại mật khẩu (Mock Link)
    // Lưu ý: Lấy URL hiện tại từ request headers (origin)
    const origin = req.headers.get('origin') || 'http://localhost:3000';
    const resetUrl = `${origin}/dat-lai-mat-khau/${resetToken}`;

    // 6. Cấu hình Nodemailer để gửi email thật
    const transporter = nodemailer.createTransport({
      service: "gmail",
      auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS,
      },
    });

    const mailOptions = {
      from: `"Macflix Support" <${process.env.EMAIL_USER}>`,
      to: user.email,
      subject: "Khôi phục mật khẩu Macflix",
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 500px; margin: 0 auto; padding: 20px; border: 1px solid #ddd; border-radius: 10px;">
          <h2 style="color: #F042FF; text-align: center;">Macflix</h2>
          <p>Xin chào <strong>${user.name}</strong>,</p>
          <p>Bạn nhận được email này vì bạn (hoặc ai đó) đã yêu cầu đặt lại mật khẩu cho tài khoản của bạn.</p>
          <p>Vui lòng bấm vào nút bên dưới để đặt lại mật khẩu (đường link sẽ hết hạn sau 1 tiếng):</p>
          <div style="text-align: center; margin: 25px 0;">
            <a href="${resetUrl}" style="background: linear-gradient(135deg, #F042FF, #7226FF); color: white; padding: 12px 25px; text-decoration: none; border-radius: 8px; font-weight: bold; display: inline-block;">Đặt lại mật khẩu</a>
          </div>
          <p>Nếu nút bấm không hoạt động, bạn có thể copy và dán đường link sau vào trình duyệt:</p>
          <p style="word-break: break-all; color: #555;"><a href="${resetUrl}">${resetUrl}</a></p>
          <p>Nếu bạn không yêu cầu việc này, hãy bỏ qua email này và mật khẩu của bạn sẽ không bị thay đổi.</p>
        </div>
      `,
    };

    // Gửi email
    await transporter.sendMail(mailOptions);

    // Trả về thông báo thành công
    return NextResponse.json({ 
      message: "Đường link khôi phục đã được gửi vào email của bạn! Hãy kiểm tra hộp thư."
    }, { status: 200 });

  } catch (error) {
    console.error("LỖI QUÊN MẬT KHẨU:", error);
    return NextResponse.json({ message: "Đã xảy ra lỗi, vui lòng thử lại!" }, { status: 500 });
  }
}
