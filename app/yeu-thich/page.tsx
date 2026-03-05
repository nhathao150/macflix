'use client';

import { useEffect, useState } from 'react';
import { useSession } from 'next-auth/react';
import Navbar from '@/components/Navbar';
import Link from 'next/link';
import Image from 'next/image';
import { Heart, Play, Loader2, AlertCircle } from 'lucide-react';

export default function FavoritesPage() {
  const { data: session, status } = useSession();
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
      <main className="min-h-screen bg-[#010030] flex items-center justify-center">
        <Loader2 className="w-10 h-10 animate-spin" style={{color:'#F042FF'}} />
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-[#010030] text-white selection:bg-[#F042FF]/30 pb-20">
      <Navbar />

      <div className="max-w-[1400px] mx-auto px-4 md:px-8 pt-[120px]">
        <div className="mb-8 flex items-end justify-between border-b border-white/10 pb-4">
          <div className="flex items-center gap-3">
            <Heart className="w-8 h-8 md:w-10 md:h-10" style={{color:'#F042FF', fill:'#F042FF', filter:'drop-shadow(0 0 15px rgba(240,66,255,0.5))'}} />
            <h1 className="font-black tracking-widest text-white uppercase drop-shadow-md">
              Phim Yêu Thích
            </h1>
          </div>
        </div>

        {status === 'unauthenticated' ? (
          <div className="text-center mt-32 flex flex-col items-center gap-4 bg-white/5 p-8 rounded-3xl border border-white/10 max-w-md mx-auto backdrop-blur-sm shadow-xl">
            <AlertCircle className="w-16 h-16 text-yellow-500 opacity-80" />
            <h2 className="text-lg font-bold">Chưa đăng nhập</h2>
            <p className="text-white/50 text-sm">Vui lòng đăng nhập để xem danh sách 15 bộ phim yêu thích của riêng bạn!</p>
            <Link href="/dang-nhap" className="mt-4 px-8 py-3 text-white rounded-full font-bold transition-all hover:opacity-90 hover:scale-105 shadow-[0_0_20px_rgba(240,66,255,0.3)]" style={{background:'linear-gradient(135deg,#F042FF,#7226FF)'}}>
              Đăng nhập ngay
            </Link>
          </div>
        ) : favorites.length > 0 ? (
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4 md:gap-6">
            {favorites.map((movie, index) => (
              <Link href={`/phim/${movie.slug}`} key={index} className="group flex flex-col cursor-pointer">
                <div className="relative w-full aspect-video rounded-xl overflow-hidden mb-3 border border-white/10 shadow-lg bg-[#160078/20]">
                  <Image src={movie.imageSrc || '/placeholder-image.jpg'} alt={movie.name} fill sizes="(max-width: 768px) 50vw, 33vw" className="object-cover opacity-80 transition-transform duration-500 group-hover:scale-110" />
                  <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-center justify-center backdrop-blur-[2px]">
                    <div className="w-12 h-12 rounded-full bg-white/20 backdrop-blur-md border border-white/40 flex items-center justify-center transform scale-75 group-hover:scale-100 transition-transform duration-300 shadow-2xl">
                      <Play className="w-5 h-5 text-white fill-white ml-1" />
                    </div>
                  </div>
                  <div className="absolute top-2 right-2">
                     <Heart className="w-5 h-5 drop-shadow-lg" style={{color:'#F042FF', fill:'#F042FF'}} />
                  </div>
                </div>
                <h3 className="text-xs font-semibold text-white/90 group-hover:text-white transition-colors line-clamp-2 leading-snug">
                  {movie.name}
                </h3>
              </Link>
            ))}
          </div>
        ) : (
          <div className="text-center text-white/50 mt-32 flex flex-col items-center justify-center gap-4">
            <Heart className="w-16 h-16 opacity-20" />
            <p>Bộ sưu tập trống. Hãy bấm biểu tượng trái tim ở các bộ phim bạn thích nhé!</p>
            <Link href="/" className="mt-4 px-6 py-2 bg-white/10 hover:bg-white/20 hover:text-white rounded-full font-bold transition-colors">Khám phá ngay</Link>
          </div>
        )}
      </div>
    </main>
  );
}