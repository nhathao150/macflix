'use client';

import { useEffect, useState, Suspense } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import Navbar from '@/components/Navbar';
import Image from 'next/image';
import { useModal } from '@/context/ModalContext';
import { searchMoviesPaginated } from '@/lib/api';
import { ChevronLeft, ChevronRight, Play, Search } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

function SearchContent() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const { openModal } = useModal();

  const keyword = searchParams.get('q') || '';
  const pageParam = searchParams.get('page');
  const currentPage = pageParam ? parseInt(pageParam, 10) : 1;

  const [movies, setMovies] = useState<any[]>([]);
  const [pagination, setPagination] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(false);

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
    <main className="min-h-screen bg-[#010030] text-white selection:bg-[#F042FF]/30 pb-20">
      <Navbar />

      <div className="max-w-[1800px] mx-auto px-4 md:px-8 pt-[120px]">

        {/* Header */}
        <div className="mb-8 border-b border-white/10 pb-5">
          <div className="flex items-center gap-3">
            <Search className="w-6 h-6 text-[#d070ff]" />
            <h1 className="font-black text-2xl md:text-3xl text-white tracking-wide">
              Kết quả tìm kiếm
            </h1>
          </div>
          {keyword && (
            <div className="mt-2 flex items-center gap-2 flex-wrap">
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
              <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-5 lg:grid-cols-6 xl:grid-cols-8 gap-4 md:gap-6">
                {movies.map((movie, index) => (
                  <div
                    key={`${movie.id}-${index}`}
                    onClick={() => openModal(movie)}
                    className="group flex flex-col cursor-pointer"
                  >
                    <div className="relative w-full aspect-[2/3] rounded-xl overflow-hidden mb-3 border border-white/10 shadow-lg bg-white/5">
                      <Image
                        src={movie.imageSrc}
                        alt={movie.title}
                        fill
                        sizes="(max-width: 640px) 33vw, (max-width: 1024px) 20vw, 12vw"
                        className="object-cover transition-transform duration-500 group-hover:scale-110"
                        referrerPolicy="no-referrer"
                      />
                      <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-center justify-center backdrop-blur-[2px]">
                        <div className="w-12 h-12 rounded-full bg-white/20 backdrop-blur-md border border-white/40 flex items-center justify-center transform scale-75 group-hover:scale-100 transition-transform duration-300 shadow-2xl">
                          <Play className="w-5 h-5 text-white fill-white ml-1" />
                        </div>
                      </div>
                    </div>
                    <h3 className="text-xs font-semibold text-white/90 group-hover:text-white transition-colors line-clamp-2 leading-snug">
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
                    className="w-12 h-12 rounded-full bg-white/10 hover:bg-white/20 disabled:opacity-30 border border-white/10 flex items-center justify-center transition-all group"
                  >
                    <ChevronLeft className="w-6 h-6 text-white group-hover:-translate-x-1 transition-transform" />
                  </button>
                  <span className="text-lg font-bold text-white/80 px-6 py-2 rounded-full border border-white/10">
                    Trang {currentPage} <span className="text-white/40 font-normal">/ {pagination.totalPages}</span>
                  </span>
                  <button
                    onClick={() => handlePageChange(currentPage + 1)}
                    disabled={currentPage === pagination.totalPages}
                    className="w-12 h-12 rounded-full bg-white/10 hover:bg-white/20 disabled:opacity-30 border border-white/10 flex items-center justify-center transition-all group"
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
    <Suspense fallback={<div className="min-h-screen bg-[#010030]" />}>
      <SearchContent />
    </Suspense>
  );
}
