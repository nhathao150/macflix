'use client';

import { useState } from 'react';
import Navbar from '@/components/layout/Navbar';
import Link from 'next/link';
import { ArrowLeft, HelpCircle, ChevronDown, MessageSquare, Shield, Play } from 'lucide-react';

type FaqItem = {
  question: string;
  answer: string;
  category: 'general' | 'player' | 'account';
};

const FAQ_DATA: FaqItem[] = [
  {
    category: 'general',
    question: 'Xem phim trên Macflix có mất phí không?',
    answer: 'Không, Macflix là nền tảng xem phim hoàn toàn miễn phí phục vụ cộng đồng. Bạn không cần nạp tiền hay mua bất kỳ gói dịch vụ nào để xem toàn bộ kho phim HD của chúng tôi.'
  },
  {
    category: 'player',
    question: 'Phim không phát được hoặc bị màn hình đen/load chậm, làm sao để khắc phục?',
    answer: 'Trường hợp phim không tải được hoặc load chậm, bạn có thể xử lý nhanh theo các bước: 1. Đổi server phát phim (nếu phim có nhiều nguồn phát). 2. Kiểm tra lại đường truyền Internet của bạn. 3. Thử tải lại trang (F5 / Cmd+R). 4. Xóa bộ nhớ đệm (cache) trình duyệt hoặc thử xem trên tab ẩn danh.'
  },
  {
    category: 'general',
    question: 'Tôi muốn đề xuất thêm phim mới hoặc báo lỗi tập phim thì làm thế nào?',
    answer: 'Chúng tôi rất trân trọng mọi ý kiến đóng góp của người xem. Bạn có thể sử dụng biểu mẫu Liên hệ trực tiếp của chúng tôi hoặc nhắn tin qua Fanpage chính thức để đề xuất thêm phim hoặc báo lỗi tập phim bị hỏng/lỗi âm thanh.'
  },
  {
    category: 'player',
    question: 'Làm thế nào để tải phim về thiết bị?',
    answer: 'Hiện tại, Macflix chỉ hỗ trợ phát phim trực tuyến chất lượng cao trực tiếp trên website để đảm bảo tính an toàn và giảm thiểu rủi ro tải xuống mã độc. Chúng tôi chưa hỗ trợ tính năng tải phim trực tiếp về máy.'
  },
  {
    category: 'account',
    question: 'Tại sao tôi nên đăng ký tài khoản trên Macflix?',
    answer: 'Mặc dù bạn hoàn toàn có thể xem phim mà không cần đăng nhập, việc đăng ký tài khoản miễn phí trên Macflix sẽ giúp bạn sử dụng được các tính năng cao cấp: Lưu phim yêu thích vào thư viện riêng, tự động lưu tiến độ xem dở để xem tiếp bất cứ lúc nào, tùy chọn giao diện cá nhân.'
  },
  {
    category: 'account',
    question: 'Mật khẩu và thông tin tài khoản của tôi được bảo mật như thế nào?',
    answer: 'Macflix coi trọng việc bảo mật dữ liệu của bạn. Mật khẩu tài khoản của bạn được mã hóa một chiều bằng thuật toán hiện đại trước khi lưu trữ trong cơ sở dữ liệu. Chúng tôi cam kết tuyệt đối không chia sẻ thông tin email hay dữ liệu cá nhân của bạn cho bất kỳ bên thứ ba nào.'
  }
];

