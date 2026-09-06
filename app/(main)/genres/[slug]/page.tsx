'use client';

import { useEffect, useState, Suspense } from 'react';
import { useParams, useSearchParams, useRouter } from 'next/navigation';
import Navbar from '@/components/layout/Navbar';
import Image from 'next/image';
import { useModal } from '@/context/ModalContext';
import { getMoviesByGenrePaginated } from '@/services/movie.service';
import { ChevronLeft, ChevronRight, Play, Filter, X, RotateCcw, ChevronDown, Search } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import FilterDropdown from '@/components/ui/FilterDropdown';

interface Pagination {
  totalItems: number;
  totalPages: number;
  currentPage: number;
  pageRanges: number;
}

const GENRES = [
  { name: 'Hành Động', slug: 'hanh-dong' },
  { name: 'Tình Cảm', slug: 'tinh-cam' },
  { name: 'Hài Hước', slug: 'hai-huoc' },
  { name: 'Cổ Trang', slug: 'co-trang' },
  { name: 'Tâm Lý', slug: 'tam-ly' },
  { name: 'Hình Sự', slug: 'hinh-su' },
  { name: 'Chiến Tranh', slug: 'chien-tranh' },
  { name: 'Viễn Tưởng', slug: 'vien-tuong' },
  { name: 'Phiêu Lưu', slug: 'phieu-luu' },
  { name: 'Kinh Dị', slug: 'kinh-di' },
  { name: 'Thần Thoại', slug: 'than-thoai' },
  { name: 'Gia Đình', slug: 'gia-dinh' },
  { name: 'Học Đường', slug: 'hoc-duong' },
  { name: 'Võ Thuật', slug: 'vo-thuat' },
  { name: 'Bí ẩn', slug: 'bi-an' },
  { name: 'Tài Liệu', slug: 'tai-lieu' },
];

const COUNTRIES = [
  { name: 'Tất cả', slug: '' },
  { name: 'Trung Quốc', slug: 'trung-quoc' },
  { name: 'Hàn Quốc', slug: 'han-quoc' },
  { name: 'Nhật Bản', slug: 'nhat-ban' },
  { name: 'Thái Lan', slug: 'thai-lan' },
  { name: 'Âu Mỹ', slug: 'au-my' },
  { name: 'Đài Loan', slug: 'dai-loan' },
  { name: 'Hồng Kông', slug: 'hong-kong' },
  { name: 'Việt Nam', slug: 'viet-nam' },
  { name: 'Ấn Độ', slug: 'an-do' },
];

const YEARS = [
  { name: 'Tất cả', slug: '' },
  ...Array.from({ length: 12 }, (_, i) => {
    const year = (2026 - i).toString();
    return { name: year, slug: year };
  })
];

