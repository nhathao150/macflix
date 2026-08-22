'use client';

import { useState } from 'react';
import { signIn } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { Mail, Lock, User, ArrowRight, Loader2, Play, Eye, EyeOff } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

export default function AuthPage() {
  const router = useRouter();
  
  // State để chuyển đổi giữa form Đăng Nhập và Đăng Ký
  const [isLogin, setIsLogin] = useState(true);
  
  // State lưu trữ dữ liệu người dùng nhập
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  
  // State xử lý UI
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  // Hàm xử lý khi bấm nút Đăng Nhập / Đăng Ký
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setSuccess('');
    setIsLoading(true);

    try {
      if (isLogin) {
        // LOGIC ĐĂNG NHẬP (Gọi NextAuth)
        const res = await signIn('credentials', {
          email,
          password,
          redirect: false,
        });

        if (res?.error) {
          setError('Email hoặc mật khẩu không chính xác!');
        } else {
          router.push('/');
          router.refresh(); // Tải lại trang để Navbar nhận diện đã đăng nhập
        }
      } else {
        // LOGIC ĐĂNG KÝ (Gọi API Register chúng ta đã viết)
        const res = await fetch('/api/auth/register', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ name, email, password }),
        });

        const data = await res.json();

        if (res.ok) {
          setSuccess('Đăng ký thành công! Chuyển hướng để xác thực email...');
          setTimeout(() => {
            router.push(`/xac-thuc-email?email=${encodeURIComponent(email)}`);
          }, 2000);
        } else {
          setError(data.message || 'Có lỗi xảy ra, vui lòng thử lại.');
        }
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

      {/* Box Form Kính mờ (Glassmorphism) */}
      <motion.div 
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        className="w-full max-w-md bg-white/10 backdrop-blur-2xl border border-white/20 rounded-3xl p-8 shadow-[0_8px_32px_rgba(0,0,0,0.5)] relative z-10 overflow-hidden"
      >
        {/* Nút Về trang chủ */}
        <Link href="/" className="absolute top-6 left-6 text-white/50 hover:text-white transition-colors flex items-center gap-1 text-sm font-medium">
          <ArrowRight className="w-4 h-4 rotate-180" /> Trang chủ
        </Link>

        <div className="text-center mt-6 mb-8">
          <div className="inline-flex items-center justify-center w-12 h-12 rounded-full mb-4 shadow-lg" style={{background: 'linear-gradient(135deg, #F042FF, #7226FF)'}}>
            <span className="text-white text-2xl leading-none"></span>
          </div>
          <h2 className="font-black text-white uppercase tracking-widest">
            {isLogin ? 'Đăng nhập Macflix' : 'Tạo tài khoản'}
          </h2>
          <p className="text-white/50 text-sm mt-2">
            {isLogin ? 'Tiếp tục thưởng thức các siêu phẩm điện ảnh' : 'Gia nhập hệ sinh thái Macflix ngay hôm nay'}
          </p>
        </div>

        {/* Thông báo Lỗi / Thành công */}
        <AnimatePresence>
          {error && (
            <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }} className="mb-4 p-3 rounded-xl bg-red-500/20 border border-red-500/50 text-red-200 text-sm text-center">
              {error}
            </motion.div>
          )}
          {success && (
            <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }} className="mb-4 p-3 rounded-xl bg-emerald-500/20 border border-emerald-500/50 text-emerald-200 text-sm text-center">
              {success}
            </motion.div>
          )}
        </AnimatePresence>

        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Trường Tên (Chỉ hiện khi Đăng Ký) */}
          {!isLogin && (
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                <User className="h-5 w-5 text-white/40" />
              </div>
              <input
                type="text"
                placeholder="Tên hiển thị của bạn"
                value={name}
                onChange={(e) => setName(e.target.value)}
                required={!isLogin}
                className="w-full bg-black/20 border border-white/10 rounded-xl py-3 pl-11 pr-4 text-white placeholder:text-white/30 focus:outline-none focus:ring-2 focus:ring-[#F042FF]/50 focus:border-[#F042FF]/50 transition-all"
              />
            </div>
          )}

          {/* Trường Email */}
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

          {/* Trường Mật khẩu */}
          <div className="relative">
            <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
              <Lock className="h-5 w-5 text-white/40" />
            </div>
            <input
              type={showPassword ? "text" : "password"}
              placeholder="Mật khẩu"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              className="w-full bg-black/20 border border-white/10 rounded-xl py-3 pl-11 pr-12 text-white placeholder:text-white/30 focus:outline-none focus:ring-2 focus:ring-[#F042FF]/50 focus:border-[#F042FF]/50 transition-all"
            />
            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              className="absolute inset-y-0 right-0 pr-4 flex items-center text-white/40 hover:text-white transition-colors focus:outline-none"
            >
              {showPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
            </button>
          </div>

          {/* Quên mật khẩu */}
          <AnimatePresence>
            {isLogin && (
              <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }} exit={{ opacity: 0, height: 0 }} className="flex justify-end mt-1">
                <Link href="/forgot-password" className="text-sm text-white/60 hover:text-[#F042FF] transition-colors">
                  Quên mật khẩu?
                </Link>
              </motion.div>
            )}
          </AnimatePresence>

          {/* Nút Submit */}
          <button
            type="submit"
            disabled={isLoading}
            className="w-full py-3.5 mt-2 text-white font-bold rounded-xl transition-all flex items-center justify-center disabled:opacity-70 shadow-[0_0_20px_rgba(240,66,255,0.3)] hover:shadow-[0_0_25px_rgba(240,66,255,0.5)] hover:opacity-90"
            style={{background: 'linear-gradient(135deg, #F042FF, #7226FF)'}}
          >
            {isLoading ? (
              <Loader2 className="w-5 h-5 animate-spin" />
            ) : (
              isLogin ? 'Đăng Nhập' : 'Tạo Tài Khoản'
            )}
          </button>
        </form>

        <div className="mt-6 flex items-center justify-between">
          <span className="w-1/5 border-b border-white/10 lg:w-1/4"></span>
          <span className="text-xs text-center text-white/50 uppercase">hoặc đăng nhập bằng</span>
          <span className="w-1/5 border-b border-white/10 lg:w-1/4"></span>
        </div>

        <button
          onClick={() => signIn('google', { callbackUrl: '/' })}
          className="w-full mt-6 py-3.5 bg-white/5 hover:bg-white/10 border border-white/10 text-white font-bold rounded-xl transition-all flex items-center justify-center gap-3"
        >
          <svg className="w-5 h-5" viewBox="0 0 24 24">
            <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
            <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
            <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" />
            <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" />
          </svg>
          Google
        </button>

        {/* Chuyển đổi giữa Đăng nhập và Đăng ký */}
        <div className="mt-8 text-center">
          <p className="text-white/50 text-sm">
            {isLogin ? 'Chưa có tài khoản?' : 'Đã có tài khoản?'}
            <button
              onClick={() => {
                setIsLogin(!isLogin);
                setError('');
                setSuccess('');
              }}
              className="ml-2 font-bold transition-colors" style={{color:'#F042FF'}}
            >
              {isLogin ? 'Đăng ký ngay' : 'Đăng nhập'}
            </button>
          </p>
        </div>
      </motion.div>
    </main>
  );
}