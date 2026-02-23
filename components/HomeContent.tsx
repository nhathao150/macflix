// components/HomeContent.tsx
'use client';

import { useState } from 'react';
import Hero from './Hero';
import MovieRow from './MovieRow';
import MovieModal from './MovieModal';
import { Movie } from '../lib/api';

interface HomeContentProps {
  heroMovies: Movie[];
  phimLe: Movie[];
  phimBo: Movie[];
  hoatHinh: Movie[];
}

export default function HomeContent({ heroMovies, phimLe, phimBo, hoatHinh }: HomeContentProps) {
  const [selectedMovie, setSelectedMovie] = useState<any>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);

  const handleMovieClick = (movie: any) => {
    setSelectedMovie(movie);
    setIsModalOpen(true);
  };

  return (
    <>
      {/* Banner tự chuyển slide */}
      <Hero movies={heroMovies} onPlayClick={handleMovieClick} />
      
      {/* Các hàng phim đã được phân loại chuẩn chỉ */}
      <div className="flex flex-col gap-2 mt-[-40px] relative z-40">
        <MovieRow 
          title="Phim Lẻ (Điện Ảnh) Mới Nhất" 
          movies={phimLe} 
          isTrending 
          onMovieClick={handleMovieClick}
        />
        
        <MovieRow 
          title="Phim Bộ Đặc Sắc" 
          movies={phimBo} 
          onMovieClick={handleMovieClick}
        />
        
        <MovieRow 
          title="Thế Giới Anime & Hoạt Hình" 
          movies={hoatHinh} 
          onMovieClick={handleMovieClick}
        />
      </div>

      <MovieModal 
        isOpen={isModalOpen} 
        onClose={() => setIsModalOpen(false)} 
        movie={selectedMovie}
      />
    </>
  );
}