function GenreContent() {
  const params = useParams();
  const slug = params.slug as string;
  const searchParams = useSearchParams();
  const router = useRouter();

  const { openModal } = useModal();

  const pageParam = searchParams.get('page');
  const currentPage = pageParam ? parseInt(pageParam, 10) : 1;

  const countryParam = searchParams.get('country') || '';
  const yearParam = searchParams.get('year') || '';

  // Local temporary states
  const [tempGenre, setTempGenre] = useState(slug);
  const [tempCountry, setTempCountry] = useState(countryParam);
  const [tempYear, setTempYear] = useState(yearParam);
  const [isFilterDrawerOpen, setIsFilterDrawerOpen] = useState(false);

  const [movies, setMovies] = useState<any[]>([]);
  const [pagination, setPagination] = useState<any>(null);
  const [pageTitle, setPageTitle] = useState('Đang tải...');
  const [isLoading, setIsLoading] = useState(true);

  // Sync temporary states with active route and URL params
  useEffect(() => {
    setTempGenre(slug);
    setTempCountry(countryParam);
    setTempYear(yearParam);
  }, [slug, countryParam, yearParam]);

  useEffect(() => {
    const fetchMovies = async () => {
      setIsLoading(true);
      const data = await getMoviesByGenrePaginated(slug, currentPage, 24, countryParam, yearParam);
      
      setMovies(data.items);
      setPagination(data.pagination);
      setPageTitle(data.title);
      setIsLoading(false);
      
      window.scrollTo({ top: 0, behavior: 'smooth' });
    };

    fetchMovies();
  }, [slug, currentPage, countryParam, yearParam]);

  const handleApplyFilters = () => {
    const newParams = new URLSearchParams(searchParams.toString());
    newParams.set('page', '1');
    
    if (tempCountry) {
      newParams.set('country', tempCountry);
    } else {
      newParams.delete('country');
    }
    
    if (tempYear) {
      newParams.set('year', tempYear);
    } else {
      newParams.delete('year');
    }
    
    if (tempGenre && tempGenre !== slug) {
      router.push(`/genres/${tempGenre}?${newParams.toString()}`);
    } else {
      router.push(`/genres/${slug}?${newParams.toString()}`);
    }
    setIsFilterDrawerOpen(false);
  };

  const handleResetFilters = () => {
    setTempGenre(slug);
    setTempCountry('');
    setTempYear('');
    router.push(`/genres/${slug}?page=1`);
    setIsFilterDrawerOpen(false);
  };

  const handlePageChange = (newPage: number) => {
    if (newPage < 1 || (pagination && newPage > pagination.totalPages)) return;
    const newParams = new URLSearchParams(searchParams.toString());
    newParams.set('page', newPage.toString());
    router.push(`/genres/${slug}?${newParams.toString()}`);
  };

  const FilterBoxContent = () => (
    <div className="flex flex-col gap-6 text-white">
      <div className="flex items-center justify-between border-b border-white/10 pb-4">
        <h3 className="font-black text-sm tracking-wider uppercase text-cyan-400">Bộ lọc chi tiết</h3>
        {(tempCountry || tempYear || tempGenre !== slug) && (
          <button 
            onClick={handleResetFilters}
            className="flex items-center gap-1.5 text-xs text-white/50 hover:text-white transition-colors"
          >
            <RotateCcw className="w-3 h-3" /> Đặt lại
          </button>
        )}
      </div>

      {/* Thể loại */}
      <div className="flex flex-col gap-2">
        <span className="text-xs font-bold uppercase text-white/40 tracking-wider">Thể loại</span>
        <FilterDropdown
          label="Thể loại"
          options={GENRES}
          value={tempGenre}
          onChange={(val) => setTempGenre(val)}
        />
      </div>

      {/* Quốc gia */}
      <div className="flex flex-col gap-2">
        <span className="text-xs font-bold uppercase text-white/40 tracking-wider">Quốc gia</span>
        <FilterDropdown
          label="Quốc gia"
          options={COUNTRIES}
          value={tempCountry}
          onChange={(val) => setTempCountry(val)}
        />
      </div>

      {/* Năm phát hành */}
      <div className="flex flex-col gap-2">
        <span className="text-xs font-bold uppercase text-white/40 tracking-wider">Năm phát hành</span>
        <FilterDropdown
          label="Năm phát hành"
          options={YEARS}
          value={tempYear}
          onChange={(val) => setTempYear(val)}
        />
      </div>

      {/* Nút Tìm kiếm */}
      <button
        onClick={handleApplyFilters}
        className="w-full flex items-center justify-center gap-2 mt-4 px-4 py-3 rounded-2xl bg-gradient-to-r from-[#d070ff] to-[#7226FF] text-white text-sm font-bold shadow-lg shadow-purple-500/20 hover:brightness-110 active:scale-95 transition-all duration-200"
      >
        <Search className="w-4.5 h-4.5" /> Tìm kiếm
      </button>
    </div>
  );


  return (
    <main className="min-h-screen bg-[#0a0a0c] text-white selection:bg-[#F042FF]/30 pb-28">
      <Navbar />

      <div className="max-w-[1600px] mx-auto px-4 md:px-8 pt-6 md:pt-[120px]">
        {/* Tiêu đề danh mục */}
        <div className="mb-8 flex items-end justify-between border-b border-white/10 pb-4">
          <div>
            <h1 className="font-black tracking-widest text-white uppercase drop-shadow-md">
              {pageTitle.split('|')[0].trim()}
            </h1>
            {pagination ? (
              <p className="text-white/50 text-sm mt-2 font-medium">
                Tìm thấy {pagination.totalItems} bộ phim • Trang {currentPage} / {pagination.totalPages}
              </p>
            ) : (
               <p className="text-white/50 text-sm mt-2 font-medium">Đang tải dữ liệu...</p>
            )}
          </div>
        </div>

        {/* Lưới Phim + Sidebar */}
        <div className="flex flex-col lg:flex-row gap-8 items-start relative z-10">
          
          {/* Sidebar cho Desktop */}
          <aside className="hidden lg:block w-[280px] shrink-0 bg-white/[0.02] backdrop-blur-2xl border border-white/[0.08] rounded-3xl p-6 shadow-[0_24px_50px_-12px_rgba(0,0,0,0.6),inset_0_1px_1px_rgba(255,255,255,0.05)] sticky top-[100px] transition-all duration-300">
            <FilterBoxContent />
          </aside>

          {/* Lưới Phim bên phải */}
          <div className="flex-1 w-full">
            {/* Nút lọc cho Mobile */}
            <div className="lg:hidden mb-6 flex justify-between items-center bg-white/[0.02] backdrop-blur-2xl border border-white/[0.08] rounded-2xl p-4 shadow-lg">
              <span className="text-white/60 text-sm font-medium">Tìm kiếm chi tiết:</span>
              <button 
                onClick={() => setIsFilterDrawerOpen(true)}
                className="flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-[#d070ff] to-[#7226FF] rounded-xl text-sm font-bold shadow-lg active-scale"
              >
                <Filter className="w-4 h-4" /> Bộ lọc
              </button>
            </div>

            {/* Lưới hiển thị danh sách phim */}
            {isLoading ? (
              <div className="flex justify-center items-center h-[50vh]">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-cyan-500"></div>
              </div>
            ) : movies.length > 0 ? (
              <>
                <motion.div 
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-4 gap-4 md:gap-6 lg:gap-8"
                >
                  {movies.map((movie, index) => (
                    <div 
                      key={`${movie.id}-${index}`}
                      onClick={() => openModal(movie)}
                      onKeyDown={(e) => {
                        if (e.key === 'Enter' || e.key === ' ' || e.keyCode === 13) {
                          e.preventDefault();
                          openModal(movie);
                        }
                      }}
                      className="group flex flex-col cursor-pointer focus:outline-none transition-all duration-300"
                    >
                      <div className="relative w-full aspect-[2/3] md:aspect-video rounded-3xl overflow-hidden mb-3 border-2 border-white/15 group-focus:border-[#F042FF] group-focus:ring-4 group-focus:ring-[#F042FF]/40 group-focus:scale-105 transition-all duration-300 shadow-xl bg-black/40">
                        <Image 
                          src={movie.imageSrc} 
                          alt={movie.title} 
                          fill 
                          sizes="(max-width: 640px) 44vw, 20vw"
                          className="object-cover transition-transform duration-500 group-hover:scale-110 group-focus:scale-110" 
                          referrerPolicy="no-referrer"
                          priority={index < 6}
                        />
                        <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 group-focus:opacity-100 transition-opacity duration-300 flex items-center justify-center backdrop-blur-[2px]">
                          <div className="w-14 h-14 rounded-full bg-[#7226FF] flex items-center justify-center shadow-2xl transform scale-75 group-hover:scale-100 group-focus:scale-100 transition-transform duration-300">
                            <Play className="w-7 h-7 text-white fill-white ml-1" />
                          </div>
                        </div>
                      </div>
                      <h3 className="text-base md:text-lg font-black text-white/90 group-hover:text-white group-focus:text-white transition-colors line-clamp-1 leading-snug">
                        {movie.title}
                      </h3>
                    </div>
                  ))}
                </motion.div>

                {/* Điều hướng Phân trang */}
                {pagination && pagination.totalPages > 1 && (
                  <div className="mt-16 flex items-center justify-center gap-6">
                    <button 
                      onClick={() => handlePageChange(currentPage - 1)}
                      disabled={currentPage === 1}
                      className="w-12 h-12 rounded-full bg-white/10 hover:bg-white/20 disabled:opacity-30 disabled:hover:bg-white/10 border border-white/10 flex items-center justify-center transition-all group active-scale"
                    >
                      <ChevronLeft className="w-6 h-6 text-white group-hover:-translate-x-1 transition-transform" />
                    </button>
                    
                    <span className="text-lg font-bold text-white/80 bg-white/5 px-6 py-2 rounded-full border border-white/10 shadow-inner">
                      Trang {currentPage} <span className="text-white/40 font-normal">/ {pagination.totalPages}</span>
                    </span>

                    <button 
                      onClick={() => handlePageChange(currentPage + 1)}
                      disabled={currentPage === pagination.totalPages}
                      className="w-12 h-12 rounded-full bg-white/10 hover:bg-white/20 disabled:opacity-30 disabled:hover:bg-white/10 border border-white/10 flex items-center justify-center transition-all group active-scale"
                    >
                      <ChevronRight className="w-6 h-6 text-white group-hover:translate-x-1 transition-transform" />
                    </button>
                  </div>
                )}
              </>
            ) : (
              <div className="text-center text-white/50 mt-20">Không có phim nào khớp với bộ lọc của bạn.</div>
            )}
          </div>
        </div>
      </div>

      {/* Filter Drawer cho Mobile */}
      <AnimatePresence>
        {isFilterDrawerOpen && (
          <>
            {/* Backdrop */}
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 0.5 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsFilterDrawerOpen(false)}
              className="fixed inset-0 bg-black z-50 lg:hidden"
            />
            {/* Drawer Panel */}
            <motion.div 
              initial={{ x: '-100%' }}
              animate={{ x: 0 }}
              exit={{ x: '-100%' }}
              transition={{ type: 'tween', duration: 0.3 }}
              className="fixed top-0 left-0 bottom-0 w-[300px] bg-[#020024] border-r border-white/10 p-6 z-50 overflow-y-auto lg:hidden flex flex-col gap-6 shadow-2xl"
            >
              {/* Header */}
              <div className="flex justify-between items-center border-b border-white/10 pb-4">
                <div className="flex items-center gap-2 font-black tracking-widest text-sm uppercase text-cyan-400">
                  <Filter className="w-5 h-5" /> Bộ Lọc Phim
                </div>
                <button onClick={() => setIsFilterDrawerOpen(false)} className="w-8 h-8 rounded-full bg-white/5 hover:bg-white/10 flex items-center justify-center border border-white/10 active-scale">
                  <X className="w-4 h-4 text-white" />
                </button>
              </div>
              
              {/* Filter Content */}
              <div className="flex-1">
                <FilterBoxContent />
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </main>
  );
}

export default function GenrePage() {
  return (
    <Suspense fallback={<div className="min-h-screen bg-[#0a0a0c]" />}>
      <GenreContent />
    </Suspense>
  );
}