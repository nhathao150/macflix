// components/HomeContent.tsx
'use client';

import { useState } from 'react';
import Hero from './Hero';
import MovieRow from './MovieRow';
import MovieModal from './MovieModal';
import { Movie } from '../lib/api';

interface HomeContentProps {
  heroMovies: Movie[];
  phimMoi: Movie[];
  chieuRap: Movie[];
  phimBo: Movie[];
  phimLe: Movie[];
  hoatHinh: Movie[];
}

export default function HomeContent({ 
  heroMovies, 
  phimMoi,
  chieuRap,
  phimBo, 
  phimLe,
  hoatHinh
}: HomeContentProps) {
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
          title="Phim Mới Cập Nhật" 
          movies={phimMoi} 
          isTrending 
          onMovieClick={handleMovieClick}
          viewMoreLink="/phim?danh-muc=phim-moi"
        />

        <MovieRow 
          title="Phim Chiếu Rạp" 
          movies={chieuRap} 
          onMovieClick={handleMovieClick}
          viewMoreLink="/phim?danh-muc=tv-shows"
        />
        
        <MovieRow 
          title="Phim Bộ Đặc Sắc" 
          movies={phimBo} 
          onMovieClick={handleMovieClick}
          viewMoreLink="/phim?danh-muc=phim-bo"
        />

        <MovieRow 
          title="Phim Lẻ (Điện Ảnh)" 
          movies={phimLe} 
          onMovieClick={handleMovieClick}
          viewMoreLink="/phim?danh-muc=phim-le"
        />
        
        <MovieRow 
          title="Thế Giới Anime & Hoạt Hình" 
          movies={hoatHinh} 
          onMovieClick={handleMovieClick}
          viewMoreLink="/phim?danh-muc=hoat-hinh"
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