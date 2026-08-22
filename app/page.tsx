// app/page.tsx
import Navbar from '@/components/layout/Navbar';
import HomeContent from '@/components/home/HomeContent';
import { getNewMovies, getMoviesByCategory, getMoviesByGenre } from '@/services/movie.service';

export default async function Home() {
  // Lấy dữ liệu 12 danh mục phim theo đúng yêu cầu
  const [
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
  ] = await Promise.all([
    getNewMovies(1, 20),
    getMoviesByCategory('phim-bo', 20),
    getMoviesByCategory('phim-le', 20),
    getMoviesByCategory('tv-shows', 20),
    getMoviesByCategory('hoat-hinh', 20),
    getMoviesByCategory('phim-vietsub', 20).then(r => r.length > 0 ? r : getMoviesByGenre('tinh-cam')),
    getMoviesByCategory('phim-thuyet-minh', 20).then(r => r.length > 0 ? r : getMoviesByGenre('hanh-dong')),
    getMoviesByCategory('phim-long-tieng', 20).then(r => r.length > 0 ? r : getMoviesByGenre('co-trang')),
    getMoviesByCategory('phim-bo-dang-chieu', 20).then(r => r.length > 0 ? r : getMoviesByCategory('phim-bo', 20)),
    getMoviesByCategory('phim-bo-da-hoan-thanh', 20).then(r => r.length > 0 ? r : getMoviesByGenre('vien-tuong')),
    getMoviesByCategory('subteam', 20).then(r => r.length > 0 ? r : getMoviesByGenre('hoc-duong')),
    getMoviesByCategory('tv-shows', 20),
  ]);

  const heroMovies = phimMoi.slice(0, 5);

  return (
    <main className="min-h-screen pb-28 bg-[#0a0a0c]">
      <Navbar />
      <HomeContent 
        heroMovies={heroMovies}
        phimMoi={phimMoi}
        phimBo={phimBo}
        phimLe={phimLe}
        shows={shows}
        hoatHinh={hoatHinh}
        vietsub={vietsub}
        thuyetMinh={thuyetMinh}
        longTieng={longTieng}
        dangChieu={dangChieu}
        daHoanThanh={daHoanThanh}
        subteam={subteam}
        chieuRap={chieuRap}
      />
    </main>
  );
}