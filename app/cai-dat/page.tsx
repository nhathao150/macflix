'use client';

import { useState, useEffect } from 'react';
import Navbar from '@/components/layout/Navbar';
import Link from 'next/link';
import { ArrowLeft, Settings, Film, Eye, Trash2, CheckCircle2, Sliders, Shield } from 'lucide-react';

export default function SettingsPage() {
  const [isClient, setIsClient] = useState(false);
  const [autoPlay, setAutoPlay] = useState(true);
  const [autoSkip, setAutoSkip] = useState(false);
  const [quality, setQuality] = useState('auto');
  const [subSize, setSubSize] = useState('medium');
  const [cinemaMode, setCinemaMode] = useState(true);

  const [toastMessage, setToastMessage] = useState('');

  // Tránh lỗi Hydration
  useEffect(() => {
    setIsClient(true);
    setAutoPlay(localStorage.getItem('macflix_autoplay') !== 'false');
    setAutoSkip(localStorage.getItem('macflix_autoskip') === 'true');
    setQuality(localStorage.getItem('macflix_quality') || 'auto');
    setSubSize(localStorage.getItem('macflix_subsize') || 'medium');
    setCinemaMode(localStorage.getItem('macflix_cinemamode') !== 'false');
  }, []);

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(''), 3000);
  };

  const handleSaveToggle = (key: string, value: boolean, setter: (v: boolean) => void) => {
    setter(value);
    localStorage.setItem(key, String(value));
    showToast('Cài đặt đã được lưu tự động!');
  };

  const handleSaveSelect = (key: string, value: string, setter: (v: string) => void) => {
    setter(value);
    localStorage.setItem(key, value);
    showToast('Cài đặt đã được lưu tự động!');
  };

  const handleClearHistory = () => {
    if (confirm('Bạn có chắc chắn muốn xóa toàn bộ lịch sử xem phim trên trình duyệt này?')) {
      localStorage.removeItem('watch-history');
      showToast('Đã xóa toàn bộ lịch sử xem phim cục bộ.');
    }
  };

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
            <span className="text-white/60">Cài đặt hệ thống</span>
          </div>

          <div className="flex items-center gap-3 mt-2">
            <div className="w-12 h-12 rounded-2xl flex items-center justify-center" style={{ background: 'rgba(240,66,255,0.15)' }}>
              <Settings className="w-6 h-6" style={{ color: '#F042FF' }} />
            </div>
            <div>
              <h1 className="text-2xl md:text-4xl font-black text-white tracking-tight">
                Cài Đặt Ứng Dụng
              </h1>
              <p className="text-white/45 text-xs md:text-sm mt-1">Cấu hình trình phát video và trải nghiệm xem phim của riêng bạn</p>
            </div>
          </div>
        </div>
      </div>

      {/* Content Area */}
      <div className="max-w-4xl mx-auto px-6 py-12 relative">
        
        {/* Success Toast */}
        {toastMessage && (
          <div className="fixed bottom-24 right-6 z-[200] bg-green-500 text-white font-semibold text-sm px-4 py-3 rounded-2xl shadow-2xl flex items-center gap-2 animate-in fade-in slide-in-from-bottom-5 duration-300">
            <CheckCircle2 className="w-4 h-4" />
            {toastMessage}
          </div>
        )}

        {isClient ? (
          <div className="space-y-6">
            
            {/* Cài đặt Trình Phát */}
            <div className="bg-white/[0.02] border border-white/5 rounded-3xl p-6 md:p-8 backdrop-blur-sm">
              <div className="flex items-center gap-3 mb-6 border-b border-white/5 pb-4">
                <Sliders className="w-5 h-5 text-[#F042FF]" />
                <h2 className="font-bold text-base md:text-lg">Tùy chỉnh Trình phát</h2>
              </div>
              
              <div className="space-y-6">
                {/* Autoplay toggle */}
                <div className="flex items-center justify-between gap-4">
                  <div>
                    <h3 className="font-semibold text-sm md:text-base text-white/90">Tự động phát tập tiếp theo</h3>
                    <p className="text-xs text-white/45 mt-0.5">Tự động chuyển sang tập mới khi kết thúc tập phim hiện tại.</p>
                  </div>
                  <button
                    onClick={() => handleSaveToggle('macflix_autoplay', !autoPlay, setAutoPlay)}
                    className={`w-12 h-6.5 rounded-full p-1 transition-all duration-300 flex items-center ${
                      autoPlay ? 'bg-[#F042FF]' : 'bg-white/10'
                    }`}
                  >
                    <div className={`w-4.5 h-4.5 rounded-full bg-white transition-transform duration-300 ${
                      autoPlay ? 'translate-x-5.5' : 'translate-x-0'
                    }`} />
                  </button>
                </div>

                {/* Auto Skip toggle */}
                <div className="flex items-center justify-between gap-4">
                  <div>
                    <h3 className="font-semibold text-sm md:text-base text-white/90">Tự động tua qua phần giới thiệu (Intro)</h3>
                    <p className="text-xs text-white/45 mt-0.5">Bỏ qua phần giới thiệu nhạc mở đầu của các tập phim bộ.</p>
                  </div>
                  <button
                    onClick={() => handleSaveToggle('macflix_autoskip', !autoSkip, setAutoSkip)}
                    className={`w-12 h-6.5 rounded-full p-1 transition-all duration-300 flex items-center ${
                      autoSkip ? 'bg-[#F042FF]' : 'bg-white/10'
                    }`}
                  >
                    <div className={`w-4.5 h-4.5 rounded-full bg-white transition-transform duration-300 ${
                      autoSkip ? 'translate-x-5.5' : 'translate-x-0'
                    }`} />
                  </button>
                </div>

                {/* Quality select */}
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pt-2">
                  <div>
                    <h3 className="font-semibold text-sm md:text-base text-white/90">Chất lượng video mặc định</h3>
                    <p className="text-xs text-white/45 mt-0.5">Chọn chất lượng tối ưu nhất cho mạng của bạn.</p>
                  </div>
                  <select
                    value={quality}
                    onChange={(e) => handleSaveSelect('macflix_quality', e.target.value, setQuality)}
                    className="bg-white/5 border border-white/10 rounded-xl px-3 py-2 text-sm text-white/80 focus:border-[#F042FF]/50 focus:ring-1 focus:ring-[#F042FF] outline-none"
                  >
                    <option className="bg-[#141414]" value="auto">Tự động (Auto)</option>
                    <option className="bg-[#141414]" value="1080">Full HD (1080p)</option>
                    <option className="bg-[#141414]" value="720">HD (720p)</option>
                    <option className="bg-[#141414]" value="480">Tiêu chuẩn (480p)</option>
                  </select>
                </div>
              </div>
            </div>

            {/* Cài đặt Giao Diện */}
            <div className="bg-white/[0.02] border border-white/5 rounded-3xl p-6 md:p-8 backdrop-blur-sm">
              <div className="flex items-center gap-3 mb-6 border-b border-white/5 pb-4">
                <Eye className="w-5 h-5 text-[#87F5F5]" />
                <h2 className="font-bold text-base md:text-lg">Tùy chỉnh Giao diện</h2>
              </div>

              <div className="space-y-6">
                {/* Subtitle Size */}
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                  <div>
                    <h3 className="font-semibold text-sm md:text-base text-white/90">Kích thước phụ đề</h3>
                    <p className="text-xs text-white/45 mt-0.5">Thay đổi cỡ chữ hiển thị của phụ đề phim tiếng Việt.</p>
                  </div>
                  <select
                    value={subSize}
                    onChange={(e) => handleSaveSelect('macflix_subsize', e.target.value, setSubSize)}
                    className="bg-white/5 border border-white/10 rounded-xl px-3 py-2 text-sm text-white/80 focus:border-[#F042FF]/50 focus:ring-1 focus:ring-[#F042FF] outline-none"
                  >
                    <option className="bg-[#141414]" value="small">Nhỏ</option>
                    <option className="bg-[#141414]" value="medium">Vừa (Mặc định)</option>
                    <option className="bg-[#141414]" value="large">Lớn</option>
                  </select>
                </div>

                {/* Cinema Mode Toggle */}
                <div className="flex items-center justify-between gap-4">
                  <div>
                    <h3 className="font-semibold text-sm md:text-base text-white/90">Chế độ rạp phim mặc định</h3>
                    <p className="text-xs text-white/45 mt-0.5">Tự động ẩn bớt các cột bên để mở rộng khung phát phim tối đa.</p>
                  </div>
                  <button
                    onClick={() => handleSaveToggle('macflix_cinemamode', !cinemaMode, setCinemaMode)}
                    className={`w-12 h-6.5 rounded-full p-1 transition-all duration-300 flex items-center ${
                      cinemaMode ? 'bg-[#F042FF]' : 'bg-white/10'
                    }`}
                  >
                    <div className={`w-4.5 h-4.5 rounded-full bg-white transition-transform duration-300 ${
                      cinemaMode ? 'translate-x-5.5' : 'translate-x-0'
                    }`} />
                  </button>
                </div>
              </div>
            </div>

            {/* Dữ Liệu Cục Bộ */}
            <div className="bg-white/[0.02] border border-white/5 rounded-3xl p-6 md:p-8 backdrop-blur-sm">
              <div className="flex items-center gap-3 mb-6 border-b border-white/5 pb-4">
                <Trash2 className="w-5 h-5 text-red-500" />
                <h2 className="font-bold text-base md:text-lg">Bộ nhớ & Dữ liệu duyệt web</h2>
              </div>

              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div>
                  <h3 className="font-semibold text-sm md:text-base text-white/90">Xóa lịch sử xem phim</h3>
                  <p className="text-xs text-white/45 mt-0.5">Xóa sạch toàn bộ lịch sử các tập phim bạn đã xem lưu trên trình duyệt này.</p>
                </div>
                <button
                  onClick={handleClearHistory}
                  className="px-5 py-2.5 rounded-xl border border-red-500/20 bg-red-500/10 hover:bg-red-500/20 text-red-400 text-xs md:text-sm font-semibold transition-all active-scale flex items-center gap-2"
                >
                  <Trash2 className="w-4 h-4" /> Xóa lịch sử
                </button>
              </div>
            </div>

          </div>
        ) : (
          <div className="flex justify-center items-center py-20">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#F042FF]" />
          </div>
        )}

      </div>
    </main>
  );
}
