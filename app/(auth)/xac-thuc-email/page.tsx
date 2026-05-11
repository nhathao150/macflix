'use client';

import { useState, useRef, useEffect, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { Loader2, ArrowRight } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import Link from 'next/link';

function OTPForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const email = searchParams.get('email') || '';

  const [otp, setOtp] = useState(['', '', '', '', '', '']);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const inputRefs = useRef<(HTMLInputElement | null)[]>([]);

  // Focus ô đầu tiên khi mount
  useEffect(() => {
    if (inputRefs.current[0]) {
      inputRefs.current[0].focus();
    }
  }, []);

  const handleChange = (index: number, value: string) => {
    // Chỉ lấy số
    const numValue = value.replace(/[^0-9]/g, '');
    if (!numValue && value !== '') return;

    const newOtp = [...otp];
    newOtp[index] = numValue.substring(numValue.length - 1); // Chỉ lấy ký tự cuối
    setOtp(newOtp);

    // Tự động focus sang ô tiếp theo
    if (numValue && index < 5) {
      inputRefs.current[index + 1]?.focus();
    }
  };

  const handleKeyDown = (index: number, e: React.KeyboardEvent<HTMLInputElement>) => {
    // Nếu bấm Backspace và ô hiện tại đang trống, focus lùi lại
    if (e.key === 'Backspace' && !otp[index] && index > 0) {
      inputRefs.current[index - 1]?.focus();
    }
  };

  const handlePaste = (e: React.ClipboardEvent<HTMLInputElement>) => {
    e.preventDefault();
    const pastedData = e.clipboardData.getData('text').replace(/[^0-9]/g, '').slice(0, 6);
    if (!pastedData) return;

    const newOtp = [...otp];
    for (let i = 0; i < pastedData.length; i++) {
      newOtp[i] = pastedData[i];
    }
    setOtp(newOtp);

    // Focus vào ô cuối cùng được điền
    const nextIndex = Math.min(pastedData.length, 5);
    inputRefs.current[nextIndex]?.focus();
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const otpString = otp.join('');
    
    if (otpString.length < 6) {
      setError('Vui lòng nhập đủ 6 số.');
      return;
    }

    setError('');
    setIsLoading(true);

    try {
      const res = await fetch('/api/auth/verify-email', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, otp: otpString }),
      });

      const data = await res.json();

      if (res.ok) {
        setSuccess('Xác thực thành công! Đang chuyển hướng...');
        setTimeout(() => {
          router.push('/dang-nhap');
        }, 2000);
      } else {
        setError(data.message || 'Mã xác thực không đúng.');
        // Xóa mã nhập sai
        setOtp(['', '', '', '', '', '']);
        inputRefs.current[0]?.focus();
      }
    } catch (err) {
      setError('Lỗi kết nối máy chủ.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <motion.div 
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      className="w-full max-w-md bg-white/10 backdrop-blur-2xl border border-white/20 rounded-3xl p-8 shadow-[0_8px_32px_rgba(0,0,0,0.5)] relative z-10 overflow-hidden"
    >
      <div className="text-center mt-2 mb-8">
        <div className="inline-flex items-center justify-center w-12 h-12 rounded-full mb-4 shadow-lg" style={{background: 'linear-gradient(135deg, #F042FF, #7226FF)'}}>
          <span className="text-white text-2xl leading-none">✉️</span>
        </div>
        <h2 className="font-black text-white uppercase tracking-widest text-xl">
          Nhập mã xác thực
        </h2>
        <p className="text-white/60 text-sm mt-3">
          Chúng tôi đã gửi một mã gồm 6 chữ số đến email <br/>
          <strong className="text-[#F042FF]">{email || 'của bạn'}</strong>
        </p>
      </div>

      <AnimatePresence>
        {error && (
          <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }} className="mb-6 p-3 rounded-xl bg-red-500/20 border border-red-500/50 text-red-200 text-sm text-center">
            {error}
          </motion.div>
        )}
        {success && (
          <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }} className="mb-6 p-4 rounded-xl bg-emerald-500/20 border border-emerald-500/50 text-emerald-200 text-sm text-center">
            {success}
          </motion.div>
        )}
      </AnimatePresence>

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* 6 Ô Nhập OTP */}
        <div className="flex justify-between gap-2">
          {otp.map((digit, index) => (
            <input
              key={index}
              ref={(el) => {
                inputRefs.current[index] = el;
              }}
              type="text"
              inputMode="numeric"
              maxLength={1}
              value={digit}
              onChange={(e) => handleChange(index, e.target.value)}
              onKeyDown={(e) => handleKeyDown(index, e)}
              onPaste={handlePaste}
              disabled={isLoading || !!success}
              className="w-12 h-14 sm:w-14 sm:h-16 text-center text-2xl font-bold text-white bg-black/30 border border-white/20 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#F042FF]/60 focus:border-[#F042FF]/60 transition-all shadow-inner"
            />
          ))}
        </div>

        <button
          type="submit"
          disabled={isLoading || !!success || otp.join('').length < 6}
          className="w-full py-4 mt-4 text-white font-bold rounded-xl transition-all flex items-center justify-center disabled:opacity-50 disabled:cursor-not-allowed shadow-[0_0_20px_rgba(240,66,255,0.3)] hover:shadow-[0_0_25px_rgba(240,66,255,0.5)] hover:opacity-90"
          style={{background: 'linear-gradient(135deg, #F042FF, #7226FF)'}}
        >
          {isLoading ? <Loader2 className="w-5 h-5 animate-spin" /> : 'Xác nhận Email'}
        </button>
      </form>

      <div className="mt-6 text-center">
        <Link href="/dang-nhap" className="text-white/50 hover:text-white text-sm transition-colors flex items-center justify-center gap-1">
          <ArrowRight className="w-4 h-4 rotate-180" /> Về trang đăng nhập
        </Link>
      </div>
    </motion.div>
  );
}

export default function VerifyEmailPage() {
  return (
    <main className="min-h-screen flex items-center justify-center p-4 relative overflow-hidden">
      <div className="absolute inset-0 bg-[#010030]/60 backdrop-blur-sm z-0" />
      <Suspense fallback={<div className="text-white relative z-10"><Loader2 className="w-8 h-8 animate-spin" /></div>}>
        <OTPForm />
      </Suspense>
    </main>
  );
}
