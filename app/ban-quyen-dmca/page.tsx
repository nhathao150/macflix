'use client';

import Navbar from '@/components/layout/Navbar';
import Link from 'next/link';
import { ArrowLeft, AlertCircle, Mail, Globe, Scale } from 'lucide-react';

export default function DmcaPage() {
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
            <span className="text-white/60">Copyright & DMCA</span>
          </div>

          <div className="flex items-center gap-3 mt-2">
            <div className="w-12 h-12 rounded-2xl flex items-center justify-center" style={{ background: 'rgba(239,68,68,0.15)' }}>
              <Scale className="w-6 h-6 text-red-500" />
            </div>
            <div>
              <h1 className="text-2xl md:text-4xl font-black text-white tracking-tight">
                Copyright & DMCA
              </h1>
              <p className="text-white/45 text-xs md:text-sm mt-1">Thông tin bản quyền và thủ tục khiếu nại</p>
            </div>
          </div>
        </div>
      </div>

      {/* Content Area */}
      <div className="max-w-4xl mx-auto px-6 py-12">
        <div className="bg-white/[0.02] border border-white/5 rounded-3xl p-6 md:p-10 backdrop-blur-sm space-y-8 text-white/70 text-sm md:text-base leading-relaxed">
          
          <section className="space-y-4">
            <h2 className="text-lg md:text-xl font-bold text-white flex items-center gap-2">
              <span className="w-1.5 h-6 rounded-full bg-red-500" />
              1. Tuyên bố từ chối trách nhiệm nội dung
            </h2>
            <p>
              Macflix là một nền tảng tìm kiếm, tổng hợp và lập chỉ mục nội dung video trực tuyến. Chúng tôi <strong>không lưu trữ trực tiếp</strong> bất kỳ tệp video phim nào trên máy chủ của mình. Tất cả nội dung phim được chia sẻ và truyền tải thông qua liên kết nhúng (embedded links) từ các nhà cung cấp bên thứ ba hoặc các dịch vụ lưu trữ video công cộng.
            </p>
            <p>
              Vì vậy, bất kỳ vấn đề pháp lý nào liên quan đến bản quyền video phải được giải quyết trực tiếp với nhà phát triển máy chủ lưu trữ tệp tin đó. Macflix không chịu trách nhiệm pháp lý đối với nội dung được đăng tải trên các trang web bên thứ ba.
            </p>
          </section>

          <section className="space-y-4">
            <h2 className="text-lg md:text-xl font-bold text-white flex items-center gap-2">
              <span className="w-1.5 h-6 rounded-full bg-red-500" />
              2. Đạo luật Bản quyền Thiên niên kỷ Kỹ thuật số (DMCA)
            </h2>
            <p>
              Chúng tôi tôn trọng sâu sắc các quyền sở hữu trí tuệ của người khác. Theo quy định của Đạo luật DMCA, chúng tôi sẽ phản hồi nhanh chóng và xử lý các thông báo cáo buộc vi phạm bản quyền hợp lệ được gửi đến bộ phận quản trị.
            </p>
            <div className="p-4 bg-red-500/5 border border-red-500/20 rounded-2xl flex gap-3 text-red-200/90 text-xs md:text-sm">
              <AlertCircle className="w-5 h-5 text-red-400 shrink-0 mt-0.5" />
              <p>
                Nếu bạn là chủ sở hữu bản quyền hợp pháp hoặc đại diện được ủy quyền và tin rằng bất kỳ liên kết nhúng nào trên Macflix đang xâm phạm quyền tác giả của bạn, vui lòng gửi một yêu cầu gỡ bỏ chính thức theo hướng dẫn dưới đây.
              </p>
            </div>
          </section>

          <section className="space-y-4">
            <h2 className="text-lg md:text-xl font-bold text-white flex items-center gap-2">
              <span className="w-1.5 h-6 rounded-full bg-red-500" />
              3. Quy trình gửi yêu cầu gỡ bỏ bản quyền
            </h2>
            <p>
              Để gửi yêu cầu khiếu nại bản quyền hợp lệ, vui lòng cung cấp văn bản chứa các thông tin chi tiết sau:
            </p>
            <ol className="list-decimal pl-6 space-y-3 text-white/65">
              <li>Chữ ký vật lý hoặc chữ ký điện tử của người được ủy quyền hành động thay mặt cho chủ sở hữu bản quyền bị cáo buộc vi phạm.</li>
              <li>Mô tả chi tiết tác phẩm có bản quyền mà bạn tuyên bố đã bị vi phạm bản quyền.</li>
              <li>Đường dẫn URL cụ thể trên trang web Macflix dẫn đến bộ phim chứa nội dung vi phạm bản quyền đó để chúng tôi dễ dàng xác định.</li>
              <li>Thông tin liên hệ của bạn bao gồm: Địa chỉ, số điện thoại và địa chỉ Email để chúng tôi liên lạc lại.</li>
              <li>Tuyên bố chứng minh rằng bạn tin tưởng một cách trung thực rằng việc sử dụng tài liệu theo cách bị khiếu nại không được sự cho phép của chủ sở hữu bản quyền, đại diện của họ hoặc pháp luật.</li>
            </ol>
          </section>

          <section className="space-y-4">
            <h2 className="text-lg md:text-xl font-bold text-white flex items-center gap-2">
              <span className="w-1.5 h-6 rounded-full bg-red-500" />
              4. Địa chỉ tiếp nhận phản hồi
            </h2>
            <p>
              Tất cả các thông báo gỡ bỏ bản quyền (DMCA) hợp lệ xin vui lòng gửi trực tiếp về email của ban quản trị:
            </p>
            <div className="flex flex-col sm:flex-row gap-3 pt-2">
              <div className="flex-1 p-4 bg-white/5 border border-white/5 rounded-2xl flex items-center gap-3">
                <Mail className="w-5 h-5 text-red-400 shrink-0" />
                <div>
                  <h3 className="font-semibold text-white text-xs uppercase tracking-wider">Hòm thư điện tử</h3>
                  <p className="text-sm text-white/80">dmca@macflix.com</p>
                </div>
              </div>
              <div className="flex-1 p-4 bg-white/5 border border-white/5 rounded-2xl flex items-center gap-3">
                <Globe className="w-5 h-5 text-red-400 shrink-0" />
                <div>
                  <h3 className="font-semibold text-white text-xs uppercase tracking-wider">Thời gian xử lý</h3>
                  <p className="text-sm text-white/80">Trong vòng 24 - 48 giờ làm việc</p>
                </div>
              </div>
            </div>
            <p className="text-xs text-white/40 italic mt-2">
              * Lưu ý: Các thư gửi không đúng cấu trúc quy định hoặc thiếu thông tin đường dẫn chứng minh vi phạm sẽ không được xử lý.
            </p>
          </section>

        </div>
      </div>
    </main>
  );
}
