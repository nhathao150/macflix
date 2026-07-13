'use client';

import Navbar from '@/components/layout/Navbar';
import Link from 'next/link';
import { ArrowLeft, Shield, Lock, Eye, CheckCircle2 } from 'lucide-react';

export default function PrivacyPolicyPage() {
  return (
    <main className="min-h-screen bg-[#0a0a0c] text-white selection:bg-[#F042FF]/30 pb-28">
      <Navbar />

      {/* Hero Header */}
      <div className="relative overflow-hidden pt-24 md:pt-[120px] pb-12 border-b border-white/5">
        <div className="absolute inset-0 bg-gradient-to-b from-[#F042FF]/10 via-[#7226FF]/5 to-transparent pointer-events-none" />
        <div className="max-w-4xl mx-auto px-6 flex flex-col gap-4">
          <div className="flex items-center gap-2 text-white/40 hover:text-white transition-colors text-sm">
            <Link href="/" className="flex items-center gap-1.5 hover:underline">
              <ArrowLeft className="w-4 h-4" /> Trang chủ
            </Link>
            <span>/</span>
            <span className="text-white/60">Chính sách bảo mật</span>
          </div>

          <div className="flex items-center gap-3 mt-2">
            <div className="w-12 h-12 rounded-2xl flex items-center justify-center" style={{ background: 'rgba(240,66,255,0.15)' }}>
              <Shield className="w-6 h-6" style={{ color: '#F042FF' }} />
            </div>
            <div>
              <h1 className="text-2xl md:text-4xl font-black text-white tracking-tight">
                Chính Sách Bảo Mật
              </h1>
              <p className="text-white/45 text-xs md:text-sm mt-1">Cập nhật lần cuối: 13 tháng 07, 2026</p>
            </div>
          </div>
        </div>
      </div>

      {/* Content Area */}
      <div className="max-w-4xl mx-auto px-6 py-12">
        <div className="bg-white/[0.02] border border-white/5 rounded-3xl p-6 md:p-10 backdrop-blur-sm space-y-8 text-white/70 text-sm md:text-base leading-relaxed">
          
          <section className="space-y-4">
            <h2 className="text-lg md:text-xl font-bold text-white flex items-center gap-2">
              <span className="w-1.5 h-6 rounded-full bg-gradient-to-b from-[#F042FF] to-[#7226FF]" />
              1. Thu thập thông tin cá nhân
            </h2>
            <p>
              Macflix cam kết tôn trọng quyền riêng tư của bạn. Khi bạn đăng ký hoặc sử dụng dịch vụ trên hệ thống của chúng tôi, chúng tôi có thể thu thập các thông tin sau:
            </p>
            <ul className="list-disc pl-6 space-y-2 text-white/65">
              <li>Thông tin tài khoản: Tên hiển thị, địa chỉ Email để xác thực tài khoản và quản lý thông tin đăng nhập.</li>
              <li>Thông tin hoạt động: Danh sách phim yêu thích, lịch sử các bộ phim đã xem để cá nhân hóa nội dung khuyến nghị.</li>
              <li>Dữ liệu kỹ thuật: Địa chỉ IP, loại thiết bị, hệ điều hành nhằm tối ưu hóa hiệu năng hiển thị và bảo vệ hệ thống khỏi các cuộc tấn công DDoS hoặc lạm dụng dịch vụ.</li>
            </ul>
          </section>

          <section className="space-y-4">
            <h2 className="text-lg md:text-xl font-bold text-white flex items-center gap-2">
              <span className="w-1.5 h-6 rounded-full bg-gradient-to-b from-[#F042FF] to-[#7226FF]" />
              2. Mục đích sử dụng thông tin
            </h2>
            <p>
              Chúng tôi chỉ sử dụng dữ liệu của bạn cho các mục đích thiết thực và hợp pháp sau đây:
            </p>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-2">
              <div className="p-4 bg-white/5 border border-white/5 rounded-2xl flex gap-3">
                <Lock className="w-5 h-5 text-[#F042FF] shrink-0" />
                <div>
                  <h3 className="font-semibold text-white text-sm mb-1">Xác thực & Bảo mật</h3>
                  <p className="text-xs text-white/50">Xác thực đăng nhập, phục hồi mật khẩu và ngăn chặn các hành vi gian lận tài khoản.</p>
                </div>
              </div>
              <div className="p-4 bg-white/5 border border-white/5 rounded-2xl flex gap-3">
                <Eye className="w-5 h-5 text-[#87F5F5] shrink-0" />
                <div>
                  <h3 className="font-semibold text-white text-sm mb-1">Cá nhân hoá trải nghiệm</h3>
                  <p className="text-xs text-white/50">Lưu tiến trình phim đang xem dở, đồng bộ hóa danh sách phim yêu thích trên mọi thiết bị.</p>
                </div>
              </div>
            </div>
          </section>

          <section className="space-y-4">
            <h2 className="text-lg md:text-xl font-bold text-white flex items-center gap-2">
              <span className="w-1.5 h-6 rounded-full bg-gradient-to-b from-[#F042FF] to-[#7226FF]" />
              3. Chia sẻ và bảo mật dữ liệu
            </h2>
            <p>
              Macflix <strong>KHÔNG bao giờ</strong> bán, trao đổi hoặc cho bên thứ ba thuê thông tin cá nhân của bạn dưới bất kỳ hình thức nào. Mọi thông tin mật khẩu đều được mã hóa một chiều (hashing) an toàn trước khi lưu trữ trong cơ sở dữ liệu.
            </p>
            <p>
              Chúng tôi áp dụng các giao thức bảo mật tiêu chuẩn mã hóa SSL/TLS để bảo vệ dữ liệu truyền tải giữa thiết bị của bạn và máy chủ của chúng tôi.
            </p>
          </section>

          <section className="space-y-4">
            <h2 className="text-lg md:text-xl font-bold text-white flex items-center gap-2">
              <span className="w-1.5 h-6 rounded-full bg-gradient-to-b from-[#F042FF] to-[#7226FF]" />
              4. Cookies và Công cụ phân tích
            </h2>
            <p>
              Chúng tôi sử dụng cookies cục bộ để ghi nhớ trạng thái phiên đăng nhập và các tuỳ chỉnh cá nhân của bạn (như cấu hình âm lượng, chất lượng trình phát mặc định). Bạn có thể tắt cookies trong cài đặt trình duyệt, tuy nhiên một số tính năng nâng cao có thể không hoạt động ổn định.
            </p>
          </section>

          <section className="space-y-4">
            <h2 className="text-lg md:text-xl font-bold text-white flex items-center gap-2">
              <span className="w-1.5 h-6 rounded-full bg-gradient-to-b from-[#F042FF] to-[#7226FF]" />
              5. Quyền lợi của bạn đối với dữ liệu
            </h2>
            <p>
              Bạn hoàn toàn có quyền kiểm soát thông tin cá nhân của mình tại Macflix:
            </p>
            <div className="space-y-2.5">
              {[
                'Thay đổi tên hiển thị, mật khẩu và ảnh đại diện bất cứ lúc nào trong trang Cá nhân.',
                'Yêu cầu xóa vĩnh viễn tài khoản và mọi dữ liệu lịch sử xem phim liên quan bằng cách liên hệ với ban quản trị.',
                'Từ chối cung cấp một số thông tin tùy chọn không ảnh hưởng đến việc xem phim cơ bản.'
              ].map((item, index) => (
                <div key={index} className="flex gap-2.5 items-start">
                  <CheckCircle2 className="w-4 h-4 text-green-400 shrink-0 mt-1" />
                  <span className="text-white/60">{item}</span>
                </div>
              ))}
            </div>
          </section>

          <section className="space-y-4 pt-4 border-t border-white/5">
            <h2 className="text-lg md:text-xl font-bold text-white">Liên hệ phản hồi chính sách</h2>
            <p>
              Nếu bạn có bất kỳ câu hỏi nào liên quan đến Chính sách bảo mật dữ liệu, xin vui lòng gửi thư cho chúng tôi thông qua trang <Link href="/lien-he" className="text-[#F042FF] hover:underline font-medium">Liên hệ hỗ trợ</Link>.
            </p>
          </section>

        </div>
      </div>
    </main>
  );
}
