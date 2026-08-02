'use client';

import { useEffect, useState } from 'react';
import { useSession } from 'next-auth/react';
import Navbar from '@/components/layout/Navbar';
import Link from 'next/link';
import Image from 'next/image';
import { Heart, Play, Loader2, AlertCircle } from 'lucide-react';
import { useRouter } from 'next/navigation';

export default function FavoritesPage() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [favorites, setFavorites] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchFavorites = async () => {
      if (status === 'unauthenticated') {
        setIsLoading(false);
        return;
      }
      if (session?.user?.email) {
        try {
          const res = await fetch(`/api/favorites?email=${session.user.email}`);
          const data = await res.json();
          if (res.ok) setFavorites(data.favorites);
        } catch (error) {
          console.error("Lỗi tải phim yêu thích:", error);
        } finally {
          setIsLoading(false);
        }
      }
    };
    fetchFavorites();
  }, [session, status]);

  if (isLoading || status === 'loading') {
    return (
      <main className="min-h-screen bg-[#0a0a0c] flex items-center justify-center">
        <Loader2 className="w-12 h-12 animate-spin text-[#F042FF]" />
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-[#0a0a0c] text-white selection:bg-[#F042FF]/30 pb-24 relative overflow-hidden">
      <Navbar />

      <div className="fixed top-0 left-0 right-0 h-screen pointer-events-none z-0">
         <div className="absolute top-[-10%] left-[-10%] w-[55%] h-[55%] bg-[#7226FF]/15 blur-[140px] rounded-full mix-blend-screen" />
         <div className="absolute bottom-[-10%] right-[-10%] w-[55%] h-[55%] bg-[#F042FF]/10 blur-[140px] rounded-full mix-blend-screen" />
      </div>

      <div className="max-w-[1600px] mx-auto px-4 md:px-12 relative z-10 flex flex-col gap-8 pt-4 md:pt-[100px]">
        
        {/* Tiêu đề */}
        <div className="flex items-center justify-between border-b border-white/10 pb-5 mb-4">
          <div className="flex items-center gap-3">
            <Heart className="w-8 h-8 text-[#F042FF] fill-[#F042FF]" />
            <h1 className="font-black text-2xl md:text-4xl text-white tracking-wide uppercase drop-shadow-md">
              Phim Yêu Thích
            </h1>
          </div>
        </div>

        {status === 'unauthenticated' ? (
          <div className="text-center my-16 flex flex-col items-center gap-5 bg-white/5 p-10 rounded-3xl border border-white/10 max-w-lg mx-auto backdrop-blur-md shadow-2xl">
            <AlertCircle className="w-16 h-16 text-yellow-400 opacity-90" />
            <h2 className="text-2xl font-black text-white">Chưa Đăng Nhập</h2>
            <p className="text-white/60 text-base font-medium leading-relaxed">Vui lòng đăng nhập tài khoản để lưu trữ và thưởng thức bộ sưu tập phim yêu thích của bạn!</p>
            <Link 
              tabIndex={0} 
              href="/dang-nhap" 
              className="mt-2 px-8 py-3.5 bg-gradient-to-r from-[#7226FF] to-[#F042FF] text-white rounded-2xl font-black text-lg shadow-xl hover:scale-105 focus:scale-105 focus:outline-none focus:ring-4 focus:ring-[#F042FF]/60 transition-all cursor-pointer"
            >
              Đăng Nhập Ngay
            </Link>
          </div>
        ) : favorites.length > 0 ? (
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 xl:grid-cols-8 gap-6 md:gap-8">
            {favorites.map((movie, index) => (
              <div 
                key={index} 
                tabIndex={0}
                onClick={() => router.push(`/phim/${movie.slug}`)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter' || e.key === ' ' || e.keyCode === 13) {
                    e.preventDefault();
                    router.push(`/phim/${movie.slug}`);
                  }
                }}
                className="group flex flex-col cursor-pointer focus:outline-none transition-all duration-300"
              >
                <div className="relative w-full aspect-[2/3] rounded-3xl overflow-hidden mb-3 border-2 border-white/20 group-focus:border-4 group-focus:border-[#F042FF] group-focus:scale-105 transition-all duration-300 shadow-2xl bg-black/40">
                  <Image 
                    src={movie.imageSrc || '/placeholder-image.jpg'} 
                    alt={movie.name} 
                    fill 
                    sizes="400px" 
                    className="object-cover transition-transform duration-500 group-hover:scale-110 group-focus:scale-110" 
                    referrerPolicy="no-referrer"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/95 via-black/40 to-transparent opacity-0 group-hover:opacity-100 group-focus:opacity-100 transition-opacity duration-300 flex items-center justify-center backdrop-blur-[2px]">
                    <div className="w-16 h-16 rounded-full bg-[#7226FF] flex items-center justify-center shadow-2xl transform scale-75 group-hover:scale-100 group-focus:scale-100 transition-transform duration-300">
                      <Play className="w-8 h-8 text-white fill-white ml-1" />
                    </div>
                  </div>
                  <div className="absolute top-3 right-3 bg-black/70 backdrop-blur-md p-2.5 rounded-2xl border border-white/20 shadow-xl">
                     <Heart className="w-6 h-6 text-[#F042FF] fill-[#F042FF] drop-shadow-md" />
                  </div>
                </div>
                <h3 className="text-lg md:text-2xl font-black text-white/90 group-hover:text-white group-focus:text-white transition-colors line-clamp-1 leading-snug">
                  {movie.name}
                </h3>
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center text-white/50 my-24 flex flex-col items-center justify-center gap-4 bg-white/5 p-12 rounded-3xl border border-white/10 max-w-xl mx-auto backdrop-blur-md">
            <Heart className="w-20 h-20 text-[#F042FF]/30" />
            <p className="text-lg font-bold">Bộ sưu tập phim yêu thích đang trống.</p>
            <p className="text-white/50 text-base">Hãy bấm vào biểu tượng trái tim khi xem phim để lưu vào đây nhé!</p>
            <Link 
              tabIndex={0} 
              href="/" 
              className="mt-4 px-8 py-3.5 bg-white/10 hover:bg-white/20 text-white font-black text-base rounded-2xl border border-white/20 transition-all focus:outline-none focus:scale-105 focus:border-[#F042FF] focus:ring-4 focus:ring-[#F042FF]/40 cursor-pointer"
            >
              Khám Phá Ngay
            </Link>
          </div>
        )}
      </div>
    </main>
  );
}