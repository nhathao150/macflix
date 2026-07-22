'use client';

import { useRef } from 'react';
import { useRouter } from 'next/navigation';
import { ChevronRight, Flame, Tv, Film, Sparkles, Gamepad2, Ticket, Subtitles, Star } from 'lucide-react';
import TvMovieCard from './TvMovieCard';
import { Movie } from '@/types';

interface TvMovieRowProps {
  title: string;
  movies: Movie[];
  isTrending?: boolean;
  onMovieClick: (movie: Movie) => void;
  viewMoreLink?: string;
}

// Chọn Icon biểu tượng phù hợp cho từng danh mục
const getCategoryIcon = (title: string) => {
  if (title.includes('Mới Cập Nhật') || title.includes('Thịnh Hành')) return Flame;
  if (title.includes('Phim Bộ')) return Tv;
  if (title.includes('Phim Lẻ')) return Film;
  if (title.includes('Shows') || title.includes('TV Shows')) return Sparkles;
  if (title.includes('Hoạt Hình')) return Gamepad2;
  if (title.includes('Chiếu Rạp')) return Ticket;
  if (title.includes('Vietsub') || title.includes('Thuyết Minh') || title.includes('Lồng Tiếng')) return Subtitles;
  return Star;
};

export default function TvMovieRow({ title, movies, isTrending, onMovieClick, viewMoreLink }: TvMovieRowProps) {
  const rowRef = useRef<HTMLDivElement>(null);
  const router = useRouter();

  if (!movies || movies.length === 0) return null;

  // Hiển thị tối đa 20 bộ phim cho mỗi hàng
  const displayMovies = movies.slice(0, 20);
  const CategoryIcon = getCategoryIcon(title);

  const handleViewMore = () => {
    if (viewMoreLink) {
      router.push(viewMoreLink);
    }
  };

  return (
    <div className="w-full relative py-[15px] px-[80px]">
      {/* Danh sách phim cuộn ngang mượt mà */}
      <div
        ref={rowRef}
        className="flex gap-8 overflow-x-auto scrollbar-hide px-6 pb-6 pt-6 scroll-smooth snap-x snap-mandatory"
      >
        {/* ICON TRẠNG THÁI DANH MỤC ĐỨNG TRƯỚC CARD 1 (KHÔNG CHỌN/FOCUS ĐƯỢC - tabIndex={-1}) */}
        <div
          tabIndex={-1}
          aria-hidden="true"
          className={`shrink-0 snap-start aspect-[2/3] ${isTrending ? 'w-[560px]' : 'w-[500px]'
            } rounded-3xl bg-gradient-to-br from-[#7226FF]/20 via-[#F042FF]/10 to-white/5 border border-white/15 flex flex-col items-center justify-center gap-6 pointer-events-none select-none`}
        >
          <div className="w-28 h-28 rounded-full bg-gradient-to-tr from-[#7226FF] to-[#F042FF] flex items-center justify-center shadow-[0_0_40px_rgba(240,66,255,0.6)]">
            <CategoryIcon className="w-16 h-16 text-white" />
          </div>
          <div className="text-center px-8">
            <span className="text-[#F042FF] font-black text-xl tracking-widest uppercase block mb-2">
              Danh Mục
            </span>
            <span className="text-white font-black text-3xl md:text-4xl line-clamp-2 drop-shadow-md leading-tight">
              {title}
            </span>
          </div>
        </div>

        {/* DANH SÁCH CÁC THẺ PHIM */}
        {displayMovies.map((movie) => (
          <div
            key={movie.id}
            className="shrink-0 snap-start focus-within:z-40"
          >
            <TvMovieCard 
              movie={movie} 
              isTrending={isTrending} 
              onClick={() => onMovieClick(movie)}
            />
          </div>
        ))}

        {/* NÚT XEM THÊM KHỔ CỰC ĐẠI */}
        {viewMoreLink && (
          <div
            tabIndex={0}
            onClick={handleViewMore}
            onKeyDown={(e) => {
              if (e.key === 'Enter' || e.key === ' ') {
                e.preventDefault();
                handleViewMore();
              }
            }}
            className={`relative shrink-0 snap-start aspect-[2/3] ${isTrending ? 'w-[560px]' : 'w-[500px]'
              } rounded-3xl bg-white/10 hover:bg-[#7226FF] focus:bg-[#7226FF] border-2 border-white/20 focus:border-4 focus:border-[#F042FF] flex flex-col items-center justify-center gap-6 cursor-pointer focus:outline-none group overflow-hidden transition-all duration-150`}
          >
            <div className="w-24 h-24 rounded-full bg-white/15 flex items-center justify-center border border-white/30">
              <ChevronRight className="w-14 h-14 text-white" />
            </div>
            <span className="text-white font-black text-2xl tracking-wide">Xem Tất Cả</span>
          </div>
        )}
      </div>
    </div>
  );
}
