'use client';

import { useEffect, useState, Suspense } from 'react';
import { useParams, useSearchParams, useRouter } from 'next/navigation';
import Navbar from '@/components/Navbar';
import Image from 'next/image';
import Link from 'next/link';
import { getMoviesByCountryPaginated } from '@/lib/api'; // Dùng hàm mới
import { ChevronLeft, ChevronRight, Play } from 'lucide-react';
import { motion } from 'motion/react';

function CountryContent() {
  const params = useParams();
  const slug = params.slug as string;
  const searchParams = useSearchParams();
  const router = useRouter();

  const pageParam = searchParams.get('page');
  const currentPage = pageParam ? parseInt(pageParam, 10) : 1;

  const [movies, setMovies] = useState<any[]>([]);
  const [pagination, setPagination] = useState<any>(null);
  const [pageTitle, setPageTitle] = useState('Đang tải...');
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchMovies = async () => {
      setIsLoading(true);
      // Gọi API phim theo Quốc Gia
      const data = await getMoviesByCountryPaginated(slug, currentPage, 64);
      
      setMovies(data.items);
      setPagination(data.pagination);
      setPageTitle(data.title);
      setIsLoading(false);
      
      window.scrollTo({ top: 0, behavior: 'smooth' });
    };

    fetchMovies();
  }, [slug, currentPage]);

  const handlePageChange = (newPage: number) => {
    if (newPage < 1 || (pagination && newPage > pagination.totalPages)) return;
    router.push(`/quoc-gia/${slug}?page=${newPage}`);
  };

  return (
    <main className="min-h-screen bg-[#050505] text-white selection:bg-cyan-500/30 pb-20">
      <Navbar />

      <div className="max-w-[1800px] mx-auto px-4 md:px-8 pt-[120px]">
        {/* Tiêu đề danh mục */}
        <div className="mb-8 flex items-end justify-between border-b border-white/10 pb-4">
          <div>
            <h1 className="text-2xl md:text-3xl font-black tracking-widest text-white uppercase drop-shadow-md">
              {/* Vẫn giữ logic cắt chữ gọn gàng */}
              {pageTitle.split('|')[0].replace(/Phim /i, '').trim()}
            </h1>
            {pagination && (
              <p className="text-white/50 text-sm mt-2 font-medium">
                Tìm thấy {pagination.totalItems} bộ phim
              </p>
            )}
          </div>
        </div>

        {/* Lưới Phim */}
        {isLoading ? (
          <div className="flex justify-center items-center h-[50vh]">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-cyan-500"></div>
          </div>
        ) : movies.length > 0 ? (
          <>
            <motion.div 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-5 lg:grid-cols-6 xl:grid-cols-8 gap-4 md:gap-6"
            >
              {movies.map((movie, index) => (
                <Link 
                  href={`/phim/${movie.slug}`} 
                  key={`${movie.id}-${index}`}
                  className="group flex flex-col cursor-pointer"
                >
                  <div className="relative w-full aspect-[2/3] rounded-xl overflow-hidden mb-3 border border-white/10 shadow-lg bg-[#141414]">
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
                  <h3 className="text-xs md:text-sm font-bold text-white/90 group-hover:text-cyan-400 transition-colors line-clamp-2 leading-snug">
                    {movie.title}
                  </h3>
                </Link>
              ))}
            </motion.div>

            {pagination && pagination.totalPages > 1 && (
              <div className="mt-16 flex items-center justify-center gap-6">
                <button 
                  onClick={() => handlePageChange(currentPage - 1)}
                  disabled={currentPage === 1}
                  className="w-12 h-12 rounded-full bg-white/10 hover:bg-white/20 disabled:opacity-30 disabled:hover:bg-white/10 border border-white/10 flex items-center justify-center transition-all group"
                >
                  <ChevronLeft className="w-6 h-6 text-white group-hover:-translate-x-1 transition-transform" />
                </button>
                
                <span className="text-lg font-bold text-white/80 bg-[#141414] px-6 py-2 rounded-full border border-white/10 shadow-inner">
                  Trang {currentPage} <span className="text-white/40 font-normal">/ {pagination.totalPages}</span>
                </span>

                <button 
                  onClick={() => handlePageChange(currentPage + 1)}
                  disabled={currentPage === pagination.totalPages}
                  className="w-12 h-12 rounded-full bg-white/10 hover:bg-white/20 disabled:opacity-30 disabled:hover:bg-white/10 border border-white/10 flex items-center justify-center transition-all group"
                >
                  <ChevronRight className="w-6 h-6 text-white group-hover:translate-x-1 transition-transform" />
                </button>
              </div>
            )}
          </>
        ) : (
          <div className="text-center text-white/50 mt-20">Không có phim nào trong quốc gia này.</div>
        )}
      </div>
    </main>
  );
}

export default function CountryPage() {
  return (
    <Suspense fallback={<div className="min-h-screen bg-[#050505]" />}>
      <CountryContent />
    </Suspense>
  );
}