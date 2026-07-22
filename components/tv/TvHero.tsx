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
    <div className="relative w-full h-[50vh] min-h-[380px] bg-[#0a0a0c] overflow-hidden">
      {/* ẢNH BANNER */}
      <Image
        src={currentMovie.imageSrc}
        alt={currentMovie.title}
        fill
        className="object-cover opacity-60"
        priority
        referrerPolicy="no-referrer"
      />

      {/* GRADIENT OVERLAY ĐEN ĐƠN GIẢN */}
      <div className="absolute inset-0 bg-gradient-to-t from-[#0a0a0c] via-[#0a0a0c]/50 to-transparent" />
      <div className="absolute inset-0 bg-gradient-to-r from-[#0a0a0c] via-[#0a0a0c]/80 to-transparent w-[60%]" />

      {/* NỘI DUNG CHÍNH BANNER */}
      <div className="absolute bottom-6 left-6 right-6 flex flex-col items-start gap-3 z-10 max-w-3xl">
        <span className="bg-[#7226FF] text-white text-xs font-black px-3 py-1 rounded-md uppercase tracking-wider">
          Phim Thịnh Hành
        </span>

        <h1 className="text-3xl md:text-5xl font-black text-white uppercase tracking-tight line-clamp-1 drop-shadow-md">
          {currentMovie.title}
        </h1>

        {/* NÚT BẤM D-PAD REMOTE */}
        <div className="flex items-center gap-4 mt-2">
          <button
            tabIndex={0}
            onClick={() => onPlayClick(currentMovie)}
            className="flex items-center gap-2 bg-white text-black px-7 py-3 rounded-xl font-black text-base border-2 border-transparent transition-transform duration-150 focus:outline-none focus:scale-105 focus:border-[#F042FF] focus:ring-4 focus:ring-[#F042FF]/40 cursor-pointer"
          >
            <Play className="w-5 h-5 fill-current" />
            <span>Phát Ngay</span>
          </button>

          <button
            tabIndex={0}
            onClick={() => onPlayClick(currentMovie)}
            className="flex items-center gap-2 bg-white/20 text-white px-6 py-3 rounded-xl font-bold text-base border border-white/20 transition-transform duration-150 focus:outline-none focus:scale-105 focus:border-[#F042FF] focus:ring-4 focus:ring-[#F042FF]/40 cursor-pointer"
          >
            <Info className="w-5 h-5" />
            <span>Chi Tiết</span>
          </button>
        </div>
      </div>
    </div>
  );
}
