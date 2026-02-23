// app/page.tsx
import Navbar from '@/components/Navbar';
import HomeContent from '@/components/HomeContent';
import { getNewMovies, getMoviesByCategory } from '@/lib/api';

export default async function Home() {
  // Gọi 4 luồng API cùng lúc để tiết kiệm thời gian chờ
  const [heroMovies, phimLe, phimBo, hoatHinh] = await Promise.all([
    getNewMovies(1),                  // Thập cẩm phim mới nhất cho Banner to
    getMoviesByCategory('phim-le'),   // Danh sách Phim Lẻ
    getMoviesByCategory('phim-bo'),   // Danh sách Phim Bộ
    getMoviesByCategory('hoat-hinh')  // Danh sách Anime / Hoạt Hình
  ]);

  return (
    <main className="min-h-screen pb-20 bg-[#050505]">
      <Navbar />
      <HomeContent 
        heroMovies={heroMovies}
        phimLe={phimLe} 
        phimBo={phimBo} 
        hoatHinh={hoatHinh} 
      />
    </main>
  );
}