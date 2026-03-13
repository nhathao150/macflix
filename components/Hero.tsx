'use client';

import { useState, useEffect, useCallback } from 'react';
import Image from 'next/image';
import { Play, Plus, ChevronLeft, ChevronRight } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { Movie } from '@/types';

interface HeroProps {
  movies: Movie[];
  onPlayClick: (movie: Movie) => void;
}

export default function Hero({ movies, onPlayClick }: HeroProps) {
  const [currentIndex, setCurrentIndex] = useState(0);

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
    return <div className="w-full h-[60vh] md:h-[85vh] bg-[#010030] animate-pulse" />;
  }

  const currentMovie = heroMovies[currentIndex];

  return (
    <div className="relative w-full h-[65vh] md:h-[85vh] bg-[#010030] overflow-hidden group">
      
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
          <Image 
            src={currentMovie.imageSrc} 
            alt={currentMovie.title} 
            fill 
            className="object-cover"
            priority={currentIndex === 0}
            loading={currentIndex === 0 ? 'eager' : 'lazy'}
            referrerPolicy="no-referrer"
          />
        </motion.div>
      </AnimatePresence>

      {/* LỚP PHỦ GRADIENT */}
      <div className="absolute inset-0 bg-gradient-to-t from-[#010030] via-[#010030]/20 to-transparent" />
      <div className="absolute inset-0 bg-gradient-to-r from-[#010030]/90 via-[#010030]/50 to-transparent w-full md:w-[70%]" />
      
      {/* NỘI DUNG CHÍNH */}
      <div className="absolute bottom-0 left-0 w-full p-6 md:p-16 pb-16 md:pb-24 flex flex-col items-start gap-4 z-20">
        
        {/* Nhãn (Badge) */}
        <span className="bg-white/20 backdrop-blur-md text-white text-[10px] md:text-xs font-bold px-3 py-1 rounded-full uppercase tracking-widest border border-white/20">
          Thịnh Hành
        </span>

        {/* Tiêu đề phim */}
        <h1 
          key={`title-${currentIndex}`}
          className="text-3xl md:text-4xl lg:text-5xl font-extrabold text-white tracking-tight uppercase max-w-4xl drop-shadow-2xl line-clamp-3 leading-tight"
        >
          {currentMovie.title}
        </h1>
        

        
        {/* Các nút bấm */}
        <div className="flex items-center gap-4">
          <button 
            onClick={() => onPlayClick(currentMovie)}
            className="flex items-center justify-center gap-2 bg-white text-black px-8 py-3.5 rounded-full font-bold hover:bg-white/80 transition-all hover:scale-105 active:scale-95"
          >
            <Play className="w-5 h-5 fill-current" />
            <span className="text-base md:text-lg">Phát ngay</span>
          </button>
          
          <button className="flex items-center justify-center w-12 h-12 bg-white/10 text-white backdrop-blur-md border border-white/20 rounded-full hover:bg-white/20 transition-all hover:scale-105 active:scale-95">
            <Plus className="w-6 h-6" />
          </button>
        </div>
      </div>

      {/* NÚT ĐIỀU HƯỚNG MŨI TÊN */}
      <button 
        onClick={prevSlide}
        className="absolute left-4 top-1/2 -translate-y-1/2 z-30 opacity-0 group-hover:opacity-100 transition-all active:scale-90 p-2 text-white/50 hover:text-white"
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