// components/HomeContent.tsx
'use client'; // Đây là Client Component, sẽ chạy ở trình duyệt của người dùng

import { useState, useCallback, useMemo } from 'react'; // React hooks dùng để quản lý state và side effects
import dynamic from 'next/dynamic'; // Hàm của Next.js giúp tải component một cách bất đồng bộ (lazy loading)
import Hero from './Hero'; // Component hiển thị banner chính trên cùng (Hero section)
import MovieRow from '../movies/MovieRow'; // Component hiển thị từng hàng phim mà ta vừa chú thích
// Tải MovieModal (popup chi tiết phim) bất đồng bộ, tắt SSR (Server-Side Rendering) để tối ưu hiệu suất tải trang đầu
const MovieModal = dynamic(() => import('../movies/MovieModal'), { ssr: false });
import { Movie } from '@/types'; // Import interface Movie
import { useSession } from 'next-auth/react'; // Hook lấy thông tin đăng nhập của người dùng
import { useWatchHistory } from '@/hooks/useWatchHistory'; // Hook tuỳ chỉnh quản lý lịch sử

// Định nghĩa dữ liệu đầu vào (props) mà trang chủ (page.tsx) sẽ truyền xuống cho HomeContent
interface HomeContentProps {
  heroMovies: Movie[]; // Danh sách phim dùng làm banner Hero
  phimMoi: Movie[]; // Các hàng phim theo từng danh mục
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
  // Lấy session (thông tin user đăng nhập)
  const { data: session } = useSession();
  
  // State quản lý việc phim nào đang được chọn để mở popup (modal)
  const [selectedMovie, setSelectedMovie] = useState<Movie | null>(null);
  // State quản lý trạng thái đóng/mở của popup (modal)
  const [isModalOpen, setIsModalOpen] = useState(false);
  
  // Memoize mảng các phim để truyền vào hook tránh tạo lại array mỗi lần render
  const moviesToMatch = useMemo(() => [phimMoi, chieuRap, phimBo, phimLe, hoatHinh], [phimMoi, chieuRap, phimBo, phimLe, hoatHinh]);
  
  // Sử dụng Custom Hook để tách biệt logic fetch history
  const { continueWatchingMovies } = useWatchHistory({
    email: session?.user?.email,
    moviesToMatch
  });

  // Sử dụng useCallback để không tạo lại hàm handleMovieClick mỗi khi HomeContent render,
  // Giúp các component con (như Hero, MovieRow) không bị re-render không cần thiết.
  const handleMovieClick = useCallback((movie: Movie) => {
    setSelectedMovie(movie); // Lưu phim được chọn vào state
    setIsModalOpen(true); // Bật cờ mở modal lên true để hiện giao diện popup
  }, []);

  const handleCloseModal = useCallback(() => {
    setIsModalOpen(false);
  }, []);

  return (
    <>
      {/* Banner tự chuyển slide trên cùng trang chủ, truyền handleMovieClick để bấm nút Play mở popup */}
      <Hero movies={heroMovies} onPlayClick={handleMovieClick} />
      
      {/* Các hàng phim hiển thị đầy đủ 12 danh mục theo đúng yêu cầu */}
      <div className="flex flex-col gap-2 mt-4 relative z-40">
        
        {/* Hàng "Tiếp tục xem" (chỉ hiển thị nếu mảng continueWatchingMovies có dữ liệu) */}
        {continueWatchingMovies.length > 0 && (
          <MovieRow 
            rowIndex={0}
            title="Tiếp tục xem" 
            movies={continueWatchingMovies} 
            onMovieClick={handleMovieClick}
            viewMoreLink="/history" // Link tới trang lịch sử đầy đủ
          />
        )}

        {/* --- Các hàng phim theo từng danh mục --- */}
        <MovieRow 
          rowIndex={1}
          title="Phim Mới Cập Nhật" 
          movies={phimMoi} 
          onMovieClick={handleMovieClick}
          viewMoreLink="/movies?danh-muc=phim-moi"
        />

        <MovieRow 
          rowIndex={2}
          title="Phim Bộ" 
          movies={phimBo} 
          onMovieClick={handleMovieClick}
          viewMoreLink="/movies?danh-muc=phim-bo"
        />

        <MovieRow 
          rowIndex={3}
          title="Phim Lẻ" 
          movies={phimLe} 
          onMovieClick={handleMovieClick}
          viewMoreLink="/movies?danh-muc=phim-le"
        />

        <MovieRow 
          rowIndex={4}
          title="Shows & TV Shows" 
          movies={shows} 
          onMovieClick={handleMovieClick}
          viewMoreLink="/movies?danh-muc=tv-shows"
        />

        <MovieRow 
          rowIndex={5}
          title="Hoạt Hình" 
          movies={hoatHinh} 
          onMovieClick={handleMovieClick}
          viewMoreLink="/movies?danh-muc=hoat-hinh"
        />

        <MovieRow 
          rowIndex={6}
          title="Phim Vietsub" 
          movies={vietsub} 
          onMovieClick={handleMovieClick}
          viewMoreLink="/movies?danh-muc=phim-vietsub"
        />

        <MovieRow 
          rowIndex={7}
          title="Phim Thuyết Minh" 
          movies={thuyetMinh} 
          onMovieClick={handleMovieClick}
          viewMoreLink="/movies?danh-muc=phim-thuyet-minh"
        />

        <MovieRow 
          rowIndex={8}
          title="Phim Lồng Tiếng" 
          movies={longTieng} 
          onMovieClick={handleMovieClick}
          viewMoreLink="/movies?danh-muc=phim-long-tieng"
        />

        <MovieRow 
          rowIndex={9}
          title="Phim Bộ Đang Chiếu" 
          movies={dangChieu} 
          onMovieClick={handleMovieClick}
          viewMoreLink="/movies?danh-muc=phim-bo-dang-chieu"
        />

        <MovieRow 
          rowIndex={10}
          title="Phim Bộ Đã Hoàn Thành" 
          movies={daHoanThanh} 
          onMovieClick={handleMovieClick}
          viewMoreLink="/movies?danh-muc=phim-bo-da-hoan-thanh"
        />

        <MovieRow 
          rowIndex={11}
          title="Subteam" 
          movies={subteam} 
          onMovieClick={handleMovieClick}
          viewMoreLink="/movies?danh-muc=subteam"
        />

        <MovieRow 
          rowIndex={12}
          title="Phim Chiếu Rạp" 
          movies={chieuRap} 
          onMovieClick={handleMovieClick}
          viewMoreLink="/movies?danh-muc=chieu-rap"
        />
      </div>

      {/* Popup chi tiết phim (Modal). Nó được gắn ngoài luồng hiển thị chính. */}
      {/* Nó luôn tồn tại ở đây nhưng chỉ hiện lên màn hình khi isModalOpen = true */}
      <MovieModal 
        isOpen={isModalOpen} 
        onClose={handleCloseModal} // Truyền hàm đóng modal
        movie={selectedMovie} // Truyền dữ liệu phim đang được click vào modal
      />
    </>
  );
}