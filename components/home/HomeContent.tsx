// components/HomeContent.tsx
'use client';

import { useState, useEffect } from 'react';
import dynamic from 'next/dynamic';
import Hero from './Hero';
import MovieRow from '../movies/MovieRow';
const MovieModal = dynamic(() => import('../movies/MovieModal'), { ssr: false });
import { Movie } from '@/types';
import { useSession } from 'next-auth/react';
import { getMovieDetails } from '@/lib/api';
import { useRouter } from 'next/navigation';

interface HomeContentProps {
  heroMovies: Movie[];
  phimMoi: Movie[];
  phimBo: Movie[];
  phimLe: Movie[];
  shows: Movie[];
  hoatHinh: Movie[];
  vietsub: Movie[];
  thuyetMinh: Movie[];
  longTieng: Movie[];
  dangChieu: Movie[];
  daHoanThanh: Movie[];
  subteam: Movie[];
  chieuRap: Movie[];
}

export default function HomeContent({ 
  heroMovies, 
  phimMoi,
  phimBo, 
  phimLe,
  shows,
  hoatHinh,
  vietsub,
  thuyetMinh,
  longTieng,
  dangChieu,
  daHoanThanh,
  subteam,
  chieuRap
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
          const sortedHistory = data.history.sort((a: any, b: any) => 
            new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime()
          ).slice(0, 10);
          
          const historyMovies: Movie[] = await Promise.all(sortedHistory.map(async (item: any) => {
            let imgSrc = '/placeholder-image.jpg';
            const matchedMovie = [...phimMoi, ...chieuRap, ...phimBo, ...phimLe, ...hoatHinh].find(m => m.slug === item.slug);
            if (matchedMovie) {
               imgSrc = matchedMovie.imageSrc;
            } else if (item.imageSrc) {
               imgSrc = item.imageSrc;
            } else {
                 try {
                   const detail = await getMovieDetails(item.slug);
                   if (detail && detail.movie) {
                     const imgUrl = detail.movie.thumb_url || detail.movie.poster_url;
                     imgSrc = imgUrl.startsWith('http') ? imgUrl : `https://phimimg.com/${imgUrl}`;
                   }
                 } catch (e) {
                   console.error("Lỗi lấy ảnh tạm", e);
                 }
            }
            return {
              id: item._id || item.slug,
              title: item.name,
              slug: item.slug,
              imageSrc: imgSrc
            }
          }));
          setContinueWatchingMovies(historyMovies);
        }
      } catch (error) {
        console.error("Lỗi lấy lịch sử:", error);
      }
    };
    fetchHistory();
  }, [session, phimMoi, chieuRap, phimBo, phimLe, hoatHinh]);

  const router = useRouter();

  const handleMovieClick = (movie: Movie) => {
    setSelectedMovie(movie);
    setIsModalOpen(true);
  };

  return (
    <>
      {/* Banner tự chuyển slide */}
      <Hero movies={heroMovies} onPlayClick={handleMovieClick} />
      
      {/* Các hàng phim hiển thị đầy đủ 12 danh mục theo đúng yêu cầu */}
      <div className="flex flex-col gap-2 mt-4 relative z-40">
        
        {/* Hàng "Tiếp tục xem" (nếu có) */}
        {continueWatchingMovies.length > 0 && (
          <MovieRow 
            rowIndex={0}
            title="Tiếp tục xem" 
            movies={continueWatchingMovies} 
            onMovieClick={handleMovieClick}
            viewMoreLink="/lich-su"
          />
        )}

        <MovieRow 
          rowIndex={1}
          title="Phim Mới Cập Nhật" 
          movies={phimMoi} 
          onMovieClick={handleMovieClick}
          viewMoreLink="/phim?danh-muc=phim-moi"
        />

        <MovieRow 
          rowIndex={2}
          title="Phim Bộ" 
          movies={phimBo} 
          onMovieClick={handleMovieClick}
          viewMoreLink="/phim?danh-muc=phim-bo"
        />

        <MovieRow 
          rowIndex={3}
          title="Phim Lẻ" 
          movies={phimLe} 
          onMovieClick={handleMovieClick}
          viewMoreLink="/phim?danh-muc=phim-le"
        />

        <MovieRow 
          rowIndex={4}
          title="Shows & TV Shows" 
          movies={shows} 
          onMovieClick={handleMovieClick}
          viewMoreLink="/phim?danh-muc=tv-shows"
        />

        <MovieRow 
          rowIndex={5}
          title="Hoạt Hình" 
          movies={hoatHinh} 
          onMovieClick={handleMovieClick}
          viewMoreLink="/phim?danh-muc=hoat-hinh"
        />

        <MovieRow 
          rowIndex={6}
          title="Phim Vietsub" 
          movies={vietsub} 
          onMovieClick={handleMovieClick}
          viewMoreLink="/phim?danh-muc=phim-vietsub"
        />

        <MovieRow 
          rowIndex={7}
          title="Phim Thuyết Minh" 
          movies={thuyetMinh} 
          onMovieClick={handleMovieClick}
          viewMoreLink="/phim?danh-muc=phim-thuyet-minh"
        />

        <MovieRow 
          rowIndex={8}
          title="Phim Lồng Tiếng" 
          movies={longTieng} 
          onMovieClick={handleMovieClick}
          viewMoreLink="/phim?danh-muc=phim-long-tieng"
        />

        <MovieRow 
          rowIndex={9}
          title="Phim Bộ Đang Chiếu" 
          movies={dangChieu} 
          onMovieClick={handleMovieClick}
          viewMoreLink="/phim?danh-muc=phim-bo-dang-chieu"
        />

        <MovieRow 
          rowIndex={10}
          title="Phim Bộ Đã Hoàn Thành" 
          movies={daHoanThanh} 
          onMovieClick={handleMovieClick}
          viewMoreLink="/phim?danh-muc=phim-bo-da-hoan-thanh"
        />

        <MovieRow 
          rowIndex={11}
          title="Subteam" 
          movies={subteam} 
          onMovieClick={handleMovieClick}
          viewMoreLink="/phim?danh-muc=subteam"
        />

        <MovieRow 
          rowIndex={12}
          title="Phim Chiếu Rạp" 
          movies={chieuRap} 
          onMovieClick={handleMovieClick}
          viewMoreLink="/phim?danh-muc=chieu-rap"
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