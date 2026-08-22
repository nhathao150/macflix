'use client';

import Navbar from '@/components/layout/Navbar';
import Link from 'next/link';
import { ArrowLeft, Sparkles, Film, Heart, Zap, Globe, Shield } from 'lucide-react';

export default function AboutPage() {
  return (
    <main className="min-h-screen bg-[#0a0a0c] text-white selection:bg-[#F042FF]/30 pb-28">
      <Navbar />

      {/* Hero Header */}
      <div className="relative overflow-hidden pt-24 md:pt-[120px] pb-12 border-b border-white/5">
        <div className="absolute inset-0 bg-gradient-to-b from-[#F042FF]/10 via-[#7226FF]/5 to-transparent pointer-events-none" />
        <div className="max-w-5xl mx-auto px-6 flex flex-col gap-4">
          <div className="flex items-center gap-2 text-white/40 hover:text-white transition-colors text-sm">
            <Link href="/" className="flex items-center gap-1.5 hover:underline">
              <ArrowLeft className="w-4 h-4" /> Trang chủ
            </Link>
            <span>/</span>
            <span className="text-white/60">Giới thiệu ứng dụng</span>
          </div>

          <div className="flex items-center gap-3 mt-2">
            <div className="w-12 h-12 rounded-2xl flex items-center justify-center" style={{ background: 'rgba(240,66,255,0.15)' }}>
              <Sparkles className="w-6 h-6" style={{ color: '#F042FF' }} />
            </div>
            <div>
              <h1 className="text-2xl md:text-4xl font-black text-white tracking-tight">
                Về Macflix
              </h1>
              <p className="text-white/45 text-xs md:text-sm mt-1">Dự án xem phim HD chất lượng cao phi thương mại vì cộng đồng</p>
            </div>
          </div>
        </div>
      </div>

      {/* Content Area */}
      <div className="max-w-5xl mx-auto px-6 py-12 space-y-12">
        
        {/* Intro Section */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 items-center">
          <div className="space-y-4">
            <h2 className="text-xl md:text-2xl font-black text-white">Chúng tôi là ai?</h2>
            <p className="text-white/70 text-sm md:text-base leading-relaxed">
              Macflix là một trang web xem phim trực tuyến được phát triển với sứ mệnh mang lại trải nghiệm xem phim hoàn toàn miễn phí, mượt mà và tối giản nhất cho cộng đồng yêu thích phim ảnh tại Việt Nam.
            </p>
            <p className="text-white/70 text-sm md:text-base leading-relaxed">
              Chúng tôi loại bỏ các rào cản về chi phí, các hình thức quảng cáo độc hại hay pop-up gây phiền phức để người xem có thể trọn vẹn chìm đắm trong thế giới điện ảnh đỉnh cao.
            </p>
          </div>
          <div className="p-8 bg-gradient-to-br from-[#7226FF]/20 to-[#F042FF]/20 border border-purple-500/20 rounded-3xl relative overflow-hidden flex flex-col justify-center gap-4">
            <div className="absolute top-0 right-0 w-32 h-32 bg-purple-500/10 rounded-full blur-3xl pointer-events-none" />
            <h3 className="font-bold text-white text-base md:text-lg">Cam kết dịch vụ 3 KHÔNG:</h3>
            <ul className="space-y-2 text-sm text-white/85 font-medium">
              <li className="flex items-center gap-2">✓ Không phí dịch vụ ẩn</li>
              <li className="flex items-center gap-2">✓ Không quảng cáo độc hại/pop-up</li>
              <li className="flex items-center gap-2">✓ Không yêu cầu thông tin nhạy cảm</li>
            </ul>
          </div>
        </div>

        {/* Feature Grid */}
        <div className="space-y-6">
          <h2 className="text-xl md:text-2xl font-black text-white text-center">Các giá trị cốt lõi</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            
            {/* Speed */}
            <div className="p-6 bg-white/[0.02] border border-white/5 rounded-2xl flex flex-col gap-3">
              <div className="w-10 h-10 rounded-xl bg-white/5 border border-white/10 flex items-center justify-center shrink-0">
                <Zap className="w-5 h-5 text-[#87F5F5]" />
              </div>
              <h3 className="font-bold text-white text-sm">Tốc độ tối ưu</h3>
              <p className="text-xs text-white/50 leading-relaxed">Nguồn phát phim được lập chỉ mục thông minh từ các server CDN tốc độ cao, đảm bảo quá trình tải phim mượt mà ít gián đoạn.</p>
            </div>

            {/* Content */}
            <div className="p-6 bg-white/[0.02] border border-white/5 rounded-2xl flex flex-col gap-3">
              <div className="w-10 h-10 rounded-xl bg-white/5 border border-white/10 flex items-center justify-center shrink-0">
                <Film className="w-5 h-5 text-[#F042FF]" />
              </div>
              <h3 className="font-bold text-white text-sm">Kho phim phong phú</h3>
              <p className="text-xs text-white/50 leading-relaxed">Hàng ngàn đầu phim bộ, phim lẻ, phim hoạt hình và anime được tuyển chọn và cập nhật liên tục mỗi ngày.</p>
            </div>

            {/* Translation */}
            <div className="p-6 bg-white/[0.02] border border-white/5 rounded-2xl flex flex-col gap-3">
              <div className="w-10 h-10 rounded-xl bg-white/5 border border-white/10 flex items-center justify-center shrink-0">
                <Globe className="w-5 h-5 text-purple-400" />
              </div>
              <h3 className="font-bold text-white text-sm">Phụ đề chất lượng</h3>
              <p className="text-xs text-white/50 leading-relaxed">Ưu tiên tuyển chọn các nguồn phim có phụ đề Việt ngữ chuẩn xác, dễ đọc và truyền tải tốt hồn cốt tác phẩm.</p>
            </div>

            {/* Security */}
            <div className="p-6 bg-white/[0.02] border border-white/5 rounded-2xl flex flex-col gap-3">
              <div className="w-10 h-10 rounded-xl bg-white/5 border border-white/10 flex items-center justify-center shrink-0">
                <Shield className="w-5 h-5 text-green-400" />
              </div>
              <h3 className="font-bold text-white text-sm">Bảo mật tuyệt đối</h3>
              <p className="text-xs text-white/50 leading-relaxed">Dữ liệu cá nhân, lịch sử xem phim hay tài khoản của bạn được mã hóa an toàn trên hệ thống máy chủ của chúng tôi.</p>
            </div>

          </div>
        </div>

        {/* Development Tech Stack */}
        <div className="bg-white/[0.02] border border-white/5 rounded-3xl p-6 md:p-8 backdrop-blur-sm space-y-4">
          <h2 className="text-lg md:text-xl font-bold text-white">Nền tảng công nghệ sử dụng</h2>
          <p className="text-white/60 text-sm leading-relaxed">
            Macflix được xây dựng trên nền tảng kỹ thuật hiện đại bậc nhất hiện nay giúp tối ưu hóa SEO và tốc độ tải trang cực kỳ nhanh chóng:
          </p>
          <div className="flex flex-wrap gap-2 pt-2">
            {['Next.js 15', 'React 19', 'Tailwind CSS v4', 'Lucide Icons', 'NextAuth.js', 'MongoDB'].map((tech) => (
              <span key={tech} className="px-3.5 py-1 rounded-full text-xs font-semibold bg-white/5 border border-white/10 text-white/80">
                {tech}
              </span>
            ))}
          </div>
        </div>

      </div>
    </main>
  );
}
