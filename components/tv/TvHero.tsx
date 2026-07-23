'use client';

import { useState } from 'react';
import Image from 'next/image';
import { Play, Info } from 'lucide-react';
import { Movie } from '@/types';

interface TvHeroProps {
  movies: Movie[];
  onPlayClick: (movie: Movie) => void;
}

export default function TvHero({ movies, onPlayClick }: TvHeroProps) {
  const [currentIndex] = useState(0);
  const currentMovie = movies && movies.length > 0 ? movies[currentIndex] : null;

  if (!currentMovie) return null;

  return (
    <div className="relative w-full h-[60vh] md:h-[80vh] min-h-[440px] bg-[#0a0a0c] overflow-hidden">
      {/* ẢNH BANNER TRÀN 100% MÀN HÌNH */}
      <Image
        src={currentMovie.imageSrc}
        alt={currentMovie.title}
        fill
        className="object-cover opacity-60"
        priority
        referrerPolicy="no-referrer"
      />

      {/* GRADIENT OVERLAY ĐEN ĐƠN GIẢN */}
      <div className="absolute inset-0 bg-gradient-to-t from-[#0a0a0c] via-[#0a0a0c]/40 to-transparent" />
      <div className="absolute inset-0 bg-gradient-to-r from-[#0a0a0c] via-[#0a0a0c]/70 to-transparent w-[60%]" />

      {/* NỘI DUNG CHÍNH BANNER (Scaled theo chuẩn Desktop) */}
      <div className="absolute bottom-8 left-8 md:left-14 right-8 md:right-14 flex flex-col items-start gap-3 md:gap-4 z-10 max-w-4xl">
        <span className="bg-[#7226FF] text-white text-xs md:text-sm font-extrabold px-3 py-1.5 rounded-lg uppercase tracking-wider shadow-md">
          Phim Thịnh Hành
        </span>

        <h1 className="text-2xl md:text-4xl lg:text-5xl font-black text-white uppercase tracking-tight line-clamp-2 drop-shadow-lg leading-tight">
          {currentMovie.title}
        </h1>

        {/* NÚT BẤM D-PAD REMOTE */}
        <div className="flex items-center gap-4 mt-2">
          <button
            tabIndex={0}
            onClick={() => onPlayClick(currentMovie)}
            onKeyDown={(e) => {
              if (e.key === 'Enter' || e.key === ' ' || e.keyCode === 13) {
                e.preventDefault();
                e.stopPropagation();
                onPlayClick(currentMovie);
              }
            }}
            className="flex items-center gap-2.5 bg-white text-black px-7 py-3 md:px-8 md:py-3.5 rounded-2xl font-extrabold text-sm md:text-base border-2 border-transparent transition-transform duration-150 transform-gpu focus:outline-none focus:scale-105 focus:border-[#F042FF] focus:ring-4 focus:ring-[#F042FF]/40 cursor-pointer shadow-xl"
          >
            <Play className="w-5 h-5 fill-current" />
            <span>Phát Ngay</span>
          </button>

          <button
            tabIndex={0}
            onClick={() => onPlayClick(currentMovie)}
            onKeyDown={(e) => {
              if (e.key === 'Enter' || e.key === ' ' || e.keyCode === 13) {
                e.preventDefault();
                e.stopPropagation();
                onPlayClick(currentMovie);
              }
            }}
            className="flex items-center gap-2.5 bg-white/20 text-white px-7 py-3 md:px-8 md:py-3.5 rounded-2xl font-extrabold text-sm md:text-base border border-white/30 transition-transform duration-150 transform-gpu focus:outline-none focus:scale-105 focus:border-[#F042FF] focus:ring-4 focus:ring-[#F042FF]/40 cursor-pointer shadow-xl backdrop-blur-md"
          >
            <Info className="w-5 h-5" />
            <span>Chi Tiết</span>
          </button>
        </div>
      </div>
    </div>
  );
}
