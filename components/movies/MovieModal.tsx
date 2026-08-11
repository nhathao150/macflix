'use client';

import { useEffect, useState, useCallback } from 'react';
import { X, Play } from 'lucide-react';
import Image from 'next/image';
import { motion, AnimatePresence } from 'motion/react';
import { getMovieDetails } from '@/lib/api';
import { useRouter } from 'next/navigation';
import FavoriteButton from '@/components/ui/FavoriteButton';
import CastCard, { usePeoplesData } from '@/components/movies/CastCard';
import { Movie, MovieDetails } from '@/types';
import { useBodyScrollLock } from '@/hooks/useBodyScrollLock';

interface MovieModalProps {
  isOpen: boolean;
  onClose: () => void;
  movie: Movie | null;
}

export default function MovieModal({ isOpen, onClose, movie }: MovieModalProps) {
  const router = useRouter();

  const [movieDetails, setMovieDetails] = useState<MovieDetails | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  // Lấy danh sách diễn viên + ảnh từ ophim peoples API
  const movieSlug = movieDetails?.movie?.slug || movie?.slug;
  const { peoples, photoBaseUrl } = usePeoplesData(movieSlug);

  // Sử dụng Custom Hook để khoá cuộn trang (scroll lock) khi Modal mở
  useBodyScrollLock(isOpen);

  useEffect(() => {
    let isMounted = true;

    const fetchMovieData = async () => {
      if (isOpen && movie?.slug) {
        setIsLoading(true);
        try {
          const data = await getMovieDetails(movie.slug);
          if (isMounted) setMovieDetails(data);
        } catch (error) {
          console.error("Lỗi lấy chi tiết phim:", error);
        } finally {
          if (isMounted) setIsLoading(false);
        }
      } else {
        if (isMounted) setMovieDetails(null);
      }
    };

    fetchMovieData();

    return () => {
      isMounted = false;
    };
  }, [isOpen, movie]);

  const handleWatchMovie = useCallback(() => {
    const slug = movieDetails?.movie?.slug || movie?.slug;
    if (slug) {
      onClose();
      router.push(`/phim/${slug}`);
    }
  }, [movieDetails, movie, onClose, router]);

  if (!isOpen) return null;

  const movieData = movieDetails?.movie;
  const backdropUrl = movieData?.poster_url
    ? (movieData.poster_url.startsWith('http') ? movieData.poster_url : `https://phimimg.com/${movieData.poster_url}`)
    : movie?.imageSrc;

  const episodesList = movieDetails?.episodes?.[0]?.server_data || [];
  const hasLinkMovie = episodesList.length > 0;

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-[100] flex items-center justify-center p-2 sm:p-4 md:p-6"
        >
          <div className="absolute inset-0 bg-[#050505]/85 backdrop-blur-lg" onClick={onClose} />

          {/* KHUNG MODAL TỰ ĐỘNG THÍCH ỨNG: MOBILE (full/w-[96vw]), DESKTOP & TV (w-[96vw] max-w-[1800px] h-[94vh]) */}
          <motion.div
            data-modal-container
            initial={{ scale: 0.95, y: 20 }}
            animate={{ scale: 1, y: 0 }}
            exit={{ scale: 0.95, y: 20 }}
            className="relative w-[96vw] max-w-[1800px] h-[94vh] bg-[#141414] border border-white/15 rounded-2xl md:rounded-3xl shadow-[0_30px_90px_rgba(0,0,0,0.9)] flex flex-col overflow-hidden"
          >
            {/* NÚT ĐÓNG MODAL (Responsive cho Mobile & TV) */}
            <button
              onClick={onClose}
              className="absolute top-4 right-4 md:top-6 md:right-6 z-50 w-10 h-10 md:w-14 md:h-14 rounded-full bg-black/60 hover:bg-black/90 focus:bg-black/90 focus:scale-105 focus:ring-4 focus:ring-[#F042FF] focus:outline-none backdrop-blur-md border border-white/20 flex items-center justify-center transition-all cursor-pointer shadow-2xl"
            >
              <X className="w-5 h-5 md:w-8 md:h-8 text-white" />
            </button>

            {isLoading ? (
              <div className="flex-1 flex items-center justify-center text-white">
                <div className="animate-spin rounded-full h-12 w-12 md:h-16 md:w-16 border-b-2 border-[#F042FF]"></div>
              </div>
            ) : (
              <div className="flex-1 overflow-y-auto scrollbar-hide pb-16 md:pb-20">

                {/* --- 1. BANNER: MOBILE (h-[45vh] min-h-[280px]), DESKTOP/TV (h-[75vh] min-h-[660px] max-h-[850px]) --- */}
                <div className="relative w-full h-[45vh] md:h-[75vh] min-h-[280px] md:min-h-[660px] max-h-[850px] bg-black overflow-hidden">
                  {backdropUrl && (
                    <Image
                      src={backdropUrl}
                      alt={movieData?.name || ''}
                      fill
                      className="object-cover opacity-70 mask-image-gradient"
                      referrerPolicy="no-referrer"
                      priority
                    />
                  )}
                  <div className="absolute inset-0 bg-gradient-to-t from-[#141414] via-[#141414]/35 to-transparent" />
                  <div className="absolute inset-0 bg-gradient-to-r from-[#141414] via-[#141414]/75 to-transparent w-full md:w-[70%]" />

                  {/* THÔNG TIN TIÊU ĐỀ + NÚT PHÁT NGAY & ICON YÊU THÍCH */}
                  <div className="absolute bottom-6 left-5 md:left-16 right-5 md:right-16 z-20 flex flex-col items-start gap-4 md:gap-6 max-w-5xl">
                    <div>
                      <h1 className="text-2xl sm:text-4xl md:text-6xl lg:text-7xl font-black tracking-tight text-white mb-1.5 md:mb-3 drop-shadow-2xl uppercase line-clamp-2 leading-tight">
                        {movieData?.name || movie?.title}
                      </h1>
                      {movieData?.origin_name && (
                        <p className="text-white/80 text-sm md:text-2xl font-bold drop-shadow-md line-clamp-1">
                          Tên gốc: {movieData.origin_name}
                        </p>
                      )}
                    </div>

                    {/* HÀNG NÚT BẤM BANNER */}
                    <div className="flex items-center gap-3 md:gap-6 mt-1 md:mt-2">
                      <button
                        tabIndex={0}
                        onClick={hasLinkMovie ? handleWatchMovie : undefined}
                        className={`flex items-center gap-2.5 md:gap-4 bg-[#7226FF] hover:bg-[#853aff] text-white px-6 md:px-12 py-2.5 md:py-4.5 rounded-xl md:rounded-2xl font-black text-base md:text-2xl border-2 border-transparent transition-all shadow-2xl focus:outline-none focus:scale-105 focus:border-[#F042FF] focus:ring-4 focus:ring-[#F042FF]/40 ${
                          hasLinkMovie ? 'cursor-pointer' : 'opacity-50 cursor-not-allowed'
                        }`}
                      >
                        <Play className="w-5 h-5 md:w-8 md:h-8 fill-current" />
                        <span>{hasLinkMovie ? 'Phát Ngay' : 'Chưa Có Link'}</span>
                      </button>

                      {/* ICON YÊU THÍCH */}
                      {movieData && (
                        <FavoriteButton
                          movieData={{
                            slug: movieData.slug,
                            name: movieData.name,
                            imageSrc: backdropUrl || ""
                          }}
                        />
                      )}
                    </div>
                  </div>
                </div>

                <div className="px-5 md:px-16 relative z-10 space-y-10 md:space-y-16 mt-6 md:mt-12">

                  {/* --- 2. DIỄN VIÊN & ĐOÀN LÀM PHIM --- */}
                  <div className="space-y-4 md:space-y-6">
                    <div className="text-white font-black text-xl md:text-4xl">
                      Diễn Viên &amp; Đoàn Làm Phim
                    </div>
                    <div className="flex gap-4 md:gap-8 overflow-x-auto scrollbar-hide pb-2 md:pb-4">
                      {peoples.length > 0 ? (
                        peoples.map((person, idx) => (
                          <CastCard
                            key={idx}
                            name={person.name}
                            role={person.known_for_department === 'Directing' ? 'Đạo diễn' : 'Diễn viên'}
                            colorIndex={idx}
                            variant="circle"
                            photoUrl={person.profile_path ? `${photoBaseUrl}${person.profile_path}` : undefined}
                          />
                        ))
                      ) : (
                        [...(movieData?.director || []), ...(movieData?.actor || [])]
                          .filter(name => name && name !== 'Đang cập nhật')
                          .map((name, idx) => (
                            <CastCard
                              key={idx}
                              name={name}
                              role={movieData?.director?.includes(name) ? 'Đạo diễn' : 'Diễn viên'}
                              colorIndex={idx}
                              variant="circle"
                            />
                          ))
                      )}
                      {peoples.length === 0 && (!movieData?.actor || movieData?.actor[0] === 'Đang cập nhật') && (
                        <p className="text-sm md:text-xl text-white/50">Đang cập nhật dữ liệu diễn viên...</p>
                      )}
                    </div>
                  </div>

                  {/* --- 3. GIỚI THIỆU NỘI DUNG PHIM --- */}
                  <div className="space-y-4 md:space-y-6">
                    <div className="flex items-center gap-1 text-white font-black text-xl md:text-4xl">
                      Giới thiệu
                    </div>
                    <div className="bg-[#1c1c1e] border border-white/10 p-5 md:p-12 rounded-2xl md:rounded-3xl shadow-xl">
                      <h4 className="text-lg md:text-3xl font-black text-white mb-2 uppercase">{movieData?.name}</h4>
                      <p className="text-xs md:text-lg text-[#F042FF] uppercase tracking-widest font-black mb-4 md:mb-6">
                        {movieData?.category?.map((c: { name: string }) => c.name).join(', ')}
                      </p>
                      <div
                        className="text-white/90 text-sm md:text-2xl leading-relaxed prose prose-invert max-w-none font-medium"
                        dangerouslySetInnerHTML={{
                          __html: (movieData?.content || 'Đang cập nhật nội dung...')
                            .replace(/<script[\s\S]*?<\/script>/gi, '')
                            .replace(/on\w+\s*=\s*"[^"]*"/gi, '')
                            .replace(/on\w+\s*=\s*'[^']*'/gi, '')
                            .replace(/javascript:/gi, '')
                        }}
                      />
                    </div>
                  </div>

                  {/* --- 4. THÔNG TIN CHI TIẾT (LƯỚI 3 CỘT RESPONSIVE) --- */}
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-8 md:gap-12 border-t border-white/10 pt-8 md:pt-12">
                    <div>
                      <h3 className="text-lg md:text-3xl font-black mb-4 md:mb-6 text-white">Thông tin</h3>
                      <ul className="space-y-4 md:space-y-6 text-sm md:text-xl">
                        <li>
                          <span className="text-white/50 block text-xs font-bold uppercase mb-1">Năm phát hành</span>
                          <span className="text-white/90 font-bold">{movieData?.year || '2024'}</span>
                        </li>
                        <li>
                          <span className="text-white/50 block text-xs font-bold uppercase mb-1">Thời lượng</span>
                          <span className="text-white/90 font-bold">{movieData?.time || 'Đang cập nhật'}</span>
                        </li>
                        <li>
                          <span className="text-white/50 block text-xs font-bold uppercase mb-1">Được xếp hạng</span>
                          <span className="border border-white/20 px-3 py-1 rounded-lg text-xs md:text-sm text-white font-black bg-[#7226FF]">{movieData?.quality || 'FHD'}</span>
                        </li>
                        <li>
                          <span className="text-white/50 block text-xs font-bold uppercase mb-1">Nơi sản xuất</span>
                          <span className="text-white/90 font-bold">{movieData?.country?.[0]?.name || 'Đang cập nhật'}</span>
                        </li>
                      </ul>
                    </div>

                    <div>
                      <h3 className="text-lg md:text-3xl font-black mb-4 md:mb-6 text-white">Ngôn ngữ</h3>
                      <ul className="space-y-4 md:space-y-6 text-sm md:text-xl">
                        <li>
                          <span className="text-white/50 block text-xs font-bold uppercase mb-1">Âm thanh gốc</span>
                          <span className="text-white/90 font-bold">Tiếng {movieData?.country?.[0]?.name || 'Bản địa'} (Stereo, Dolby Atmos)</span>
                        </li>
                        <li>
                          <span className="text-white/50 block text-xs font-bold uppercase mb-1">Phụ đề &amp; Lồng tiếng</span>
                          <span className="text-white/90 font-bold line-clamp-2">Tiếng Việt (Vietsub), {movieData?.lang || 'Đang cập nhật'}</span>
                        </li>
                      </ul>
                    </div>

                    <div>
                      <h3 className="text-lg md:text-3xl font-black mb-4 md:mb-6 text-white">Trợ năng</h3>
                      <div className="flex gap-3 md:gap-4 items-start">
                        <span className="border border-white/20 rounded px-2.5 py-1 text-xs md:text-sm font-black text-white shrink-0 mt-0.5 bg-white/10">CC</span>
                        <p className="text-xs md:text-base text-white/60 leading-relaxed font-medium">
                          Phụ đề cho người khiếm thính (SDH) là phụ đề bằng ngôn ngữ gốc, được bổ sung các thông tin liên quan không phải lời thoại.
                        </p>
                      </div>
                    </div>
                  </div>

                </div>
              </div>
            )}
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}