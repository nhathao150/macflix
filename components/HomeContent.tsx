// components/HomeContent.tsx
'use client';

import { useState, useEffect } from 'react';
import Hero from './Hero';
import MovieRow from './MovieRow';
import MovieModal from './MovieModal';
import { Movie } from '@/types';
import { useSession } from 'next-auth/react';

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
  const { data: session } = useSession();
  const [selectedMovie, setSelectedMovie] = useState<Movie | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [continueWatchingMovies, setContinueWatchingMovies] = useState<Movie[]>([]);

  useEffect(() => {
    const fetchHistory = async () => {
      if (!session?.user?.email) return;
      try {
        const res = await fetch(`/api/history?email=${session.user.email}`);
        const data = await res.json();
        if (res.ok && data.history && data.history.length > 0) {
          // Lấy tối đa 10 phim xem gần nhất
          const sortedHistory = data.history.sort((a: any, b: any) => 
            new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime()
          ).slice(0, 10);
          
          const historyMovies: Movie[] = sortedHistory.map((item: any) => {
            // Cố gắng tìm ảnh hd từ database, nếu không móc tạm từ API
            let imgSrc = '/placeholder-image.jpg';
            // Logic tìm ảnh từ mảng phimMoi trước (để lấy cache)
            const matchedMovie = [...phimMoi, ...chieuRap, ...phimBo, ...phimLe, ...hoatHinh].find(m => m.slug === item.slug);
            if (matchedMovie) {
               imgSrc = matchedMovie.imageSrc;
            }
            return {
              id: item._id || item.slug,
              title: item.name,
              slug: item.slug,
              imageSrc: imgSrc
            }
          });
          setContinueWatchingMovies(historyMovies);
        }
      } catch (error) {
        console.error("Lỗi lấy lịch sử:", error);
      }
    };
    fetchHistory();
  }, [session, phimMoi, chieuRap, phimBo, phimLe, hoatHinh]);

  const handleMovieClick = (movie: Movie) => {
    setSelectedMovie(movie);
    setIsModalOpen(true);
  };

  return (
    <>
      {/* Banner tự chuyển slide */}
      <Hero movies={heroMovies} onPlayClick={handleMovieClick} />
      
      {/* Các hàng phim đã được phân loại chuẩn chỉ */}
      <div className="flex flex-col gap-2 mt-[-40px] relative z-40">
        
        {/* Hàng "Tiếp tục xem" (nếu có) */}
        {continueWatchingMovies.length > 0 && (
          <MovieRow 
            title="Tiếp tục xem" 
            movies={continueWatchingMovies} 
            onMovieClick={handleMovieClick}
            viewMoreLink="/lich-su"
          />
        )}

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