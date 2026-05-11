'use client';

import { useState } from 'react';
import Link from 'next/link';
import { Mail, ArrowRight, Loader2 } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setSuccess('');
    setIsLoading(true);

    try {
      const res = await fetch('/api/auth/forgot-password', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email }),
      });

      const data = await res.json();

      if (res.ok) {
        setSuccess(data.message || 'Yêu cầu đã được gửi thành công! Hãy kiểm tra hộp thư của bạn.');
      } else {
        setError(data.message || 'Có lỗi xảy ra, vui lòng thử lại.');
      }
    } catch (err) {
      setError('Lỗi kết nối máy chủ.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <main className="min-h-screen flex items-center justify-center p-4 relative overflow-hidden">
      {/* Nền mờ phía sau */}
      <div className="absolute inset-0 bg-[#010030]/60 backdrop-blur-sm z-0" />

      {/* Box Form */}
      <motion.div 
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        className="w-full max-w-md bg-white/10 backdrop-blur-2xl border border-white/20 rounded-3xl p-8 shadow-[0_8px_32px_rgba(0,0,0,0.5)] relative z-10 overflow-hidden"
      >
        <Link href="/dang-nhap" className="absolute top-6 left-6 text-white/50 hover:text-white transition-colors flex items-center gap-1 text-sm font-medium">
          <ArrowRight className="w-4 h-4 rotate-180" /> Quay lại
        </Link>

        <div className="text-center mt-6 mb-8">
          <h2 className="font-black text-white uppercase tracking-widest text-2xl">
            Quên mật khẩu
          </h2>
          <p className="text-white/50 text-sm mt-2">
            Nhập email của bạn để nhận liên kết đặt lại mật khẩu.
          </p>
        </div>

        <AnimatePresence>
          {error && (
            <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }} className="mb-4 p-3 rounded-xl bg-red-500/20 border border-red-500/50 text-red-200 text-sm text-center">
              {error}
            </motion.div>
          )}
          {success && (
            <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }} className="mb-4 p-4 rounded-xl bg-emerald-500/20 border border-emerald-500/50 text-emerald-200 text-sm text-center">
              <p className="mb-2 font-medium">{success}</p>
            </motion.div>
          )}
        </AnimatePresence>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="relative">
            <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
              <Mail className="h-5 w-5 text-white/40" />
            </div>
            <input
              type="email"
              placeholder="Email của bạn"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              className="w-full bg-black/20 border border-white/10 rounded-xl py-3 pl-11 pr-4 text-white placeholder:text-white/30 focus:outline-none focus:ring-2 focus:ring-[#F042FF]/50 focus:border-[#F042FF]/50 transition-all"
            />
          </div>

          <button
            type="submit"
            disabled={isLoading || !!success}
            className="w-full py-3.5 mt-2 text-white font-bold rounded-xl transition-all flex items-center justify-center disabled:opacity-70 shadow-[0_0_20px_rgba(240,66,255,0.3)] hover:shadow-[0_0_25px_rgba(240,66,255,0.5)] hover:opacity-90"
            style={{background: 'linear-gradient(135deg, #F042FF, #7226FF)'}}
          >
            {isLoading ? <Loader2 className="w-5 h-5 animate-spin" /> : 'Gửi yêu cầu'}
          </button>
        </form>
      </motion.div>
    </main>
  );
}
