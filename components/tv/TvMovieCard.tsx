'use client';

import Image from 'next/image';
import { Play } from 'lucide-react';
import { useState } from 'react';
import { Movie } from '@/types';

interface TvMovieCardProps {
  movie: Movie;
  isTrending?: boolean;
}

export default function TvMovieCard({ movie, isTrending }: TvMovieCardProps) {
  const [isLoaded, setIsLoaded] = useState(false);

  return (
    <div
      tabIndex={0}
      className={`relative group cursor-pointer aspect-video rounded-xl overflow-hidden bg-[#14141a] border border-white/10 transition-transform duration-150 ease-out focus:outline-none focus:scale-105 focus:border-[#F042FF] focus:ring-4 focus:ring-[#F042FF]/40 ${
        isTrending ? 'w-[360px]' : 'w-[300px]'
      }`}
    >
      {/* Skeleton đơn giản khi ảnh đang tải */}
      {!isLoaded && <div className="absolute inset-0 bg-[#1f1f28] animate-pulse" />}

      <Image
        src={movie.imageSrc}
        alt={movie.title}
        fill
        sizes="(max-width: 1200px) 300px, 360px"
        className={`object-cover transition-opacity duration-300 ${isLoaded ? 'opacity-100' : 'opacity-0'}`}
        referrerPolicy="no-referrer"
        onLoad={() => setIsLoaded(true)}
        loading="lazy"
      />

      {/* Lớp phủ gradient màu đen mờ đơn giản phía dưới */}
      <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/30 to-transparent" />

      {/* Thông tin phim */}
      <div className="absolute bottom-0 left-0 w-full p-3.5 flex items-end justify-between">
        <h3 className="text-white font-extrabold text-sm line-clamp-1 drop-shadow-sm pr-2">
          {movie.title}
        </h3>
        <div className="w-7 h-7 rounded-full bg-white/20 flex items-center justify-center shrink-0 border border-white/30">
          <Play className="w-3.5 h-3.5 text-white fill-white ml-0.5" />
        </div>
      </div>
    </div>
  );
}
