'use client';

import { useEffect, useState, Suspense } from 'react';
import { useParams, useSearchParams, useRouter } from 'next/navigation';
import Navbar from '@/components/Navbar';
import Image from 'next/image';
import { useModal } from '@/context/ModalContext';
import { getMoviesByCountryPaginated, getMoviesByCountryAndGenre } from '@/lib/api';
import { ChevronLeft, ChevronRight, Play } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

const GENRES = [
  { name: 'Tất cả', slug: '' },
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
  { name: 'Âm Nhạc', slug: 'am-nhac' },
  { name: 'Học Đường', slug: 'hoc-duong' },
  { name: 'Võ Thuật', slug: 'vo-thuat' },
  { name: 'Bí ẩn', slug: 'bi-an' },
  { name: 'Tài Liệu', slug: 'tai-lieu' },
  { name: 'Phim 18+', slug: 'phim-18' },
];

function CountryContent() {
  const params = useParams();
  const slug = params.slug as string;
  const searchParams = useSearchParams();
  const router = useRouter();
  const { openModal } = useModal();

  const pageParam = searchParams.get('page');
  const genreParam = searchParams.get('genre') || '';
  const currentPage = pageParam ? parseInt(pageParam, 10) : 1;
  const [selectedGenre, setSelectedGenre] = useState(genreParam);

  const [movies, setMovies] = useState<any[]>([]);
  const [pagination, setPagination] = useState<any>(null);
  const [pageTitle, setPageTitle] = useState('Đang tải...');
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    setSelectedGenre(genreParam);
  }, [genreParam]);

  useEffect(() => {
    const fetchMovies = async () => {
      setIsLoading(true);
      let data;
      if (selectedGenre) {
        data = await getMoviesByCountryAndGenre(slug, selectedGenre, currentPage, 48);
      } else {
        data = await getMoviesByCountryPaginated(slug, currentPage, 48);
      }
      setMovies(data.items);
      setPagination(data.pagination);
      if (data.title) setPageTitle(data.title.split('|')[0].trim());
      setIsLoading(false);
      window.scrollTo({ top: 0, behavior: 'smooth' });
    };
    fetchMovies();
  }, [slug, currentPage, selectedGenre]);

  const handleGenreSelect = (genreSlug: string) => {
    setSelectedGenre(genreSlug);
    const query = genreSlug ? `?genre=${genreSlug}&page=1` : `?page=1`;
    router.push(`/quoc-gia/${slug}${query}`);
  };

  const handlePageChange = (newPage: number) => {
    if (newPage < 1 || (pagination && newPage > pagination.totalPages)) return;
    const genreQuery = selectedGenre ? `&genre=${selectedGenre}` : '';
    router.push(`/quoc-gia/${slug}?page=${newPage}${genreQuery}`);
  };

  const activeGenreName = GENRES.find(g => g.slug === selectedGenre)?.name || 'Tất cả';

  return (
    <main className="min-h-screen bg-[#010030] text-white selection:bg-[#F042FF]/30 pb-20">
      <Navbar />

      <div className="max-w-[1800px] mx-auto px-4 md:px-8 pt-[120px]">

        {/* Tiêu đề */}
        <div className="mb-6 border-b border-white/10 pb-4">
          <h1 className="font-black tracking-widest text-white uppercase drop-shadow-md text-2xl md:text-3xl">
            {pageTitle || 'Đang tải...'}
          </h1>
          <div className="flex items-center gap-2 mt-1">
            {pagination && (
              <p className="text-white/50 text-sm font-medium">
                {pagination.totalItems} bộ phim
              </p>
            )}
            {selectedGenre && (
              <>
                <span className="text-white/30">•</span>
                <span className="text-sm font-semibold text-[#d070ff]">
                  {activeGenreName}
                </span>
              </>
            )}
          </div>
        </div>

        {/* Thanh lọc thể loại */}
        <div className="mb-8 overflow-x-auto pb-2 -mx-4 px-4 scrollbar-none">
          <div className="flex gap-2 w-max">
            {GENRES.map((genre) => {
              const isActive = selectedGenre === genre.slug;
              return (
                <button
                  key={genre.slug}
                  onClick={() => handleGenreSelect(genre.slug)}
                  className={`
                    relative px-4 py-1.5 rounded-full text-sm font-semibold whitespace-nowrap
                    transition-all duration-200 border
                    ${isActive
                      ? 'text-white border-transparent shadow-lg shadow-purple-500/30'
                      : 'text-white/60 border-white/10 hover:text-white hover:border-white/30 bg-white/5'
                    }
                  `}
                  style={isActive ? {
                    background: 'linear-gradient(135deg, #d070ff, #7226FF)',
                  } : {}}
                >
                  {genre.name}
                </button>
              );
            })}
          </div>
        </div>

        {/* Lưới Phim */}
        <AnimatePresence mode="wait">
          {isLoading ? (
            <motion.div
              key="loading"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="flex justify-center items-center h-[50vh]"
            >
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#d070ff]"></div>
            </motion.div>
          ) : movies.length > 0 ? (
            <motion.div
              key={`${selectedGenre}-${currentPage}`}
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
                    <div className="relative w-full aspect-[2/3] rounded-xl overflow-hidden mb-3 border border-white/10 shadow-lg bg-[#160078]/20">
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
                    className="w-12 h-12 rounded-full bg-white/10 hover:bg-white/20 disabled:opacity-30 disabled:hover:bg-white/10 border border-white/10 flex items-center justify-center transition-all group"
                  >
                    <ChevronLeft className="w-6 h-6 text-white group-hover:-translate-x-1 transition-transform" />
                  </button>

                  <span className="text-lg font-bold text-white/80 px-6 py-2 rounded-full border border-white/10 shadow-inner">
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
            </motion.div>
          ) : (
            <motion.div
              key="empty"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="text-center text-white/50 mt-20"
            >
              Không có phim nào trong danh mục này.
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </main>
  );
}

export default function CountryPage() {
  return (
    <Suspense fallback={<div className="min-h-screen bg-[#010030]" />}>
      <CountryContent />
    </Suspense>
  );
}