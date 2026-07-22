'use client';

import Image from 'next/image';
import { useState } from 'react';
import { Movie } from '@/types';

interface TvMovieCardProps {
  movie: Movie;
  isTrending?: boolean;
  onClick?: () => void;
}

export default function TvMovieCard({ movie, isTrending, onClick }: TvMovieCardProps) {
  const [isLoaded, setIsLoaded] = useState(false);
  const poster = movie.posterSrc || movie.imageSrc;

  return (
    <div
      tabIndex={0}
      onClick={onClick}
      onKeyDown={(e) => {
        if (e.key === 'Enter' || e.key === ' ' || e.keyCode === 13) {
          e.preventDefault();
          e.stopPropagation();
          onClick?.();
        }
      }}
      className={`relative group cursor-pointer aspect-[2/3] rounded-3xl overflow-hidden bg-[#14141a] border-2 border-white/20 focus:border-4 focus:border-[#F042FF] focus:outline-none transition-all duration-150 ${
        isTrending ? 'w-[560px]' : 'w-[500px]'
      }`}
    >
      {/* Skeleton đơn giản khi ảnh đang tải */}
      {!isLoaded && <div className="absolute inset-0 bg-[#1f1f28] animate-pulse" />}

      <Image
        src={poster}
        alt={movie.title}
        fill
        sizes="600px"
        className={`object-cover transition-opacity duration-300 ${isLoaded ? 'opacity-100' : 'opacity-0'}`}
        referrerPolicy="no-referrer"
        onLoad={() => setIsLoaded(true)}
        loading="lazy"
      />

      {/* Lớp phủ gradient màu đen mờ đơn giản phía dưới */}
      <div className="absolute inset-0 bg-gradient-to-t from-black/95 via-black/40 to-transparent" />

      {/* Thông tin phim */}
      <div className="absolute bottom-0 left-0 w-full p-8 flex items-end z-20">
        <h3 className="text-white font-black text-2xl md:text-3xl leading-tight line-clamp-2 drop-shadow-2xl tracking-wide">
          {movie.title}
        </h3>
      </div>
    </div>
  );
}
