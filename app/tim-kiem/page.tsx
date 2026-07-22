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

      <div className={`max-w-[1600px] mx-auto px-4 md:px-12 relative z-10 flex flex-col gap-8 ${isTvMode ? 'pt-8 md:pt-12' : 'pt-4 md:pt-[100px]'}`}>

        {/* Header */}
        <div className="mb-4 border-b border-white/10 pb-5">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <Search className="w-8 h-8 text-[#F042FF]" />
              <h1 className="font-black text-2xl md:text-4xl text-white tracking-wide uppercase drop-shadow-md">
                Tìm kiếm phim
              </h1>
            </div>
            
            {/* Hộp tìm kiếm ngay trên trang */}
            <div className="relative w-full md:max-w-md z-[80]">
              <div className="w-full flex items-center gap-2 bg-white/5 border border-white/10 rounded-full px-4 py-2 focus-within:ring-2 focus-within:ring-[#d070ff]/50 transition-all">
                <input
                  type="text"
                  placeholder="Nhập tên phim cần tìm..."
                  value={searchInput}
                  onChange={(e) => setSearchInput(e.target.value)}
                  onKeyDown={(e) => e.key === 'Enter' && handleSearchClick()}
                  className="bg-transparent border-none outline-none text-sm text-white w-full placeholder:text-white/40"
                />
                <button 
                  onClick={handleSearchClick}
                  className="text-[#d070ff] hover:text-[#7226FF] transition-colors p-1"
                >
                  <Search className="w-4 h-4" />
                </button>
              </div>

              {/* Hộp gợi ý Autocomplete */}
              {searchInput && suggestions.length > 0 && (
                <div className="absolute top-full left-0 right-0 mt-2 bg-[#141414]/95 backdrop-blur-xl border border-white/10 rounded-2xl shadow-2xl flex flex-col p-2 z-[90] overflow-hidden animate-in fade-in slide-in-from-top-2 duration-200">
                  {isSuggesting ? (
                    <div className="p-4 flex justify-center items-center">
                      <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-[#d070ff]" />
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
                          className="flex items-center gap-3 p-2 hover:bg-white/10 rounded-xl transition-colors group cursor-pointer"
                        >
                          <Image
                            src={movie.imageSrc || '/placeholder-image.jpg'}
                            alt={movie.title}
                            width={40}
                            height={56}
                            className="w-10 h-14 object-cover rounded-md shadow-sm group-hover:scale-105 transition-transform"
                            referrerPolicy="no-referrer"
                          />
                          <div className="flex flex-col">
                            <span className="text-sm font-bold text-white line-clamp-1">{movie.title}</span>
                            <span className="text-[10px] text-white/50 uppercase font-bold tracking-wider">Xem chi tiết</span>
                          </div>
                        </div>
                      ))}
                      <button
                        onClick={handleSearchClick}
                        className="mt-1 mx-1 mb-1 py-2 rounded-xl text-xs font-bold text-white text-center transition-opacity hover:opacity-85 flex items-center justify-center gap-2"
                        style={{ background: 'linear-gradient(135deg, #d070ff, #7226FF)' }}
                      >
                        <Search className="w-3.5 h-3.5" />
                        Xem tất cả kết quả cho &ldquo;{searchInput}&rdquo;
                      </button>
                    </>
                  )}
                </div>
              )}
            </div>
          </div>
          {keyword && (
            <div className="mt-4 flex items-center gap-2 flex-wrap">
              <span className="text-white/50 text-sm">Từ khoá:</span>
              <span className="px-3 py-0.5 rounded-full text-sm font-bold text-white"
                style={{ background: 'linear-gradient(135deg, #d070ff44, #7226FF44)', border: '1px solid #d070ff55' }}>
                &ldquo;{keyword}&rdquo;
              </span>
              {pagination && (
                <span className="text-white/40 text-sm">— {pagination.totalItems} kết quả</span>
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
