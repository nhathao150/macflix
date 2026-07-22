'use client';

import { useState, useEffect, useCallback } from 'react';
import Image from 'next/image';
import { Play, Plus, ChevronLeft, ChevronRight } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { Movie } from '@/types';
import { useTv } from '@/context/TvContext';
import TvHero from '@/components/tv/TvHero';

interface HeroProps {
  movies: Movie[];
  onPlayClick: (movie: Movie) => void;
}

export default function Hero({ movies, onPlayClick }: HeroProps) {
  const { isTvMode } = useTv();
  const [currentIndex, setCurrentIndex] = useState(0);

  if (isTvMode) {
    return <TvHero movies={movies} onPlayClick={onPlayClick} />;
  }

  // Lấy ra 5 phim đầu tiên làm Banner cho đỡ nặng
  const heroMovies = movies?.slice(0, 5) || [];

  const nextSlide = useCallback(() => {
    setCurrentIndex((prevIndex) => (prevIndex + 1) % heroMovies.length);
  }, [heroMovies.length]);

  const prevSlide = () => {
    setCurrentIndex((prevIndex) => (prevIndex === 0 ? heroMovies.length - 1 : prevIndex - 1));
  };

  // Tự động chuyển slide sau mỗi 6 giây
  useEffect(() => {
    if (heroMovies.length <= 1) return;
    const timer = setInterval(nextSlide, 6000);
    return () => clearInterval(timer);
  }, [nextSlide, heroMovies.length]);

  if (heroMovies.length === 0) {
    return <div className="w-full h-[60vh] md:h-[85vh] bg-[#0a0a0c] animate-pulse" />;
  }

  const currentMovie = heroMovies[currentIndex];

  return (
    <div className="relative w-full h-[60vh] md:h-[85vh] bg-[#0a0a0c] overflow-hidden group">
      
      {/* KHU VỰC ẢNH NỀN VỚI HIỆU ỨNG CROSSFADE MƯỢT MÀ */}
      <AnimatePresence mode="wait">
        <motion.div
          key={currentIndex}
          initial={{ opacity: 0, scale: 1.05 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.8, ease: 'easeInOut' }}
          className="absolute inset-0"
        >
          {/* Desktop landscape poster */}
          <div className="hidden md:block absolute inset-0">
            <Image 
              src={currentMovie.imageSrc} 
              alt={currentMovie.title} 
              fill 
              className="object-cover"
              priority={currentIndex === 0}
              loading={currentIndex === 0 ? 'eager' : 'lazy'}
              referrerPolicy="no-referrer"
            />
          </div>
          {/* Mobile portrait poster */}
          <div className="md:hidden absolute inset-0">
            <Image 
              src={currentMovie.posterSrc || currentMovie.imageSrc} 
              alt={currentMovie.title} 
              fill 
              className="object-cover"
              priority={currentIndex === 0}
              loading={currentIndex === 0 ? 'eager' : 'lazy'}
              referrerPolicy="no-referrer"
            />
          </div>
        </motion.div>
      </AnimatePresence>

      {/* LỚP PHỦ GRADIENT */}
      {/* Bottom gradient overlay to blend into dark background and make text legible */}
      <div className="absolute bottom-0 left-0 right-0 h-[45%] bg-gradient-to-t from-[#0a0a0c] via-[#0a0a0c]/60 to-transparent pointer-events-none z-10" />
      {/* Subtle side gradient overlay for desktop only to keep left-aligned text readable */}
      <div className="hidden md:block absolute inset-0 bg-gradient-to-r from-[#0a0a0c]/85 via-[#0a0a0c]/20 to-transparent w-[50%] pointer-events-none z-10" />
      
      {/* NỘI DUNG CHÍNH */}
      <div className="absolute bottom-0 left-0 w-full p-5 md:p-16 pb-12 md:pb-24 flex flex-col items-start gap-3 md:gap-4 z-20">
        
        {/* Nhãn (Badge) */}
        <span className="bg-white/10 backdrop-blur-md text-white text-[9px] md:text-xs font-extrabold px-3 py-1 rounded-full uppercase tracking-widest border border-white/10 shadow-sm">
          Thịnh Hành
        </span>

        {/* Tiêu đề phim */}
        <h1 
          key={`title-${currentIndex}`}
          className="text-2xl md:text-4xl lg:text-5xl font-black text-white tracking-tight uppercase max-w-4xl drop-shadow-2xl line-clamp-2 leading-tight"
        >
          {currentMovie.title}
        </h1>
        
        {/* Các nút bấm */}
        <div className="flex items-center gap-3 mt-1.5 md:mt-2">
          <button 
            tabIndex={0}
            onClick={() => onPlayClick(currentMovie)}
            className="flex items-center justify-center gap-2 bg-white text-black px-6 md:px-8 py-3 md:py-3.5 rounded-full font-bold hover:bg-white/95 focus:bg-white focus:ring-4 focus:ring-[#F042FF] focus:scale-105 focus:outline-none transition-all active-scale shadow-lg hover:shadow-white/10"
          >
            <Play className="w-4 h-4 md:w-5 md:h-5 fill-current" />
            <span className="text-sm md:text-lg">Phát ngay</span>
          </button>
          
          <button 
            tabIndex={0}
            className="flex items-center justify-center w-11 h-11 md:w-12 md:h-12 bg-white/10 text-white backdrop-blur-md border border-white/20 rounded-full hover:bg-white/20 focus:bg-white/30 focus:ring-4 focus:ring-[#F042FF] focus:scale-105 focus:outline-none transition-all active-scale"
          >
            <Plus className="w-5 h-5 md:w-6 h-6" />
          </button>
        </div>
      </div>

      {/* NÚT ĐIỀU HƯỚNG MŨI TÊN */}
      <button 
        onClick={prevSlide}
        className="absolute left-4 top-1/2 -translate-y-1/2 z-30 opacity-0 group-hover:opacity-100 transition-all active-scale p-2 text-white/50 hover:text-white"
      >
        <ChevronLeft className="w-12 h-12 drop-shadow-xl" />
      </button>
      <button 
        onClick={nextSlide}
        className="absolute right-4 top-1/2 -translate-y-1/2 z-30 opacity-0 group-hover:opacity-100 transition-all active:scale-90 p-2 text-white/50 hover:text-white"
      >
        <ChevronRight className="w-12 h-12 drop-shadow-xl" />
      </button>

      {/* CHẤM BI (Pagination) */}
      <div className="absolute bottom-6 left-1/2 -translate-x-1/2 z-30 flex items-center gap-2">
        {heroMovies.map((_, idx) => (
          <button
            key={idx}
            onClick={() => setCurrentIndex(idx)}
            className={`transition-all duration-300 rounded-full ${
              idx === currentIndex 
                ? 'w-6 h-2 bg-white' 
                : 'w-2 h-2 bg-white/40 hover:bg-white/70'
            }`}
          />
        ))}
      </div>

    </div>
  );
}