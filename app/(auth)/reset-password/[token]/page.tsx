'use client';

import { useState, use, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Lock, Eye, EyeOff, Loader2, ArrowRight } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import Link from 'next/link';

export default function ResetPasswordPage({ params }: { params: Promise<{ token: string }> }) {
  const router = useRouter();
  const unwrappedParams = use(params);
  const token = unwrappedParams.token;
  
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    
    if (password !== confirmPassword) {
      setError('Mật khẩu nhập lại không khớp!');
      return;
    }

    if (password.length < 6) {
      setError('Mật khẩu phải có ít nhất 6 ký tự.');
      return;
    }

    setIsLoading(true);

    try {
      const res = await fetch('/api/auth/reset-password', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ token, newPassword: password }),
      });

      const data = await res.json();

      if (res.ok) {
        setSuccess('Đặt lại mật khẩu thành công! Đang chuyển hướng...');
        setTimeout(() => {
          router.push('/login');
        }, 2500);
      } else {
        setError(data.message || 'Có lỗi xảy ra. Vui lòng thử lại.');
      }
    } catch (err) {
      setError('Lỗi kết nối máy chủ.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <main className="min-h-screen flex items-center justify-center p-4 relative overflow-hidden">
      <div className="absolute inset-0 bg-[#010030]/60 backdrop-blur-sm z-0" />

      <motion.div 
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        className="w-full max-w-md bg-white/10 backdrop-blur-2xl border border-white/20 rounded-3xl p-8 shadow-[0_8px_32px_rgba(0,0,0,0.5)] relative z-10 overflow-hidden"
      >
        <div className="text-center mt-2 mb-8">
          <h2 className="font-black text-white uppercase tracking-widest text-2xl">
            Đặt mật khẩu mới
          </h2>
          <p className="text-white/50 text-sm mt-2">
            Vui lòng nhập mật khẩu mới cho tài khoản của bạn.
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
              {success}
            </motion.div>
          )}
        </AnimatePresence>

        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Mật khẩu mới */}
          <div className="relative">
            <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
              <Lock className="h-5 w-5 text-white/40" />
            </div>
            <input
              type={showPassword ? "text" : "password"}
              placeholder="Mật khẩu mới"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              className="w-full bg-black/20 border border-white/10 rounded-xl py-3 pl-11 pr-12 text-white placeholder:text-white/30 focus:outline-none focus:ring-2 focus:ring-[#F042FF]/50 focus:border-[#F042FF]/50 transition-all"
            />
            <button type="button" onClick={() => setShowPassword(!showPassword)} className="absolute inset-y-0 right-0 pr-4 flex items-center text-white/40 hover:text-white transition-colors focus:outline-none">
              {showPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
            </button>
          </div>

          {/* Nhập lại Mật khẩu */}
          <div className="relative">
            <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
              <Lock className="h-5 w-5 text-white/40" />
            </div>
            <input
              type={showConfirmPassword ? "text" : "password"}
              placeholder="Nhập lại mật khẩu"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              required
              className="w-full bg-black/20 border border-white/10 rounded-xl py-3 pl-11 pr-12 text-white placeholder:text-white/30 focus:outline-none focus:ring-2 focus:ring-[#F042FF]/50 focus:border-[#F042FF]/50 transition-all"
            />
            <button type="button" onClick={() => setShowConfirmPassword(!showConfirmPassword)} className="absolute inset-y-0 right-0 pr-4 flex items-center text-white/40 hover:text-white transition-colors focus:outline-none">
              {showConfirmPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
            </button>
          </div>

          <button
            type="submit"
            disabled={isLoading || !!success}
            className="w-full py-3.5 mt-2 text-white font-bold rounded-xl transition-all flex items-center justify-center disabled:opacity-70 shadow-[0_0_20px_rgba(240,66,255,0.3)] hover:shadow-[0_0_25px_rgba(240,66,255,0.5)] hover:opacity-90"
            style={{background: 'linear-gradient(135deg, #F042FF, #7226FF)'}}
          >
            {isLoading ? <Loader2 className="w-5 h-5 animate-spin" /> : 'Lưu mật khẩu mới'}
          </button>
        </form>

        <div className="mt-6 text-center">
          <Link href="/login" className="text-white/50 hover:text-white text-sm transition-colors flex items-center justify-center gap-1">
            <ArrowRight className="w-4 h-4 rotate-180" /> Quay lại đăng nhập
          </Link>
        </div>
      </motion.div>
    </main>
  );
}
