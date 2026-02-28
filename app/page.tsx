// app/page.tsx
import Navbar from '@/components/Navbar';
import HomeContent from '@/components/HomeContent';
import { getNewMovies, getMoviesByCategory } from '@/lib/api';

export default async function Home() {
  // Lấy dữ liệu 6 danh mục phim cùng 1 lúc (tối đa 20 phim mỗi loại)
  const [
    heroMovies,   // Dành cho Banner
    phimMoi,      // Phim mới (20)
    chieuRap,     // Phim chiếu rạp (tv-shows) (20)
    phimBo,       // Phim bộ (20)
    phimLe,       // Phim lẻ (20)
    hoatHinh      // Hoạt hình (20)
  ] = await Promise.all([
    getNewMovies(1, 10),                    // Banner cần 10 phim mới nhất
    getNewMovies(1, 20),                    // Danh sách phim mới
    getMoviesByCategory('tv-shows', 20),    // Phim chiếu rạp (tv-shows)
    getMoviesByCategory('phim-bo', 20),     // Phim bộ
    getMoviesByCategory('phim-le', 20),     // Phim lẻ
    getMoviesByCategory('hoat-hinh', 20)   // Hoạt hình
  ]);

  return (
    <main className="min-h-screen pb-20 bg-[#050505]">
      <Navbar />
      <HomeContent 
        heroMovies={heroMovies}
        phimMoi={phimMoi}
        chieuRap={chieuRap}
        phimBo={phimBo}
        phimLe={phimLe}
        hoatHinh={hoatHinh}
      />
    </main>
  );
}