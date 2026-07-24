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
  rowIndex?: number;
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

export default function TvMovieRow({ title, movies, isTrending, onMovieClick, viewMoreLink, rowIndex = 0 }: TvMovieRowProps) {
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
    <div className="w-full relative py-4 px-4 md:px-12">
      {/* Danh sách phim cuộn ngang mượt mà */}
      <div
        ref={rowRef}
        className="flex flex-row items-center gap-4 md:gap-6 overflow-x-auto scrollbar-hide px-2 pb-4 pt-2 scroll-smooth snap-x snap-mandatory transform-gpu contain-layout"
      >
        {/* ICON TRẠNG THÁI DANH MỤC ĐỨNG TRƯỚC CARD 1 (KHÔNG CHỌN/FOCUS ĐƯỢC - tabIndex={-1}) */}
        <div
          tabIndex={-1}
          aria-hidden="true"
          className={`shrink-0 snap-start aspect-[2/3] ${
            isTrending ? 'w-[360px] md:w-[400px]' : 'w-[280px] md:w-[320px]'
          } rounded-2xl bg-gradient-to-br from-[#7226FF]/20 via-[#F042FF]/10 to-white/5 border border-white/15 flex flex-col items-center justify-center gap-4 pointer-events-none select-none p-4`}
        >
          <div className="w-20 h-20 rounded-full bg-gradient-to-tr from-[#7226FF] to-[#F042FF] flex items-center justify-center shadow-[0_0_30px_rgba(240,66,255,0.5)]">
            <CategoryIcon className="w-10 h-10 text-white" />
          </div>
          <div className="text-center px-4">
            <span className="text-[#F042FF] font-extrabold text-xs md:text-sm tracking-widest uppercase block mb-1">
              Danh Mục
            </span>
            <span className="text-white font-bold text-xl md:text-2xl line-clamp-2 drop-shadow-md leading-snug">
              {title}
            </span>
          </div>
        </div>

        {/* DANH SÁCH CÁC THẺ PHIM */}
        {displayMovies.map((movie, index) => (
          <div
            key={movie.id}
            className="shrink-0 snap-start focus-within:z-40"
          >
            <TvMovieCard 
              movie={movie} 
              isTrending={isTrending} 
              onClick={() => onMovieClick(movie)}
              priority={index < 4}
              rowIndex={rowIndex}
              colIndex={index}
            />
          </div>
        ))}

        {/* NÚT XEM THÊM */}
        {viewMoreLink && (
          <div
            tabIndex={0}
            data-zone="row"
            data-row={rowIndex}
            data-col={displayMovies.length}
            onClick={handleViewMore}
            onFocus={(e) => {
              e.target.scrollIntoView({
                behavior: 'smooth',
                block: 'nearest',
                inline: 'center',
              });
            }}
            onKeyDown={(e) => {
              if (e.key === 'Enter' || e.key === ' ') {
                e.preventDefault();
                handleViewMore();
              }
            }}
            className={`relative shrink-0 snap-start aspect-[2/3] ${
              isTrending ? 'w-[360px] md:w-[400px]' : 'w-[280px] md:w-[320px]'
            } rounded-2xl bg-white/10 hover:bg-[#7226FF] focus:bg-[#7226FF] border-2 border-white/20 focus:border-4 focus:border-[#F042FF] focus:scale-105 flex flex-col items-center justify-center gap-4 cursor-pointer focus:outline-none group overflow-hidden transition-all duration-200 ease-out`}
          >
            <div className="w-16 h-16 rounded-full bg-white/15 flex items-center justify-center border border-white/30">
              <ChevronRight className="w-9 h-9 text-white" />
            </div>
            <span className="text-white font-bold text-lg md:text-xl tracking-wide">Xem Tất Cả</span>
          </div>
        )}
      </div>
    </div>
  );
}