export default function HelpFaqPage() {
  const [openIndex, setOpenIndex] = useState<number | null>(0);
  const [activeTab, setActiveTab] = useState<'all' | 'general' | 'player' | 'account'>('all');

  const filteredFaq = activeTab === 'all' 
    ? FAQ_DATA 
    : FAQ_DATA.filter(item => item.category === activeTab);

  const toggleItem = (index: number) => {
    setOpenIndex(openIndex === index ? null : index);
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
            <span className="text-white/60">Trợ giúp & FAQ</span>
          </div>

          <div className="flex items-center gap-3 mt-2">
            <div className="w-12 h-12 rounded-2xl flex items-center justify-center" style={{ background: 'rgba(114,38,255,0.15)' }}>
              <HelpCircle className="w-6 h-6" style={{ color: '#7226FF' }} />
            </div>
            <div>
              <h1 className="text-2xl md:text-4xl font-black text-white tracking-tight">
                Trợ Giúp & FAQ
              </h1>
              <p className="text-white/45 text-xs md:text-sm mt-1">Giải đáp các câu hỏi thường gặp khi xem phim tại Macflix</p>
            </div>
          </div>
        </div>
      </div>

      {/* Content Area */}
      <div className="max-w-4xl mx-auto px-6 py-12 flex flex-col gap-8">
        
        {/* Category Tabs */}
        <div className="flex gap-2 p-1 bg-white/5 border border-white/5 rounded-2xl w-full sm:w-max">
          {[
            { id: 'all', name: 'Tất cả' },
            { id: 'general', name: 'Chung' },
            { id: 'player', name: 'Trình phát & Video' },
            { id: 'account', name: 'Tài khoản' }
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => {
                setActiveTab(tab.id as any);
                setOpenIndex(null);
              }}
              className={`flex-1 sm:flex-initial px-4 py-2 text-xs md:text-sm font-semibold rounded-xl transition-all duration-200 ${
                activeTab === tab.id 
                  ? 'bg-white/10 text-white shadow' 
                  : 'text-white/45 hover:text-white/80'
              }`}
            >
              {tab.name}
            </button>
          ))}
        </div>

        {/* FAQ Accordion */}
        <div className="space-y-3">
          {filteredFaq.length > 0 ? (
            filteredFaq.map((item, idx) => {
              const isOpen = openIndex === idx;
              return (
                <div 
                  key={idx} 
                  className={`bg-white/[0.02] border transition-all duration-300 rounded-2xl overflow-hidden ${
                    isOpen ? 'border-white/10 bg-white/[0.04]' : 'border-white/5 hover:border-white/10'
                  }`}
                >
                  <button
                    onClick={() => toggleItem(idx)}
                    className="w-full px-6 py-5 flex items-center justify-between text-left gap-4"
                  >
                    <span className="font-bold text-sm md:text-base text-white/90">{item.question}</span>
                    <ChevronDown className={`w-5 h-5 text-white/45 shrink-0 transition-transform duration-300 ${isOpen ? 'rotate-180 text-[#F042FF]' : ''}`} />
                  </button>
                  
                  <div 
                    className={`transition-all duration-300 ease-in-out ${
                      isOpen ? 'max-h-[300px] border-t border-white/5 opacity-100' : 'max-h-0 opacity-0 pointer-events-none'
                    }`}
                  >
                    <div className="px-6 py-5 text-white/60 text-sm leading-relaxed bg-black/10">
                      {item.answer}
                    </div>
                  </div>
                </div>
              );
            })
          ) : (
            <div className="text-center py-12 text-white/40">Không tìm thấy câu hỏi phù hợp.</div>
          )}
        </div>

        {/* Still need help */}
        <div className="mt-8 bg-gradient-to-r from-[#7226FF]/10 to-[#F042FF]/10 border border-purple-500/20 rounded-3xl p-6 md:p-8 flex flex-col md:flex-row items-center justify-between gap-6">
          <div className="space-y-1.5 text-center md:text-left">
            <h3 className="font-bold text-white text-base md:text-lg">Không tìm thấy câu trả lời?</h3>
            <p className="text-xs md:text-sm text-white/60">Đội ngũ kỹ thuật của chúng tôi sẵn sàng giải đáp thắc mắc riêng của bạn.</p>
          </div>
          <Link 
            href="/lien-he"
            className="px-6 py-3 rounded-xl text-white font-bold text-sm transition-all flex items-center gap-2 shrink-0 active-scale"
            style={{ background: 'linear-gradient(135deg, #7226FF, #F042FF)', boxShadow: '0 0 20px rgba(114,38,255,0.2)' }}
          >
            <MessageSquare className="w-4 h-4" /> Gửi yêu cầu hỗ trợ
          </Link>
        </div>

      </div>
    </main>
  );
}
