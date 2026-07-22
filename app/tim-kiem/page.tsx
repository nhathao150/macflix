'use client';

import { useEffect, useState, Suspense } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import Navbar from '@/components/layout/Navbar';
import Image from 'next/image';
import { useModal } from '@/context/ModalContext';
import { searchMoviesPaginated, searchMovies } from '@/lib/api';
import { ChevronLeft, ChevronRight, Play, Search } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

import { useTv } from '@/context/TvContext';

function SearchContent() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const { openModal } = useModal();
  const { isTvMode } = useTv();

  const keyword = searchParams.get('q') || '';
  const pageParam = searchParams.get('page');
  const currentPage = pageParam ? parseInt(pageParam, 10) : 1;

  const [movies, setMovies] = useState<any[]>([]);
  const [pagination, setPagination] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [searchInput, setSearchInput] = useState(keyword);
  
  // States cho gợi ý tìm kiếm (Autocomplete)
  const [suggestions, setSuggestions] = useState<any[]>([]);
  const [isSuggesting, setIsSuggesting] = useState(false);

  useEffect(() => {
    setSearchInput(keyword);
  }, [keyword]);

  // Lấy gợi ý khi gõ chữ (debounce 400ms)
  useEffect(() => {
    const delayDebounceFn = setTimeout(async () => {
      if (searchInput.trim()) {
        setIsSuggesting(true);
        const results = await searchMovies(searchInput);
        setSuggestions(results);
        setIsSuggesting(false);
      } else {
        setSuggestions([]);
      }
    }, 400);

    return () => clearTimeout(delayDebounceFn);
  }, [searchInput]);

  const handleSearchClick = () => {
    if (!searchInput.trim()) return;
    setSuggestions([]);
    router.push(`/tim-kiem?q=${encodeURIComponent(searchInput.trim())}`);
  };

  useEffect(() => {
    if (!keyword.trim()) return;
    const fetch = async () => {
      setIsLoading(true);
      const data = await searchMoviesPaginated(keyword, currentPage, 48);
      setMovies(data.items);
      setPagination(data.pagination);
      setIsLoading(false);
      window.scrollTo({ top: 0, behavior: 'smooth' });
    };
    fetch();
  }, [keyword, currentPage]);

  const handlePageChange = (newPage: number) => {
    if (newPage < 1 || (pagination && newPage > pagination.totalPages)) return;
    router.push(`/tim-kiem?q=${encodeURIComponent(keyword)}&page=${newPage}`);
  };

  return (
    <main className="min-h-screen bg-[#0a0a0c] text-white selection:bg-[#F042FF]/30 pb-24 relative overflow-hidden">
      {!isTvMode && <Navbar />}

      <div className={`w-full px-6 md:px-16 lg:px-24 relative z-10 flex flex-col gap-8 ${isTvMode ? 'pt-8 md:pt-12' : 'pt-4 md:pt-[100px]'}`}>

        {/* Header tìm kiếm căn giữa 100% ở trên cùng */}
        <div className="flex flex-col items-center justify-center text-center border-b border-white/10 pb-8 mb-6 w-full max-w-3xl mx-auto gap-6">
          <div className="flex items-center justify-center gap-4 text-center mx-auto">
            <Search className="w-10 h-10 text-[#F042FF] drop-shadow-[0_0_14px_rgba(240,66,255,0.8)]" />
            <h1 className="font-black text-3xl md:text-5xl text-white tracking-wide uppercase drop-shadow-2xl text-center">
              Tìm kiếm phim
            </h1>
          </div>
          
          {/* Hộp tìm kiếm khổ lớn nằm ngay chính giữa dưới tiêu đề */}
          <div className="relative w-full max-w-2xl z-[80] mx-auto">
            <div className="w-full flex items-center gap-3 bg-white/10 border-2 border-white/20 rounded-full px-6 py-3.5 focus-within:border-[#F042FF] focus-within:ring-4 focus-within:ring-[#F042FF]/40 backdrop-blur-md transition-all shadow-2xl">
              <input
                type="text"
                placeholder="Nhập tên phim cần tìm..."
                value={searchInput}
                onChange={(e) => setSearchInput(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && handleSearchClick()}
                className="bg-transparent border-none outline-none text-lg text-white w-full placeholder:text-white/40 font-bold"
              />
              <button 
                onClick={handleSearchClick}
                className="text-[#F042FF] hover:text-white transition-colors p-2 rounded-full focus:outline-none focus:ring-2 focus:ring-[#F042FF]"
              >
                <Search className="w-6 h-6" />
              </button>
            </div>

            {/* Hộp gợi ý Autocomplete */}
            {searchInput && suggestions.length > 0 && (
              <div className="absolute top-full left-0 right-0 mt-3 bg-[#141414]/95 backdrop-blur-2xl border-2 border-white/20 rounded-3xl shadow-2xl flex flex-col p-3 z-[90] overflow-hidden animate-in fade-in slide-in-from-top-2 duration-200">
                {isSuggesting ? (
                  <div className="p-4 flex justify-center items-center">
                    <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-[#F042FF]" />
                  </div>
                ) : (
                  <>
                    {suggestions.map((movie) => (
                      <div
                        key={movie.id}
                        onClick={() => {
                          setSuggestions([]);
                          router.push(`/phim/${movie.slug}`);
                        }}
                        className="flex items-center gap-4 p-3 hover:bg-white/10 rounded-2xl transition-colors group cursor-pointer"
                      >
                        <Image
                          src={movie.imageSrc || '/placeholder-image.jpg'}
                          alt={movie.title}
                          width={48}
                          height={68}
                          className="w-12 h-16 object-cover rounded-xl shadow-md group-hover:scale-105 transition-transform"
                          referrerPolicy="no-referrer"
                        />
                        <div className="flex flex-col text-left">
                          <span className="text-base font-bold text-white line-clamp-1">{movie.title}</span>
                          <span className="text-xs text-[#F042FF] uppercase font-black tracking-wider">Xem chi tiết</span>
                        </div>
                      </div>
                    ))}
                    <button
                      onClick={handleSearchClick}
                      className="mt-2 mx-1 mb-1 py-3 rounded-2xl text-sm font-black text-white text-center transition-opacity hover:opacity-85 flex items-center justify-center gap-2"
                      style={{ background: 'linear-gradient(135deg, #F042FF, #7226FF)' }}
                    >
                      <Search className="w-4 h-4" />
                      Xem tất cả kết quả cho &ldquo;{searchInput}&rdquo;
                    </button>
                  </>
                )}
              </div>
            )}
          </div>

          {keyword && (
            <div className="flex items-center justify-center gap-3 flex-wrap mx-auto">
              <span className="text-white/60 text-base font-medium">Từ khoá:</span>
              <span className="px-4 py-1 rounded-full text-base font-black text-white bg-[#7226FF]/40 border border-[#F042FF]/50 shadow-md">
                &ldquo;{keyword}&rdquo;
              </span>
              {pagination && (
                <span className="text-white/50 text-base font-medium">— {pagination.totalItems} kết quả</span>
              )}
            </div>
          )}
        </div>

        <AnimatePresence mode="wait">
          {!keyword.trim() ? (
            <motion.div
              key="empty-query"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="flex flex-col items-center justify-center h-[40vh] gap-4"
            >
              <Search className="w-16 h-16 text-white/10" />
              <p className="text-white/40 text-lg">Nhập từ khoá để tìm kiếm phim</p>
            </motion.div>
          ) : isLoading ? (
            <motion.div
              key="loading"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="flex justify-center items-center h-[50vh]"
            >
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#d070ff]" />
            </motion.div>
          ) : movies.length > 0 ? (
            <motion.div
              key={`${keyword}-${currentPage}`}
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.25 }}
            >
              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-4 md:gap-6 lg:gap-8">
                {movies.map((movie, index) => (
                  <div
                    key={`${movie.id}-${index}`}
                    tabIndex={0}
                    onClick={() => router.push(`/phim/${movie.slug}`)}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter' || e.key === ' ' || e.keyCode === 13) {
                        e.preventDefault();
                        router.push(`/phim/${movie.slug}`);
                      }
                    }}
                    className="group flex flex-col cursor-pointer focus:outline-none transition-all duration-300"
                  >
                    <div className="relative w-full aspect-[2/3] rounded-3xl overflow-hidden mb-3 border-2 border-white/15 group-focus:border-[#F042FF] group-focus:ring-4 group-focus:ring-[#F042FF]/40 group-focus:scale-105 transition-all duration-300 shadow-xl bg-black/40">
                      <Image
                        src={movie.imageSrc}
                        alt={movie.title}
                        fill
                        sizes="(max-width: 640px) 44vw, 20vw"
                        className="object-cover transition-transform duration-500 group-hover:scale-110 group-focus:scale-110"
                        referrerPolicy="no-referrer"
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
              </div>

              {/* Phân trang */}
              {pagination && pagination.totalPages > 1 && (
                <div className="mt-16 flex items-center justify-center gap-6">
                   <button
                    onClick={() => handlePageChange(currentPage - 1)}
                    disabled={currentPage === 1}
                    className="w-12 h-12 rounded-full bg-white/10 hover:bg-white/20 disabled:opacity-30 border border-white/10 flex items-center justify-center transition-all group active-scale"
                  >
                    <ChevronLeft className="w-6 h-6 text-white group-hover:-translate-x-1 transition-transform" />
                  </button>
                  <span className="text-lg font-bold text-white/80 px-6 py-2 rounded-full border border-white/10 bg-white/5">
                    Trang {currentPage} <span className="text-white/40 font-normal">/ {pagination.totalPages}</span>
                  </span>
                  <button
                    onClick={() => handlePageChange(currentPage + 1)}
                    disabled={currentPage === pagination.totalPages}
                    className="w-12 h-12 rounded-full bg-white/10 hover:bg-white/20 disabled:opacity-30 border border-white/10 flex items-center justify-center transition-all group active-scale"
                  >
                    <ChevronRight className="w-6 h-6 text-white group-hover:translate-x-1 transition-transform" />
                  </button>
                </div>
              )}
            </motion.div>
          ) : (
            <motion.div
              key="no-result"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="flex flex-col items-center justify-center h-[40vh] gap-4"
            >
              <Search className="w-16 h-16 text-white/10" />
              <p className="text-white/50 text-lg font-medium">Không tìm thấy kết quả nào cho &ldquo;{keyword}&rdquo;</p>
              <p className="text-white/30 text-sm">Thử tìm với từ khoá khác nhé</p>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </main>
  );
}

export default function SearchPage() {
  return (
    <Suspense fallback={<div className="min-h-screen bg-[#0a0a0c]" />}>
      <SearchContent />
    </Suspense>
  );
}
