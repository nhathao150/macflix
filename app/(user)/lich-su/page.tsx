'use client';

import { useEffect, useState } from 'react';
import { useSession } from 'next-auth/react';
import Navbar from '@/components/layout/Navbar';
import Link from 'next/link';
import Image from 'next/image';
import { History, Play, Loader2, AlertCircle } from 'lucide-react';
import { getMovieDetails } from '@/lib/api';
import { useTv } from '@/context/TvContext';
import { useRouter } from 'next/navigation';

export default function HistoryPage() {
  const { data: session, status } = useSession();
  const { isTvMode } = useTv();
  const router = useRouter();
  const [history, setHistory] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  // Gọi API lấy dữ liệu từ MongoDB khi trang được load
  useEffect(() => {
    const fetchHistory = async () => {
      if (status === 'unauthenticated') {
        setIsLoading(false);
        return;
      }

      if (session?.user?.email) {
        try {
          const res = await fetch(`/api/history?email=${session.user.email}`);
          const data = await res.json();
          if (res.ok) {
            const historyData = data.history;
            const updatedHistory = await Promise.all(historyData.map(async (item: any) => {
              let imgSrc = item.imageSrc || '/placeholder-image.jpg';
              if (imgSrc === '/placeholder-image.jpg') {
                try {
                  const detail = await getMovieDetails(item.slug);
                  if (detail && detail.movie) {
                    const imgUrl = detail.movie.thumb_url || detail.movie.poster_url;
                    imgSrc = imgUrl.startsWith('http') ? imgUrl : `https://phimimg.com/${imgUrl}`;
                  }
                } catch (e) {}
              }
              return { ...item, imageSrc: imgSrc };
            }));
            setHistory(updatedHistory);
          }
        } catch (error) {
          console.error("Lỗi tải lịch sử:", error);
        } finally {
          setIsLoading(false);
        }
      }
    };

    fetchHistory();
  }, [session, status]);

  if (isLoading || status === 'loading') {
    return (
      <main className="min-h-screen bg-[#0a0a0c] flex items-center justify-center">
        <Loader2 className="w-12 h-12 animate-spin text-cyan-400" />
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-[#0a0a0c] text-white selection:bg-[#F042FF]/30 pb-24 relative overflow-hidden">
      {!isTvMode && <Navbar />}

      <div className="fixed top-0 left-0 right-0 h-screen pointer-events-none z-0">
         <div className="absolute top-[-10%] left-[-10%] w-[55%] h-[55%] bg-cyan-500/10 blur-[140px] rounded-full mix-blend-screen" />
         <div className="absolute bottom-[-10%] right-[-10%] w-[55%] h-[55%] bg-[#7226FF]/15 blur-[140px] rounded-full mix-blend-screen" />
      </div>

      <div className={`w-full px-6 md:px-16 lg:px-24 relative z-10 flex flex-col gap-8 ${isTvMode ? 'pt-8 md:pt-12' : 'pt-4 md:pt-[100px]'}`}>
        
        {/* TIÊU ĐỀ LỊCH SỬ XEM PHIM CĂN GIỮA MÀN HÌNH */}
        <div className="flex items-center justify-center text-center border-b border-white/10 pb-6 mb-4 w-full">
          <div className="flex items-center justify-center gap-4">
            <div className="w-14 h-14 rounded-2xl bg-cyan-500/20 border-2 border-cyan-400/40 flex items-center justify-center shadow-xl">
              <History className="w-8 h-8 text-cyan-400 drop-shadow-[0_0_14px_rgba(34,211,238,0.9)]" />
            </div>
            <h1 className="font-black tracking-wider text-white uppercase drop-shadow-2xl text-3xl md:text-5xl text-center">
              Lịch Sử Xem Phim
            </h1>
          </div>
        </div>

        {status === 'unauthenticated' ? (
          <div className="text-center my-16 flex flex-col items-center gap-5 bg-white/5 p-10 rounded-3xl border border-white/10 max-w-lg mx-auto backdrop-blur-md shadow-2xl">
            <AlertCircle className="w-16 h-16 text-yellow-400 opacity-90" />
            <h2 className="text-2xl font-black text-white">Chưa Đăng Nhập</h2>
            <p className="text-white/60 text-base font-medium leading-relaxed">Vui lòng đăng nhập tài khoản để đồng bộ và xem lại lịch sử các bộ phim bạn đang xem dở!</p>
            <Link 
              tabIndex={0} 
              href="/dang-nhap" 
              className="mt-2 px-8 py-3.5 bg-gradient-to-r from-[#7226FF] to-[#F042FF] text-white rounded-2xl font-black text-lg shadow-xl hover:scale-105 focus:scale-105 focus:outline-none focus:ring-4 focus:ring-[#F042FF]/60 transition-all cursor-pointer"
            >
              Đăng Nhập Ngay
            </Link>
          </div>
        ) : history.length > 0 ? (
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 xl:grid-cols-8 gap-6 md:gap-8">
            {history.map((movie, index) => (
              <div 
                key={`${movie.slug}-${index}`}
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
                <div className="relative w-full aspect-[2/3] rounded-3xl overflow-hidden mb-3 border-2 border-white/20 group-focus:border-4 group-focus:border-cyan-400 group-focus:scale-105 transition-all duration-300 shadow-2xl bg-black/40">
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
                  {movie.episodeName && (
                    <div className="absolute bottom-3 left-3 right-3 bg-black/90 backdrop-blur-md px-3.5 py-2 rounded-2xl border border-white/20 text-center">
                      <span className="text-sm font-black text-cyan-400 uppercase tracking-wide truncate block">{movie.episodeName}</span>
                    </div>
                  )}
                </div>
                <h3 className="text-lg md:text-2xl font-black text-white/90 group-hover:text-white group-focus:text-white transition-colors line-clamp-1 leading-snug">
                  {movie.name}
                </h3>
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center text-white/50 my-24 flex flex-col items-center justify-center gap-4 bg-white/5 p-12 rounded-3xl border border-white/10 max-w-xl mx-auto backdrop-blur-md">
            <History className="w-20 h-20 text-cyan-400/30" />
            <p className="text-lg font-bold">Lịch sử xem phim trống.</p>
            <p className="text-white/50 text-base">Những bộ phim bạn thưởng thức sẽ tự động hiển thị tại đây!</p>
            <Link 
              tabIndex={0} 
              href="/" 
              className="mt-4 px-8 py-3.5 bg-white/10 hover:bg-white/20 text-white font-black text-base rounded-2xl border border-white/20 transition-all focus:outline-none focus:scale-105 focus:border-[#F042FF] focus:ring-4 focus:ring-[#F042FF]/40 cursor-pointer"
            >
              Xem Phim Ngay
            </Link>
          </div>
        )}
      </div>
    </main>
  );
}