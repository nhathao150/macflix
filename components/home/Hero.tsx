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

// Component Hero hiển thị banner chính của trang chủ với hiệu ứng carousel (trượt ảnh)
export default function Hero({ movies, onPlayClick }: HeroProps) {
  // State lưu trữ chỉ số (index) của phim đang được hiển thị trên banner
  const [currentIndex, setCurrentIndex] = useState(0);

  // Lấy ra 5 phim đầu tiên từ danh sách truyền vào làm Banner để tối ưu hiệu suất (đỡ nặng)
  const heroMovies = movies?.slice(0, 5) || [];

  // Hàm chuyển sang slide tiếp theo
  // Sử dụng useCallback để không tạo lại hàm mỗi khi component render, tối ưu performance
  const nextSlide = useCallback(() => {
    // Nếu đang ở slide cuối thì quay lại slide đầu tiên (0), ngược lại thì tăng index lên 1
    setCurrentIndex((prevIndex) => (prevIndex + 1) % heroMovies.length);
  }, [heroMovies.length]);

  // Hàm lùi về slide trước đó
  const prevSlide = () => {
    // Nếu đang ở slide đầu thì lùi về slide cuối cùng, ngược lại thì giảm index đi 1
    setCurrentIndex((prevIndex) => (prevIndex === 0 ? heroMovies.length - 1 : prevIndex - 1));
  };

  // Effect tự động chuyển slide sau mỗi 6 giây
  useEffect(() => {
    // Nếu chỉ có 1 phim hoặc không có phim nào thì không cần tự động chuyển
    if (heroMovies.length <= 1) return;
    
    // Thiết lập bộ đếm thời gian (timer) gọi hàm nextSlide mỗi 6000ms (6 giây)
    const timer = setInterval(nextSlide, 6000);
    
    // Cleanup function: Xóa bỏ timer khi component bị unmount hoặc trước khi effect chạy lại
    return () => clearInterval(timer);
  }, [nextSlide, heroMovies.length]);

  // Nếu chưa có dữ liệu phim, hiển thị khung skeleton (loading mờ ảo) để giữ layout
  if (heroMovies.length === 0) {
    return <div className="w-full h-[60vh] md:h-[85vh] bg-[#0a0a0c] animate-pulse" />;
  }

  // Lấy thông tin phim hiện tại đang được chọn để hiển thị trên màn hình
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
              sizes="(max-width: 768px) 100vw, (max-width: 1200px) 100vw, 100vw"
              className="object-cover"
              priority
              referrerPolicy="no-referrer"
            />
          </div>
          {/* Mobile portrait poster */}
          <div className="md:hidden absolute inset-0">
            <Image
              src={currentMovie.posterSrc || currentMovie.imageSrc}
              alt={currentMovie.title}
              fill
              sizes="(max-width: 768px) 100vw, (max-width: 1200px) 100vw, 100vw"
              className="object-cover"
              priority
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
            className={`transition-all duration-300 rounded-full ${idx === currentIndex
                ? 'w-6 h-2 bg-white'
                : 'w-2 h-2 bg-white/40 hover:bg-white/70'
              }`}
          />
        ))}
      </div>

    </div>
  );
}