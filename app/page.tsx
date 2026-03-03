// app/page.tsx
import Navbar from '@/components/Navbar';
import HomeContent from '@/components/HomeContent';
import { getNewMovies, getMoviesByCategory } from '@/lib/api';

export default async function Home() {
  // Gộp heroMovies và phimMoi thành 1 request, sau đó slice để tái sử dụng
  const [
    phimMoi,      // Phim mới (20) — dùng chung cho cả Hero Banner và danh sách
    chieuRap,     // Phim chiếu rạp (tv-shows) (20)
    phimBo,       // Phim bộ (20)
    phimLe,       // Phim lẻ (20)
    hoatHinh      // Hoạt hình (20)
  ] = await Promise.all([
    getNewMovies(1, 20),                    // 1 request dùng chung cho Banner + danh sách
    getMoviesByCategory('tv-shows', 20),    // Phim chiếu rạp (tv-shows)
    getMoviesByCategory('phim-bo', 20),     // Phim bộ
    getMoviesByCategory('phim-le', 20),     // Phim lẻ
    getMoviesByCategory('hoat-hinh', 20)   // Hoạt hình
  ]);

  // Tái sử dụng dữ liệu phimMoi, chỉ lấy 5 phim đầu cho Hero Banner
  const heroMovies = phimMoi.slice(0, 5);

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