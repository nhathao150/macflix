'use client';

import Navbar from '@/components/layout/Navbar';
import Link from 'next/link';
import { ArrowLeft, GitBranch, Milestone, Star, Sparkles } from 'lucide-react';

type ChangelogItem = {
  version: string;
  date: string;
  isLatest?: boolean;
  title: string;
  changes: string[];
};

const CHANGELOG_DATA: ChangelogItem[] = [
  {
    version: 'v1.2.0',
    date: '13 tháng 07, 2026',
    isLatest: true,
    title: 'Bản cập nhật thông tin & tối ưu hóa di động',
    changes: [
      'Bổ sung đầy đủ các trang thông tin chính sách bảo mật, điều khoản sử dụng, bản quyền DMCA.',
      'Bổ sung trang Cài đặt (Settings) tương tác thực tế với khả năng lưu cấu hình chất lượng video, phụ đề trực tiếp vào bộ nhớ trình duyệt.',
      'Bổ sung trang Trợ giúp (FAQ) dạng accordion tương tác mượt mà và trang Liên hệ tích hợp form gửi phản hồi hỗ trợ.',
      'Tối ưu hóa khả năng phản hồi (Responsive) của thanh BottomNav và Footer trên mọi kích cỡ màn hình di động.',
      'Tối ưu hóa các truy vấn API trang chủ bằng Promise.all để tăng tốc độ tải trang lên đến 40%.'
    ]
  },
  {
    version: 'v1.1.0',
    date: '30 tháng 06, 2026',
    title: 'Bản cập nhật Cá nhân hóa & Tài khoản',
    changes: [
      'Tích hợp tính năng đăng ký, đăng nhập tài khoản miễn phí qua Google & Email.',
      'Bổ sung trang Cá nhân (Profile) hỗ trợ người dùng tự thay đổi tên hiển thị, mật khẩu và đổi ảnh đại diện.',
      'Tích hợp tính năng lưu Lịch sử xem phim (Watch History) và lưu phim Yêu thích (Favorites) đồng bộ hóa đám mây.',
      'Nâng cấp hộp tìm kiếm thông minh tự động gợi ý kết quả phim (Autocomplete Search) ngay khi gõ phím.'
    ]
  },
  {
    version: 'v1.0.0',
    date: '15 tháng 06, 2026',
    title: 'Ra mắt phiên bản đầu tiên',
    changes: [
      'Chính thức phát hành nền tảng xem phim trực tuyến miễn phí Macflix.',
      'Thiết kế giao diện tối hiện đại, cao cấp lấy cảm hứng từ các nền tảng xem phim hàng đầu.',
      'Xây dựng thành công hệ thống lọc phim theo Thể loại, Quốc gia và công cụ Tìm kiếm phim tối ưu.',
      'Tích hợp trình phát video đa server chất lượng HD, tự động nhớ vị trí phát phim dở.'
    ]
  }
];

export default function VersionPage() {
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
            <span className="text-white/60">Phiên bản ứng dụng</span>
          </div>

          <div className="flex items-center gap-3 mt-2">
            <div className="w-12 h-12 rounded-2xl flex items-center justify-center" style={{ background: 'rgba(114,38,255,0.15)' }}>
              <GitBranch className="w-6 h-6" style={{ color: '#7226FF' }} />
            </div>
            <div>
              <h1 className="text-2xl md:text-4xl font-black text-white tracking-tight">
                Lịch Sử Cập Nhật
              </h1>
              <p className="text-white/45 text-xs md:text-sm mt-1">Danh sách các phiên bản và lịch trình phát triển ứng dụng Macflix</p>
            </div>
          </div>
        </div>
      </div>

      {/* Content Area */}
      <div className="max-w-4xl mx-auto px-6 py-12">
        <div className="relative border-l border-white/10 pl-6 md:pl-10 space-y-12 ml-4">
          
          {CHANGELOG_DATA.map((item, idx) => (
            <div key={item.version} className="relative group">
              {/* Timeline Bullet */}
              <div className={`absolute -left-[31px] md:-left-[47px] top-1.5 w-4 h-4 rounded-full border-2 bg-[#0a0a0c] transition-colors duration-300 ${
                item.isLatest 
                  ? 'border-[#F042FF] shadow-[0_0_10px_rgba(240,66,255,0.5)] bg-[#F042FF]' 
                  : 'border-white/30 group-hover:border-purple-500'
              }`} />

              <div className="bg-white/[0.02] border border-white/5 rounded-3xl p-6 md:p-8 backdrop-blur-sm space-y-4">
                
                {/* Badge Version & Date */}
                <div className="flex flex-wrap items-center justify-between gap-3">
                  <div className="flex items-center gap-3">
                    <span className={`px-3 py-1 rounded-full text-xs font-black tracking-wider ${
                      item.isLatest 
                        ? 'bg-[#F042FF] text-white' 
                        : 'bg-white/5 border border-white/10 text-white/70'
                    }`}>
                      {item.version}
                    </span>
                    {item.isLatest && (
                      <span className="flex items-center gap-1 text-[10px] md:text-xs text-yellow-400 font-bold uppercase tracking-wider animate-pulse">
                        <Sparkles className="w-3.5 h-3.5 shrink-0" /> Phiên bản mới nhất
                      </span>
                    )}
                  </div>
                  <span className="text-xs text-white/40 font-medium">{item.date}</span>
                </div>

                {/* Title */}
                <h2 className="text-base md:text-lg font-bold text-white group-hover:text-purple-400 transition-colors">
                  {item.title}
                </h2>

                {/* Changes List */}
                <ul className="space-y-3.5 pt-2">
                  {item.changes.map((change, cIdx) => (
                    <li key={cIdx} className="flex gap-3 text-xs md:text-sm text-white/60 leading-relaxed items-start">
                      <Star className={`w-4 h-4 shrink-0 mt-0.5 ${item.isLatest ? 'text-[#F042FF]' : 'text-purple-400/70'}`} />
                      <span>{change}</span>
                    </li>
                  ))}
                </ul>

              </div>
            </div>
          ))}

        </div>
      </div>
    </main>
  );
}
