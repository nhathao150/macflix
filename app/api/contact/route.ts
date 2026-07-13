import { NextResponse } from 'next/server';
import nodemailer from 'nodemailer';

export async function POST(request: Request) {
  try {
    const { name, email, subject, message, screenshot } = await request.json();

    // Kiểm tra dữ liệu đầu vào
    if (!name || !email || !subject || !message) {
      return NextResponse.json(
        { message: 'Vui lòng nhập đầy đủ thông tin bắt buộc.' },
        { status: 400 }
      );
    }

    const emailUser = process.env.EMAIL_USER;
    const emailPass = process.env.EMAIL_PASS;
    const emailTo = process.env.EMAIL_TO || emailUser;

    // Kiểm tra xem cấu hình biến môi trường đã sẵn sàng chưa
    if (!emailUser || !emailPass) {
      console.error('Lỗi cấu hình email: Thiếu EMAIL_USER hoặc EMAIL_PASS trong file .env');
      return NextResponse.json(
        { message: 'Hệ thống chưa được cấu hình gửi email. Vui lòng liên hệ quản trị viên.' },
        { status: 500 }
      );
    }

    // Tạo cấu hình transporter cho Gmail SMTP
    const transporter = nodemailer.createTransport({
      service: 'gmail',
      auth: {
        user: emailUser,
        pass: emailPass, // Sử dụng Mật khẩu ứng dụng (App Password) gồm 16 chữ cái, không phải mật khẩu chính
      },
    });

    // Nội dung Email gửi đi
    const mailOptions: any = {
      from: `"${name}" <${emailUser}>`, // Gửi từ chính Gmail của bạn để tránh lỗi từ chối gửi từ SMTP
      to: emailTo, // Địa chỉ nhận thư
      replyTo: email, // Khi nhấn Reply sẽ gửi lại cho người liên hệ
      subject: `[Macflix Liên Hệ] ${subject}`,
      html: `
        <div style="font-family: Arial, sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto; border: 1px solid #eee; border-radius: 10px; overflow: hidden;">
          <div style="background: linear-gradient(135deg, #7226FF, #F042FF); padding: 20px; text-align: center; color: white;">
            <h2 style="margin: 0; font-size: 24px; font-weight: bold; font-style: italic;">Macflix</h2>
            <p style="margin: 5px 0 0 0; opacity: 0.8; font-size: 14px;">Thông điệp liên hệ mới từ độc giả</p>
          </div>
          <div style="padding: 20px;">
            <table style="width: 100%; border-collapse: collapse;">
              <tr>
                <td style="padding: 8px 0; border-bottom: 1px solid #eee; font-weight: bold; width: 120px;">Người gửi:</td>
                <td style="padding: 8px 0; border-bottom: 1px solid #eee;">${name}</td>
              </tr>
              <tr>
                <td style="padding: 8px 0; border-bottom: 1px solid #eee; font-weight: bold;">Địa chỉ Email:</td>
                <td style="padding: 8px 0; border-bottom: 1px solid #eee;"><a href="mailto:${email}" style="color: #7226FF; text-decoration: none;">${email}</a></td>
              </tr>
              <tr>
                <td style="padding: 8px 0; border-bottom: 1px solid #eee; font-weight: bold;">Chủ đề:</td>
                <td style="padding: 8px 0; border-bottom: 1px solid #eee; font-weight: bold; color: #111;">${subject}</td>
              </tr>
            </table>
            
            <div style="margin-top: 20px;">
              <h3 style="margin-bottom: 10px; color: #111;">Nội dung tin nhắn:</h3>
              <div style="background-color: #f9f9f9; padding: 15px; border-left: 4px solid #F042FF; border-radius: 4px; white-space: pre-wrap; color: #555;">${message}</div>
            </div>
            
            ${screenshot ? `
            <div style="margin-top: 20px; border-top: 1px solid #eee; pt-15px;">
              <h3 style="color: #111;">Hình ảnh đính kèm:</h3>
              <p style="font-size: 12px; color: #888;">(Hình ảnh lỗi được đính kèm trực tiếp trong Email này)</p>
            </div>
            ` : ''}
          </div>
          <div style="background-color: #f4f4f4; padding: 15px; text-align: center; font-size: 12px; color: #888; border-top: 1px solid #eee;">
            Tin nhắn này được gửi tự động từ biểu mẫu liên hệ của Macflix.
          </div>
        </div>
      `,
      attachments: screenshot ? [
        {
          filename: 'screenshot.png',
          path: screenshot, // Nhận đường dẫn data URI dạng base64
        }
      ] : []
    };

    // Gửi email
    await transporter.sendMail(mailOptions);

    return NextResponse.json({ success: true, message: 'Gửi email thành công!' });
  } catch (error: any) {
    console.error('Lỗi khi gửi email qua SMTP:', error);
    return NextResponse.json(
      { message: error.message || 'Lỗi hệ thống khi gửi email.' },
      { status: 500 }
    );
  }
}
