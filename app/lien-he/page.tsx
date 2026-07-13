'use client';

import { useState } from 'react';
import Navbar from '@/components/layout/Navbar';
import Link from 'next/link';
import { ArrowLeft, Mail, MessageSquare, Send, CheckCircle2, Loader2, Sparkles, Image as ImageIcon, X } from 'lucide-react';

export default function ContactPage() {
  const [form, setForm] = useState({ name: '', email: '', subject: '', message: '' });
  const [screenshot, setScreenshot] = useState<string>('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [error, setError] = useState('');

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Giới hạn 2MB để tránh vượt quá giới hạn payload của Next.js
    if (file.size > 2 * 1024 * 1024) {
      setError('Kích thước ảnh tối đa là 2MB. Vui lòng chọn ảnh nhẹ hơn.');
      return;
    }

    if (!file.type.startsWith('image/')) {
      setError('Vui lòng chỉ chọn tệp hình ảnh (PNG, JPG, JPEG, WEBP).');
      return;
    }

    setError('');
    const reader = new FileReader();
    reader.onload = (ev) => {
      setScreenshot(ev.target?.result as string);
    };
    reader.readAsDataURL(file);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (!form.name || !form.email || !form.subject || !form.message) {
      setError('Vui lòng điền đầy đủ tất cả các trường thông tin.');
      return;
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(form.email)) {
      setError('Địa chỉ email không hợp lệ. Vui lòng kiểm tra lại.');
      return;
    }

    setIsSubmitting(true);

    try {
      const res = await fetch('/api/contact', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ ...form, screenshot }),
      });

      const data = await res.json();

      if (res.ok) {
        setIsSubmitted(true);
        setForm({ name: '', email: '', subject: '', message: '' });
        setScreenshot('');
      } else {
        setError(data.message || 'Gửi liên hệ thất bại. Vui lòng thử lại.');
      }
    } catch (err) {
      console.error('Lỗi khi gửi form liên hệ:', err);
      setError('Lỗi kết nối tới máy chủ. Vui lòng thử lại sau.');
    } finally {
      setIsSubmitting(false);
    }
  };

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
            <span className="text-white/60">Liên hệ</span>
          </div>

          <div className="flex items-center gap-3 mt-2">
            <div className="w-12 h-12 rounded-2xl flex items-center justify-center" style={{ background: 'rgba(240,66,255,0.15)' }}>
              <MessageSquare className="w-6 h-6" style={{ color: '#F042FF' }} />
            </div>
            <div>
              <h1 className="text-2xl md:text-4xl font-black text-white tracking-tight">
                Liên Hệ Với Chúng Tôi
              </h1>
              <p className="text-white/45 text-xs md:text-sm mt-1">Chúng tôi luôn lắng nghe phản hồi của bạn để nâng cấp dịch vụ</p>
            </div>
          </div>
        </div>
      </div>

      {/* Content Area */}
      <div className="max-w-5xl mx-auto px-6 py-12 grid grid-cols-1 lg:grid-cols-5 gap-8">

        {/* Info Column (Left) */}
        <div className="lg:col-span-2 space-y-6">
          <div className="bg-white/[0.02] border border-white/5 rounded-3xl p-6 md:p-8 backdrop-blur-sm space-y-6">
            <h2 className="text-lg md:text-xl font-bold text-white flex items-center gap-2">
              <Sparkles className="w-5 h-5 text-[#F042FF]" />
              Trung tâm Phản hồi
            </h2>
            <p className="text-white/60 text-sm leading-relaxed">
              Bạn có câu hỏi, đóng góp ý kiến về giao diện, hoặc muốn hợp tác truyền thông với Macflix? Đừng ngần ngại gửi tin nhắn cho chúng tôi. Đội ngũ kỹ thuật và hỗ trợ viên sẽ cố gắng phản hồi sớm nhất có thể.
            </p>

            <div className="space-y-4 pt-4 border-t border-white/5">
              <div className="flex items-start gap-4">
                <div className="w-10 h-10 rounded-xl bg-white/5 border border-white/10 flex items-center justify-center shrink-0">
                  <Mail className="w-5 h-5 text-[#87F5F5]" />
                </div>
                <div>
                  <h3 className="font-bold text-white text-sm">Hòm thư hỗ trợ</h3>
                  <p className="text-xs text-white/40 mt-0.5">Thời gian trả lời: Trong vòng 24 giờ</p>
                  <p className="text-sm text-white/80 mt-1 font-medium">tranphannhathao159@gmail.com</p>
                </div>
              </div>

              <div className="flex items-start gap-4">
                <div className="w-10 h-10 rounded-xl bg-white/5 border border-white/10 flex items-center justify-center shrink-0">
                  <MessageSquare className="w-5 h-5" style={{ color: '#F042FF' }} />
                </div>
                <div>
                  <h3 className="font-bold text-white text-sm">Kênh mạng xã hội</h3>
                  <p className="text-xs text-white/40 mt-0.5">Theo dõi để cập nhật phim mới</p>
                  <div className="flex gap-2.5 mt-2">
                    <a href="#" className="text-xs text-[#F042FF] hover:underline font-semibold">Facebook</a>
                    <span className="text-white/10">•</span>
                    <a href="#" className="text-xs text-[#87F5F5] hover:underline font-semibold">Telegram</a>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Form Column (Right) */}
        <div className="lg:col-span-3">
          <div className="bg-white/[0.02] border border-white/5 rounded-3xl p-6 md:p-8 backdrop-blur-sm">
            {isSubmitted ? (
              <div className="py-12 flex flex-col items-center justify-center text-center gap-4 animate-in fade-in zoom-in duration-300">
                <div className="w-16 h-16 rounded-full bg-green-500/10 border border-green-500/20 flex items-center justify-center shadow-2xl">
                  <CheckCircle2 className="w-8 h-8 text-green-400" />
                </div>
                <h3 className="text-xl font-bold text-white mt-2">Gửi liên hệ thành công!</h3>
                <p className="text-white/50 text-sm max-w-sm">
                  Cảm ơn bạn đã gửi liên hệ. Macflix đã tiếp nhận ý kiến đóng góp và sẽ trả lời email của bạn sớm nhất.
                </p>
                <button
                  onClick={() => setIsSubmitted(false)}
                  className="mt-6 px-6 py-2.5 rounded-xl bg-white/5 hover:bg-white/10 text-white/80 hover:text-white text-sm font-medium transition-all active-scale"
                >
                  Gửi tin nhắn khác
                </button>
              </div>
            ) : (
              <form onSubmit={handleSubmit} className="space-y-5">
                <h2 className="text-lg md:text-xl font-bold text-white mb-2">Gửi tin nhắn trực tiếp</h2>

                {error && (
                  <div className="p-3.5 rounded-xl bg-red-500/10 border border-red-500/20 text-red-400 text-xs md:text-sm font-medium">
                    {error}
                  </div>
                )}

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="flex flex-col gap-1.5">
                    <label className="text-xs text-white/50 font-medium uppercase tracking-wider">Họ và tên *</label>
                    <input
                      type="text"
                      placeholder="Nguyễn Văn A"
                      value={form.name}
                      onChange={(e) => setForm(prev => ({ ...prev, name: e.target.value }))}
                      className="bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-sm text-white placeholder:text-white/20 focus:border-[#F042FF]/50 focus:ring-2 focus:ring-[#F042FF]/20 outline-none transition-all"
                    />
                  </div>
                  <div className="flex flex-col gap-1.5">
                    <label className="text-xs text-white/50 font-medium uppercase tracking-wider">Địa chỉ Email *</label>
                    <input
                      type="email"
                      placeholder="example@mail.com"
                      value={form.email}
                      onChange={(e) => setForm(prev => ({ ...prev, email: e.target.value }))}
                      className="bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-sm text-white placeholder:text-white/20 focus:border-[#F042FF]/50 focus:ring-2 focus:ring-[#F042FF]/20 outline-none transition-all"
                    />
                  </div>
                </div>

                <div className="flex flex-col gap-1.5">
                  <label className="text-xs text-white/50 font-medium uppercase tracking-wider">Chủ đề liên hệ *</label>
                  <input
                    type="text"
                    placeholder="Báo lỗi player, Đóng góp tính năng, Hợp tác..."
                    value={form.subject}
                    onChange={(e) => setForm(prev => ({ ...prev, subject: e.target.value }))}
                    className="bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-sm text-white placeholder:text-white/20 focus:border-[#F042FF]/50 focus:ring-2 focus:ring-[#F042FF]/20 outline-none transition-all"
                  />
                </div>

                <div className="flex flex-col gap-1.5">
                  <label className="text-xs text-white/50 font-medium uppercase tracking-wider">Nội dung tin nhắn *</label>
                  <textarea
                    rows={5}
                    placeholder="Hãy mô tả chi tiết vấn đề bạn đang gặp phải hoặc ý kiến đóng góp của bạn..."
                    value={form.message}
                    onChange={(e) => setForm(prev => ({ ...prev, message: e.target.value }))}
                    className="bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-sm text-white placeholder:text-white/20 focus:border-[#F042FF]/50 focus:ring-2 focus:ring-[#F042FF]/20 outline-none transition-all resize-none"
                  />
                </div>

                <div className="flex flex-col gap-1.5">
                  <label className="text-xs text-white/50 font-medium uppercase tracking-wider">Hình ảnh lỗi (Tùy chọn)</label>
                  {screenshot ? (
                    <div className="relative w-full sm:w-48 aspect-video rounded-xl overflow-hidden border border-white/10 group shadow-lg bg-white/5">
                      <img src={screenshot} alt="Lỗi screenshot" className="w-full h-full object-cover" />
                      <button
                        type="button"
                        onClick={() => setScreenshot('')}
                        className="absolute top-1.5 right-1.5 w-6 h-6 rounded-full bg-black/60 border border-white/20 flex items-center justify-center text-white hover:bg-red-500/80 hover:border-red-500 transition-colors cursor-pointer"
                      >
                        <X className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  ) : (
                    <label className="flex items-center justify-center gap-2.5 px-4 py-4 bg-white/5 border border-dashed border-white/15 hover:border-[#F042FF]/50 rounded-xl cursor-pointer transition-colors text-white/40 hover:text-white/80">
                      <ImageIcon className="w-4.5 h-4.5" />
                      <span className="text-xs md:text-sm font-semibold">Tải lên hình ảnh lỗi (Tối đa 2MB)</span>
                      <input
                        type="file"
                        accept="image/*"
                        className="hidden"
                        onChange={handleFileChange}
                      />
                    </label>
                  )}
                </div>

                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="w-full py-3 rounded-xl text-white font-bold text-sm transition-all flex items-center justify-center gap-2 disabled:opacity-50 hover:opacity-90 active-scale"
                  style={{ background: 'linear-gradient(135deg, #F042FF, #7226FF)', boxShadow: '0 0 20px rgba(240,66,255,0.2)' }}
                >
                  {isSubmitting ? <Loader2 className="w-4 h-4 animate-spin" /> : <Send className="w-4 h-4" />}
                  {isSubmitting ? 'Đang gửi thông điệp...' : 'Gửi liên hệ'}
                </button>
              </form>
            )}
          </div>
        </div>

      </div>
    </main>
  );
}
