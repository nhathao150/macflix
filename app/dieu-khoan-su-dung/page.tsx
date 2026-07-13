'use client';

import Navbar from '@/components/layout/Navbar';
import Link from 'next/link';
import { ArrowLeft, FileText, CheckCircle2, AlertTriangle, ShieldCheck } from 'lucide-react';

export default function TermsOfServicePage() {
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
            <span className="text-white/60">Điều khoản sử dụng</span>
          </div>

          <div className="flex items-center gap-3 mt-2">
            <div className="w-12 h-12 rounded-2xl flex items-center justify-center" style={{ background: 'rgba(114,38,255,0.15)' }}>
              <FileText className="w-6 h-6" style={{ color: '#7226FF' }} />
            </div>
            <div>
              <h1 className="text-2xl md:text-4xl font-black text-white tracking-tight">
                Điều Khoản Sử Dụng
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
              <span className="w-1.5 h-6 rounded-full bg-gradient-to-b from-[#7226FF] to-[#d070ff]" />
              1. Chấp thuận điều khoản
            </h2>
            <p>
              Chào mừng bạn đến với Macflix. Bằng cách truy cập, đăng ký tài khoản hoặc sử dụng bất kỳ phần nào của ứng dụng Macflix, bạn đồng ý tuân thủ và chịu sự ràng buộc bởi các Điều khoản sử dụng này. Nếu bạn không đồng ý với bất kỳ phần nào của các điều khoản này, vui lòng ngừng sử dụng dịch vụ của chúng tôi ngay lập tức.
            </p>
          </section>

          <section className="space-y-4">
            <h2 className="text-lg md:text-xl font-bold text-white flex items-center gap-2">
              <span className="w-1.5 h-6 rounded-full bg-gradient-to-b from-[#7226FF] to-[#d070ff]" />
              2. Quyền và Trách nhiệm tài khoản
            </h2>
            <p>
              Để có trải nghiệm cá nhân hóa đầy đủ (như lưu lịch sử, phim yêu thích), bạn cần đăng ký tài khoản. Bạn có trách nhiệm:
            </p>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-2">
              <div className="p-4 bg-white/5 border border-white/5 rounded-2xl flex gap-3">
                <ShieldCheck className="w-5 h-5 text-green-400 shrink-0" />
                <div>
                  <h3 className="font-semibold text-white text-sm mb-1">Bảo mật thông tin đăng nhập</h3>
                  <p className="text-xs text-white/50">Không chia sẻ tài khoản của bạn cho người khác và chịu trách nhiệm cho mọi hoạt động dưới tên đăng nhập của mình.</p>
                </div>
              </div>
              <div className="p-4 bg-white/5 border border-white/5 rounded-2xl flex gap-3">
                <AlertTriangle className="w-5 h-5 text-amber-400 shrink-0" />
                <div>
                  <h3 className="font-semibold text-white text-sm mb-1">Hành vi bị cấm</h3>
                  <p className="text-xs text-white/50">Không sử dụng các công cụ tự động (bots, crawlers) để tải dữ liệu phim trái phép hoặc phá hoại hệ thống máy chủ.</p>
                </div>
              </div>
            </div>
          </section>

          <section className="space-y-4">
            <h2 className="text-lg md:text-xl font-bold text-white flex items-center gap-2">
              <span className="w-1.5 h-6 rounded-full bg-gradient-to-b from-[#7226FF] to-[#d070ff]" />
              3. Quyền sở hữu trí tuệ & nội dung
            </h2>
            <p>
              Macflix cung cấp dịch vụ xem phim trực tuyến miễn phí phục vụ cho mục đích cá nhân và giải trí phi thương mại.
            </p>
            <ul className="list-disc pl-6 space-y-2 text-white/65">
              <li>Tất cả hình ảnh, logo và giao diện người dùng trên hệ thống thuộc sở hữu độc quyền của Macflix.</li>
              <li>Các nội dung video/phim được phát sóng trên hệ thống có nguồn gốc từ các tài nguyên công cộng hoặc được nhúng từ các máy chủ chia sẻ của bên thứ ba. Chúng tôi tôn trọng quyền sở hữu trí tuệ và xử lý nhanh chóng mọi yêu cầu gỡ bỏ vi phạm bản quyền hợp pháp.</li>
            </ul>
          </section>

          <section className="space-y-4">
            <h2 className="text-lg md:text-xl font-bold text-white flex items-center gap-2">
              <span className="w-1.5 h-6 rounded-full bg-gradient-to-b from-[#7226FF] to-[#d070ff]" />
              4. Giới hạn trách nhiệm
            </h2>
            <p>
              Chúng tôi nỗ lực tối đa để duy trì hoạt động thông suốt của dịch vụ. Tuy nhiên, dịch vụ được cung cấp trên cơ sở &ldquo;sẵn có&rdquo; và Macflix không đảm bảo rằng:
            </p>
            <div className="space-y-2.5">
              {[
                'Dịch vụ sẽ hoạt động liên tục không bao giờ bị gián đoạn hay xảy ra sự cố kỹ thuật.',
                'Tốc độ tải phim là hoàn toàn như nhau đối với mọi nhà mạng và vị trí địa lý.',
                'Ứng dụng hoàn toàn tương thích và hiển thị tốt trên tất cả các loại trình duyệt cũ.'
              ].map((item, index) => (
                <div key={index} className="flex gap-2.5 items-start">
                  <CheckCircle2 className="w-4 h-4 text-[#7226FF] shrink-0 mt-1" />
                  <span className="text-white/60">{item}</span>
                </div>
              ))}
            </div>
          </section>

          <section className="space-y-4">
            <h2 className="text-lg md:text-xl font-bold text-white flex items-center gap-2">
              <span className="w-1.5 h-6 rounded-full bg-gradient-to-b from-[#7226FF] to-[#d070ff]" />
              5. Thay đổi điều khoản
            </h2>
            <p>
              Macflix có quyền sửa đổi hoặc thay thế bất kỳ điều khoản nào trong văn bản này vào bất kỳ thời điểm nào. Chúng tôi sẽ đăng thông báo trên trang chủ hoặc gửi qua Email nếu có những thay đổi lớn ảnh hưởng nghiêm trọng tới quyền lợi của người dùng. Việc bạn tiếp tục sử dụng ứng dụng sau khi các thay đổi được cập nhật đồng nghĩa với việc chấp nhận điều khoản mới.
            </p>
          </section>

          <section className="space-y-4 pt-4 border-t border-white/5">
            <h2 className="text-lg md:text-xl font-bold text-white">Thắc mắc về điều khoản</h2>
            <p>
              Nếu bạn có bất kỳ câu hỏi nào về Điều khoản sử dụng dịch vụ của Macflix, vui lòng liên hệ bộ phận hỗ trợ qua trang <Link href="/lien-he" className="text-[#d070ff] hover:underline font-medium">Liên hệ hỗ trợ</Link>.
            </p>
          </section>

        </div>
      </div>
    </main>
  );
}
