import Image from 'next/image';
import { Play } from 'lucide-react';
import { useState } from 'react';

interface MovieCardProps {
  movie: {
    id: string;
    title: string;
    imageSrc: string;
    posterSrc?: string;
    slug?: string;
  };
  isTrending?: boolean;
}

export default function MovieCard({ movie, isTrending }: MovieCardProps) {
  const [isLoaded, setIsLoaded] = useState(false);
  const poster = movie.posterSrc || movie.imageSrc;

  return (
    <>
      {/* 1. GIAO DIỆN MOBILE (DỌC - aspect-[2/3]) */}
      <div 
        tabIndex={0}
        className={`relative group cursor-pointer aspect-[2/3] rounded-xl overflow-hidden bg-[#16151a]/40 border border-white/[0.08] shadow-[0_8px_24px_rgba(0,0,0,0.5)] md:hidden active-scale focus:outline-none focus:scale-105 focus:ring-2 focus:ring-purple-500 transition-all duration-300 ${
          isTrending ? 'w-[135px]' : 'w-[125px]'
        }`}
      >
        <Image
          src={poster}
          alt={movie.title}
          fill
          sizes="150px"
          className="object-cover transition-all duration-500"
          referrerPolicy="no-referrer"
          loading="lazy"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/95 via-black/20 to-transparent opacity-80" />
        <div className="absolute bottom-0 left-0 w-full p-2.5">
          <h3 className="text-white font-bold text-[11px] leading-tight line-clamp-2 drop-shadow-md">
            {movie.title}
          </h3>
        </div>
      </div>

      {/* 2. GIAO DIỆN DESKTOP (NGANG - aspect-video) */}
      <div 
        tabIndex={0}
        className={`relative group cursor-pointer aspect-video rounded-2xl overflow-hidden bg-[#16151a]/40 border border-white/[0.08] shadow-[0_12px_40px_rgba(0,0,0,0.5),inset_0_1px_1px_rgba(255,255,255,0.05)] hover:shadow-[0_24px_50px_rgba(0,0,0,0.7),0_0_20px_rgba(168,85,247,0.15)] hover:scale-[1.03] focus:outline-none focus:scale-[1.05] focus:shadow-[0_24px_50px_rgba(0,0,0,0.8),0_0_30px_rgba(168,85,247,0.4)] focus:border-purple-500 transform-gpu will-change-transform transition-[transform,box-shadow,border-color] duration-300 ease-out hidden md:flex ${
          isTrending ? 'w-[400px]' : 'w-[320px]'
        }`}
      >
        {/* Shimmer skeleton khi ảnh chưa load */}
        {!isLoaded && (
          <div className="absolute inset-0 bg-gradient-to-r from-white/5 via-white/10 to-white/5 animate-pulse" />
        )}
        <Image
          src={movie.imageSrc}
          alt={movie.title}
          fill
          sizes="(max-width: 1200px) 50vw, 33vw"
          className={`object-cover transition-all duration-500 group-hover:scale-110 group-focus:scale-110 ${isLoaded ? 'opacity-100' : 'opacity-0'}`}
          referrerPolicy="no-referrer"
          onLoad={() => setIsLoaded(true)}
          loading="lazy"
        />
        
        {/* Lớp phủ gradient đen ở dưới để hiện chữ cho rõ */}
        <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/20 to-transparent opacity-80 group-hover:opacity-100 group-focus:opacity-100 transition-opacity duration-300" />
        
        {/* Nội dung trên thẻ phim */}
        <div className="absolute bottom-0 left-0 w-full p-4 flex items-end justify-between translate-y-2 group-hover:translate-y-0 group-focus:translate-y-0 transition-transform duration-300">
          <h3 className="text-white font-bold text-sm md:text-base line-clamp-2 pr-4 drop-shadow-md">
            {movie.title}
          </h3>
          
          {/* Nút Play nhỏ ở góc */}
          <button className="shrink-0 w-8 h-8 md:w-10 md:h-10 rounded-full bg-white/10 backdrop-blur-md flex items-center justify-center transition-all duration-300 border border-white/20 shadow-lg hover:bg-white/20 hover:scale-110 active:scale-95">
            <Play className="w-4 h-4 md:w-5 md:h-5 text-white fill-white" />
          </button>
        </div>
      </div>
    </>
  );
}