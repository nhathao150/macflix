'use client';

import Image from 'next/image';
import { useState } from 'react';
import { Movie } from '@/types';

interface TvMovieCardProps {
  movie: Movie;
  isTrending?: boolean;
  onClick?: () => void;
  priority?: boolean;
  rowIndex?: number;
  colIndex?: number;
}

export default function TvMovieCard({ movie, isTrending, onClick, priority, rowIndex, colIndex }: TvMovieCardProps) {
  const [isLoaded, setIsLoaded] = useState(false);
  const poster = movie.posterSrc || movie.imageSrc;

  return (
    <div
      tabIndex={0}
      data-zone="row"
      data-row={rowIndex}
      data-col={colIndex}
      onClick={onClick}
      onFocus={(e) => {
        e.target.scrollIntoView({
          behavior: 'smooth',
          block: 'nearest',
          inline: 'center',
        });
      }}
      onKeyDown={(e) => {
        if (e.key === 'Enter' || e.key === ' ' || e.keyCode === 13) {
          e.preventDefault();
          e.stopPropagation();
          onClick?.();
        }
      }}
      className={`relative group cursor-pointer aspect-[2/3] rounded-2xl overflow-hidden bg-[#14141a] border-2 border-white/20 focus:border-4 focus:border-[#F042FF] focus:scale-105 focus:outline-none transition-transform duration-150 ease-out shadow-lg transform-gpu will-change-transform contain-paint ${
        isTrending ? 'w-[360px] md:w-[400px]' : 'w-[280px] md:w-[320px]'
      }`}
    >
      {/* Skeleton đơn giản khi ảnh đang tải */}
      {!isLoaded && <div className="absolute inset-0 bg-[#1f1f28] animate-pulse" />}

      <Image
        src={poster}
        alt={movie.title}
        fill
        priority={priority}
        sizes="(max-width: 768px) 280px, 360px"
        className={`object-cover transition-transform duration-300 transform-gpu group-hover:scale-105 group-focus:scale-105 ${isLoaded ? 'opacity-100' : 'opacity-0'}`}
        referrerPolicy="no-referrer"
        onLoad={() => setIsLoaded(true)}
      />

      {/* Lớp phủ gradient màu đen mờ đơn giản phía dưới */}
      <div className="absolute inset-0 bg-gradient-to-t from-black/95 via-black/30 to-transparent opacity-90 group-hover:opacity-100 transition-opacity" />

      {/* Thông tin phim */}
      <div className="absolute bottom-0 left-0 w-full p-4 md:p-5 flex items-end z-20">
        <h3 className="text-white font-bold text-base md:text-lg leading-snug line-clamp-2 drop-shadow-md tracking-wide">
          {movie.title}
        </h3>
      </div>
    </div>
  );
}
