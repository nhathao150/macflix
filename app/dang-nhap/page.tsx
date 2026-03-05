'use client';

import { useState } from 'react';
import { signIn } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { Mail, Lock, User, ArrowRight, Loader2, Play } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

export default function AuthPage() {
  const router = useRouter();
  
  // State để chuyển đổi giữa form Đăng Nhập và Đăng Ký
  const [isLogin, setIsLogin] = useState(true);
  
  // State lưu trữ dữ liệu người dùng nhập
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  
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
          setSuccess('Đăng ký thành công! Đang chuyển sang đăng nhập...');
          setTimeout(() => {
            setIsLogin(true); // Tự động chuyển về form đăng nhập
            setSuccess('');
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
              type="password"
              placeholder="Mật khẩu"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              className="w-full bg-black/20 border border-white/10 rounded-xl py-3 pl-11 pr-4 text-white placeholder:text-white/30 focus:outline-none focus:ring-2 focus:ring-[#F042FF]/50 focus:border-[#F042FF]/50 transition-all"
            />
          </div>

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