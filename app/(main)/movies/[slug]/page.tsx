'use client';

import { useEffect, useState, useRef } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Navbar from '@/components/layout/Navbar';
import { getMovieDetails, getMoviesByGenre, searchMoviesPaginated } from '@/services/movie.service';
import { ListVideo, CircleAlert, MoreHorizontal, ChevronUp, Mic2, ChevronLeft, ChevronRight, Heart, Film, Play } from 'lucide-react'; 
import Link from 'next/link';
import Image from 'next/image';
import { useSession } from 'next-auth/react';
import { MovieDetails, Movie } from '@/types';
import CastCard, { useTmdbActorPhotos } from '@/components/movies/CastCard';
import VideoPlayer from '@/components/movies/VideoPlayer';

const EPISODES_PER_GROUP = 100;
const INITIAL_VISIBLE_EPISODES = 24; 

export default function MovieDetailPage() {
  const params = useParams();
  const slug = params.slug as string;
  const { data: session } = useSession();

  const [movieDetails, setMovieDetails] = useState<MovieDetails | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [relatedMovies, setRelatedMovies] = useState<Movie[]>([]);

  const relatedScrollRef = useRef<HTMLDivElement>(null);
  
  const scrollRelated = (direction: 'left' | 'right') => {
    if (relatedScrollRef.current) {
      const scrollAmount = direction === 'left' ? -800 : 800; // Cuộn xa hơn trên Desktop
      relatedScrollRef.current.scrollBy({ left: scrollAmount, behavior: 'smooth' });
    }
  };
  const router = useRouter();

  const actorPhotoMap = useTmdbActorPhotos(slug);
  
  const [activeServerIndex, setActiveServerIndex] = useState(0);
  const [currentEpisodeIndex, setCurrentEpisodeIndex] = useState(0);
  
  const [activeGroupIndex, setActiveGroupIndex] = useState(0);
  const [isExpanded, setIsExpanded] = useState(false);
  
  const [hasLoadedHistory, setHasLoadedHistory] = useState(false);
  const [isFavorited, setIsFavorited] = useState(false);
  
  const tabContainerRef = useRef<HTMLDivElement>(null);

  // 1. FETCH DỮ LIỆU PHIM
  useEffect(() => {
    const fetchMovie = async () => {
      if (!slug) return;
      setIsLoading(true);
      try {
        const data = await getMovieDetails(slug);
        setMovieDetails(data);
      } catch (error) {
        console.error("Lỗi lấy dữ liệu phim:", error);
      } finally {
        setIsLoading(false);
      }
    };
    fetchMovie();
  }, [slug]);

  const servers = movieDetails?.episodes || [];
  const currentServer = servers[activeServerIndex] || {};
  const episodesList = currentServer.server_data || [];
  
  const currentEpisode = episodesList[currentEpisodeIndex];
  const hasLinkMovie = episodesList.length > 0;
  const hasNextEpisode = currentEpisodeIndex < episodesList.length - 1;

  const episodeGroups = [];
  for (let i = 0; i < episodesList.length; i += EPISODES_PER_GROUP) {
    episodeGroups.push(episodesList.slice(i, i + EPISODES_PER_GROUP));
  }

  // 2. ĐỌC LỊCH SỬ TỪ MONGODB
  useEffect(() => {
    if (!movieDetails || hasLoadedHistory) return;
    const userEmail = session?.user?.email;

    if (!userEmail) {
      setHasLoadedHistory(true);
      return;
    }

    const fetchUserHistory = async () => {
      try {
        const res = await fetch(`/api/history?email=${userEmail}`);
        const data = await res.json();
        
        if (res.ok && data.history) {
          const previousWatch = data.history.find((item: { slug: string, serverIndex?: number, episodeIndex?: number }) => item.slug === slug);
          if (previousWatch) {
            setActiveServerIndex(previousWatch.serverIndex || 0);
            setCurrentEpisodeIndex(previousWatch.episodeIndex || 0);
            const correctGroupIndex = Math.floor((previousWatch.episodeIndex || 0) / EPISODES_PER_GROUP);
            if (!isNaN(correctGroupIndex)) setActiveGroupIndex(correctGroupIndex);
          }
        }
      } catch (error) {
        console.error("Lỗi đọc lịch sử:", error);
      } finally {
        setHasLoadedHistory(true);
      }
    };

    fetchUserHistory();
  }, [session, movieDetails, hasLoadedHistory, slug]);

  // 3. KIỂM TRA PHIM YÊU THÍCH
  useEffect(() => {
    const userEmail = session?.user?.email;
    if (!userEmail || !slug) return;

    const checkFavorite = async () => {
      try {
        const res = await fetch(`/api/favorites?email=${userEmail}`);
        const data = await res.json();
        if (res.ok && data.favorites) {
          const isFav = data.favorites.some((item: { slug: string }) => item.slug === slug);
          setIsFavorited(isFav);
        }
      } catch (error) {
        console.error("Lỗi check phim yêu thích:", error);
      }
    };
    checkFavorite();
  }, [session, slug]);

  // 4. LƯU LỊCH SỬ NGẦM
  useEffect(() => {
    const userEmail = session?.user?.email;
    if (!userEmail || !movieDetails?.movie || !hasLinkMovie || !hasLoadedHistory) return;

    const syncHistoryToDB = async () => {
      const currentEpName = episodesList[currentEpisodeIndex]?.name || '';
      const movieInfo = movieDetails?.movie;
      if (!movieInfo) return;

      const bannerUrl = movieInfo.thumb_url?.startsWith('http') 
          ? movieInfo.thumb_url 
          : (movieInfo.poster_url?.startsWith('http') ? movieInfo.poster_url : `https://phimimg.com/${movieInfo.poster_url}`);

      const movieData = {
        slug: slug,
        name: movieInfo.name,
        episodeName: currentEpName,
        episodeIndex: currentEpisodeIndex,
        serverIndex: activeServerIndex,
        imageSrc: bannerUrl,
      };

      try {
        await fetch('/api/history', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ email: userEmail, movieData })
        });
      } catch (error) {
        console.error("Lỗi đồng bộ lịch sử:", error);
      }
    };

    const timeoutId = setTimeout(() => { syncHistoryToDB(); }, 5000);
    return () => clearTimeout(timeoutId);
  }, [movieDetails, currentEpisodeIndex, activeServerIndex, session, hasLoadedHistory, hasLinkMovie, episodesList, slug]);

  // 5. NÚT TRÁI TIM
  const handleToggleFavorite = async () => {
    const userEmail = session?.user?.email;
    if (!userEmail) {
      alert("Vui lòng đăng nhập để thêm phim vào danh sách Yêu thích!");
      return;
    }
    setIsFavorited(!isFavorited);

    const movieInfo = movieDetails?.movie;
    if (!movieInfo) return;

    const bannerUrl = movieInfo.thumb_url?.startsWith('http') 
        ? movieInfo.thumb_url 
        : (movieInfo.poster_url?.startsWith('http') ? movieInfo.poster_url : `https://phimimg.com/${movieInfo.poster_url}`);

    const movieData = {
      slug: slug,
      name: movieInfo.name,
      imageSrc: bannerUrl,
    };

    try {
      const res = await fetch('/api/favorites', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: userEmail, movieData })
      });
      const data = await res.json();
      if (res.ok) setIsFavorited(data.isFavorited);
    } catch (error) {
      console.error("Lỗi bấm yêu thích:", error);
      setIsFavorited(!isFavorited);
    }
  };

  // 6. CHUYỂN NHÓM TẬP TỰ ĐỘNG KHI CHUYỂN TẬP
  const prevEpisodeIndexRef = useRef(currentEpisodeIndex);
  useEffect(() => {
    if (prevEpisodeIndexRef.current !== currentEpisodeIndex) {
      prevEpisodeIndexRef.current = currentEpisodeIndex;
      const correctGroupIndex = Math.floor(currentEpisodeIndex / EPISODES_PER_GROUP);
      if (!isNaN(correctGroupIndex)) {
        setActiveGroupIndex(correctGroupIndex);
      }
    }
  }, [currentEpisodeIndex]);

  // FETCH PHIM LIÊN QUAN
  useEffect(() => {
    if (!movieDetails?.movie) return;

    const fetchSmartRelated = async () => {
      const movieName = movieDetails.movie.name || '';
      const originName = movieDetails.movie.origin_name || '';

      const stripSeriesNumber = (name: string) =>
        name
          .replace(/\s*:.*$/, '')
          .replace(/\s*([-–]?\s*(phần|season|part|movie|film|tập|ep|episode|mùa)\s*\d+)$/gi, '')
          .replace(/\s+\d+$/, '')
          .trim();

      const seriesKeywordEn = stripSeriesNumber(originName);
      const seriesKeywordVi = stripSeriesNumber(movieName);
      const TOTAL_SLOTS = 12;

      let seriesMovies: Movie[] = [];
      try {
        const searches = await Promise.allSettled([
          seriesKeywordEn.length >= 2
            ? searchMoviesPaginated(seriesKeywordEn, 1, 20)
            : Promise.resolve({ items: [] }),
          seriesKeywordVi.length >= 2 && seriesKeywordVi.toLowerCase() !== seriesKeywordEn.toLowerCase()
            ? searchMoviesPaginated(seriesKeywordVi, 1, 20)
            : Promise.resolve({ items: [] }),
        ]);

        const seen = new Set<string>([slug]);
        for (const result of searches) {
          if (result.status === 'fulfilled') {
            for (const m of result.value.items as Movie[]) {
              if (!seen.has(m.slug)) {
                seen.add(m.slug);
                seriesMovies.push(m);
              }
            }
          }
        }
        seriesMovies = seriesMovies.slice(0, TOTAL_SLOTS);
      } catch {
        seriesMovies = [];
      }

      let combined = [...seriesMovies];
      if (combined.length < TOTAL_SLOTS) {
        const categorySlug = movieDetails.movie.category[0]?.slug;
        if (categorySlug) {
          try {
            const genreMovies = await getMoviesByGenre(categorySlug);
            const existingSlugs = new Set(combined.map((m) => m.slug));
            existingSlugs.add(slug);
            const extra = (genreMovies as Movie[])
              .filter((m) => !existingSlugs.has(m.slug))
              .slice(0, TOTAL_SLOTS - combined.length);
            combined = [...combined, ...extra];
          } catch {}
        }
      }

      setRelatedMovies(combined.slice(0, TOTAL_SLOTS));
    };

    fetchSmartRelated();
  }, [movieDetails, slug]);

  const handleNextEpisode = () => {
    if (hasNextEpisode) {
      setCurrentEpisodeIndex(prev => prev + 1);
    }
  };

  const scrollTabs = (direction: 'left' | 'right') => {
    if (tabContainerRef.current) {
      const scrollAmount = direction === 'left' ? -300 : 300;
      tabContainerRef.current.scrollBy({ left: scrollAmount, behavior: 'smooth' });
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-dvh bg-[#0a0a0c] text-white pt-6 md:pt-[100px] px-4 md:px-12 pb-20">
        <div className="max-w-[1600px] mx-auto flex flex-col gap-8">
          <div className="w-full aspect-video bg-white/5 border border-white/10 rounded-3xl animate-skeleton" />
          <div className="flex flex-col gap-4 mt-4">
            <div className="h-10 w-1/2 bg-white/10 rounded-xl animate-skeleton" />
            <div className="flex gap-4">
              <div className="h-6 w-16 bg-white/5 rounded animate-skeleton" />
              <div className="h-6 w-20 bg-white/5 rounded animate-skeleton" />
              <div className="h-6 w-14 bg-white/5 rounded animate-skeleton" />
            </div>
          </div>
          <div className="bg-white/5 border border-white/5 p-6 rounded-3xl flex flex-col gap-4 mt-2">
            <div className="h-6 w-44 bg-white/10 rounded animate-skeleton" />
            <div className="flex flex-wrap gap-3">
              {Array.from({ length: 12 }).map((_, i) => (
                <div key={i} className="h-12 w-20 bg-white/5 rounded-2xl animate-skeleton" />
              ))}
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (!movieDetails?.movie) {
    return (
      <div className="min-h-dvh bg-[#0a0a0c] flex flex-col items-center justify-center text-white p-6">
        <h1 className="text-3xl font-black mb-6">Không tìm thấy thông tin phim!</h1>
        <Link href="/" className="px-8 py-3.5 bg-[#7226FF] hover:bg-[#853aff] text-white font-black text-lg rounded-2xl transition-all shadow-xl">
          Về trang chủ
        </Link>
      </div>
    );
  }

  const { movie } = movieDetails;
  const bannerUrl = movie.thumb_url?.startsWith('http') ? movie.thumb_url : (movie.poster_url.startsWith('http') ? movie.poster_url : `https://phimimg.com/${movie.poster_url}`);

  const currentGroupEpisodes = episodeGroups[activeGroupIndex] || [];
  const visibleEpisodes = isExpanded ? currentGroupEpisodes : currentGroupEpisodes.slice(0, INITIAL_VISIBLE_EPISODES);
  const hasMoreInGroup = currentGroupEpisodes.length > INITIAL_VISIBLE_EPISODES;
  
  const validCast = [...(movie.director || []), ...(movie.actor || [])].filter(name => name && name !== 'Đang cập nhật');

  return (
    <main className="min-h-dvh bg-[#0a0a0c] text-white selection:bg-[#F042FF]/30 pb-24 relative overflow-hidden">
      <Navbar />

      <div className="fixed top-0 left-0 right-0 h-dvh pointer-events-none z-0">
         <div className="absolute top-[-10%] left-[-10%] w-[55%] h-[55%] bg-[#7226FF]/20 blur-[140px] rounded-full mix-blend-screen" />
         <div className="absolute bottom-[-10%] right-[-10%] w-[55%] h-[55%] bg-[#F042FF]/15 blur-[140px] rounded-full mix-blend-screen" />
      </div>

      <div className="w-full px-6 md:px-16 lg:px-24 relative z-10 flex flex-col gap-8 md:gap-10 pt-4 md:pt-[100px]">
        
        {/* ======================================================= */}
        {/* TẦNG 1: KHUNG VIDEO PLAYER                              */}
        {/* ======================================================= */}
        {hasLinkMovie ? (
          <VideoPlayer 
            currentEpisode={currentEpisode}
            movieName={movie.name}
            bannerUrl={bannerUrl}
            onNextEpisode={handleNextEpisode}
            hasNextEpisode={hasNextEpisode}
          />
        ) : (
          <div className="relative w-full aspect-video bg-black rounded-3xl border border-white/10 flex flex-col items-center justify-center text-white/50 gap-3">
              <CircleAlert className="w-14 h-14 opacity-50" />
              <p className="text-xl font-bold">Chưa có link phim</p>
          </div>
        )}

        {/* ======================================================= */}
        {/* TẦNG 2: THÔNG TIN CƠ BẢN VÀ NÚT YÊU THÍCH               */}
        {/* ======================================================= */}
        <div className="flex flex-col gap-3">
            <div className="flex items-start justify-between gap-6">
                <h1 className="uppercase tracking-tight text-white drop-shadow-md leading-tight mb-1.5 md:mb-3">
                    {movie.name}
                </h1>

                <button
                  onClick={handleToggleFavorite}
                  className="shrink-0 w-14 h-14 md:w-16 md:h-16 flex items-center justify-center rounded-2xl bg-white/10 hover:bg-white/20 backdrop-blur-md border border-white/20 hover:scale-105 transition-all cursor-pointer shadow-xl"
                  title={isFavorited ? "Bỏ yêu thích" : "Thêm vào yêu thích"}
                >
                  <Heart 
                    className={`w-7 h-7 md:w-8 md:h-8 transition-all duration-300 ${
                      isFavorited ? 'scale-110' : 'text-white/80'
                    }`} 
                    style={isFavorited ? { color: '#F042FF', fill: '#F042FF', filter: 'drop-shadow(0 0 14px rgba(240,66,255,0.9))' } : {}}
                  />
                </button>
            </div>

            <div className="flex flex-wrap items-center gap-4 text-sm md:text-base font-black text-white/70 uppercase tracking-wider mt-1">
                <span className="text-[#F042FF]">{movie.year}</span>
                <span>•</span>
                <span className="text-yellow-400">{movie.time}</span>
                <span>•</span>
                <span className="border border-white/20 px-3 py-1 rounded-xl text-xs md:text-sm text-white bg-[#7226FF]">{movie.quality}</span>
                 {movie.category?.slice(0, 3).map((cat: { id: string, name: string }) => (
                    <span key={cat.id} className="hidden md:inline-block before:content-['•'] before:mr-2 before:opacity-50">
                        {cat.name}
                    </span>
                 ))}
            </div>
        </div>

        {/* ======================================================= */}
        {/* TẦNG 3: KHUNG CHỌN TRÌNH PHÁT & TẬP PHIM                 */}
        {/* ======================================================= */}
        {(hasLinkMovie || servers.length > 1 || episodesList.length > 0) && (
            <div className="bg-[#1c1c1e] border-2 border-white/15 p-8 md:p-10 rounded-[36px] backdrop-blur-xl flex flex-col gap-8 shadow-2xl">
                
                {servers.length > 1 && (
                  <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6 pb-6 border-b border-white/15">
                    <div className="flex flex-col sm:flex-row sm:items-center gap-3">
                        <div className="flex items-center gap-3 text-white font-black text-lg md:text-xl uppercase tracking-wider shrink-0">
                            <Mic2 className="w-7 h-7 text-yellow-400" /> Ngôn ngữ:
                        </div>
                        <div className="flex flex-wrap gap-3">
                            {servers.map((server: { server_name: string }, idx: number) => (
                                <button
                                    key={idx}
                                    onClick={() => { setActiveServerIndex(idx); setCurrentEpisodeIndex(0); setActiveGroupIndex(0); setIsExpanded(false); }}
                                    className={`px-6 py-3 rounded-2xl text-base md:text-lg font-black transition-all border-2 ${activeServerIndex === idx ? 'bg-[#7226FF] text-white border-transparent shadow-[0_0_24px_rgba(114,38,255,0.8)] scale-105' : 'bg-black/50 text-white/70 border-white/15 hover:bg-white/10 hover:text-white'} cursor-pointer`}
                                >
                                    {server.server_name}
                                </button>
                            ))}
                        </div>
                    </div>
                  </div>
                )}

                {episodesList.length > 0 && (
                    <div>
                        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 mb-6">
                            <div className="flex items-center gap-3 text-[#F042FF] font-black text-xl md:text-2xl uppercase tracking-wider shrink-0">
                                <ListVideo className="w-7 h-7 text-[#F042FF]" /> Chọn Tập Phim
                            </div>
                            {episodeGroups.length > 1 && (
                                <div className="relative w-full md:max-w-[75%] lg:max-w-[80%] group/tabs">
                                    <button
                                        type="button"
                                        onClick={() => scrollTabs('left')}
                                        className="absolute left-0 top-1/2 -translate-y-1/2 z-10 w-10 h-10 flex items-center justify-center bg-[#141414]/90 hover:bg-white/20 backdrop-blur-md border border-white/20 rounded-full transition-all opacity-0 group-hover/tabs:opacity-100 hidden md:flex"
                                    ><ChevronLeft className="w-6 h-6 text-white" /></button>

                                    <div
                                        ref={tabContainerRef}
                                        className="flex gap-3 overflow-x-auto scrollbar-hide py-1 px-0 md:px-12"
                                    >
                                        {episodeGroups.map((group, idx) => {
                                            const firstEp = group[0]?.name?.replace(/Tập\s*/i, '').trim();
                                            const lastEp = group[group.length - 1]?.name?.replace(/Tập\s*/i, '').trim();
                                            return (
                                                <button
                                                    key={idx}
                                                    type="button"
                                                    onClick={(e) => { e.stopPropagation(); setActiveGroupIndex(idx); setIsExpanded(false); }}
                                                    className={`shrink-0 px-6 py-3 text-base md:text-lg font-black rounded-2xl transition-all border-2 whitespace-nowrap cursor-pointer ${
                                                        activeGroupIndex === idx
                                                            ? 'bg-[#7226FF] text-white border-transparent shadow-[0_0_24px_rgba(114,38,255,0.8)] scale-105'
                                                            : 'bg-black/50 text-white/70 border-white/15 hover:bg-white/10 hover:text-white'
                                                    }`}
                                                >Tập {firstEp} - {lastEp}</button>
                                            );
                                        })}
                                    </div>

                                    <button
                                        type="button"
                                        onClick={() => scrollTabs('right')}
                                        className="absolute right-0 top-1/2 -translate-y-1/2 z-10 w-10 h-10 flex items-center justify-center bg-[#141414]/90 hover:bg-white/20 backdrop-blur-md border border-white/20 rounded-full transition-all opacity-0 group-hover/tabs:opacity-100 hidden md:flex"
                                    ><ChevronRight className="w-6 h-6 text-white" /></button>
                                </div>
                            )}
                        </div>

                        <div className="grid grid-cols-4 sm:grid-cols-6 md:grid-cols-8 lg:grid-cols-10 xl:grid-cols-12 gap-3 md:gap-4">
                            {visibleEpisodes.map((ep: { slug: string, name: string }, localIndex: number) => {
                                const globalIndex = activeGroupIndex * EPISODES_PER_GROUP + localIndex;
                                const isPlaying = currentEpisodeIndex === globalIndex;
                                return (
                                    <button 
                                      key={ep.slug}
                                      onClick={() => { setCurrentEpisodeIndex(globalIndex); window.scrollTo({ top: 0, behavior: 'smooth' }); }} 
                                      className={`w-full py-4 md:py-5 rounded-2xl text-base md:text-xl font-black transition-all border-2 cursor-pointer shadow-lg ${isPlaying ? 'bg-[#7226FF] text-white border-transparent shadow-[0_0_24px_rgba(114,38,255,0.8)] scale-105 z-10' : 'bg-black/50 text-[#F042FF] font-black border-white/15 hover:bg-white/20 hover:text-white'}`}
                                    >
                                      {ep.name.replace('Tập ', '')}
                                    </button>
                                );
                             })}
                            {hasMoreInGroup && !isExpanded && (
                                <button onClick={() => setIsExpanded(true)} className="w-full py-4 md:py-5 rounded-2xl text-base md:text-xl font-black transition-all border-2 bg-white/10 text-white/80 border-white/15 hover:bg-white hover:text-black flex items-center justify-center cursor-pointer"><MoreHorizontal className="w-7 h-7" /></button>
                            )}
                        </div>

                        {hasMoreInGroup && isExpanded && (
                            <div className="mt-6 flex justify-center">
                                <button onClick={() => setIsExpanded(false)} className="flex items-center gap-2 text-base font-black text-white/70 hover:text-white uppercase tracking-widest transition-colors py-3.5 px-8 rounded-full hover:bg-white/10 cursor-pointer"><ChevronUp className="w-6 h-6" /> Thu gọn</button>
                            </div>
                        )}
                    </div>
                )}
            </div>
        )}

        {/* ======================================================= */}
        {/* TẦNG 4: BÀI VIẾT NỘI DUNG PHIM                            */}
        {/* ======================================================= */}
        <div className="bg-[#1c1c1e] border-2 border-white/15 p-8 md:p-10 rounded-[36px] shadow-2xl">
          <h2 className="text-white uppercase mb-4">Nội Dung Phim</h2>
          <div 
            className="text-white/90 text-lg md:text-xl leading-relaxed prose prose-invert max-w-none font-medium" 
            dangerouslySetInnerHTML={{ __html: movie.content }} 
          />
        </div>

        {/* ======================================================= */}
        {/* TẦNG 5: DIỄN VIÊN & ĐOÀN LÀM PHIM                        */}
        {/* ======================================================= */}
        {validCast.length > 0 && (
            <div className="pt-6 border-t border-white/15">
                <h2 className="mb-6 uppercase text-white">Diễn Viên &amp; Đoàn Làm Phim</h2>
                <div className="flex gap-8 overflow-x-auto scrollbar-hide pb-4">
                    {validCast.map((name, idx) => (
                        <CastCard
                            key={idx}
                            name={name}
                            role={movie.director?.includes(name) ? 'Đạo diễn' : 'Diễn viên'}
                            colorIndex={idx}
                            variant="circle"
                            photoUrl={actorPhotoMap.get(name.toLowerCase())}
                        />
                    ))}
                </div>
            </div>
        )}

        {/* ======================================================= */}
        {/* TẦNG 6: PHIM LIÊN QUAN                                  */}
        {/* ======================================================= */}
        {relatedMovies.length > 0 && (
          <div className="pt-8 border-t border-white/15 relative group/related">
            <div className="flex items-center gap-3 mb-6">
              <Film className="w-8 h-8 text-[#F042FF]" />
              <h2 className="uppercase text-white">Phim Liên Quan</h2>
            </div>
            
            {/* Desktop Navigation Buttons */}
            <button 
              onClick={() => scrollRelated('left')}
              className="hidden md:flex absolute -left-2 md:-left-6 top-[60%] -translate-y-1/2 z-[60] w-12 h-12 rounded-full bg-black/40 hover:bg-black/70 backdrop-blur-md items-center justify-center opacity-0 group-hover/related:opacity-100 transition-all shadow-lg scale-90 hover:scale-100"
            >
              <ChevronLeft className="w-8 h-8 text-white" />
            </button>

            <button 
              onClick={() => scrollRelated('right')}
              className="hidden md:flex absolute -right-2 md:-right-6 top-[60%] -translate-y-1/2 z-[60] w-12 h-12 rounded-full bg-black/40 hover:bg-black/70 backdrop-blur-md items-center justify-center opacity-0 group-hover/related:opacity-100 transition-all shadow-lg scale-90 hover:scale-100"
            >
              <ChevronRight className="w-8 h-8 text-white" />
            </button>

            <div ref={relatedScrollRef} className="flex gap-6 md:gap-8 overflow-x-auto scrollbar-hide pb-4 scroll-smooth">
              {relatedMovies.map((relMovie, index) => (
                <div
                  key={relMovie.slug}
                  onClick={() => router.push(`/movies/${relMovie.slug}`)}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter' || e.key === ' ' || e.keyCode === 13) {
                      e.preventDefault();
                      router.push(`/movies/${relMovie.slug}`);
                    }
                  }}
                  className="shrink-0 w-40 md:w-80 cursor-pointer group transition-all duration-300"
                >
                  <div className="relative aspect-[2/3] md:aspect-video rounded-3xl overflow-hidden mb-3 border-2 border-white/15 group-focus:border-[#F042FF] group-focus:ring-4 group-focus:ring-[#F042FF]/40 group-focus:scale-105 transition-all duration-300 shadow-xl bg-black/40">
                    <Image
                      src={relMovie.imageSrc}
                      alt={relMovie.title}
                      fill
                      sizes="(max-width: 640px) 44vw, 20vw"
                      className="object-cover transition-transform duration-500 group-hover:scale-110 group-focus:scale-110"
                      referrerPolicy="no-referrer"
                      priority={index < 4}
                    />
                    <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 group-focus:opacity-100 transition-opacity duration-300 flex items-center justify-center backdrop-blur-[2px]">
                      <div className="w-14 h-14 rounded-full bg-[#7226FF] flex items-center justify-center shadow-2xl transform scale-75 group-hover:scale-100 group-focus:scale-100 transition-transform duration-300">
                        <Play className="w-7 h-7 text-white fill-white ml-1" />
                      </div>
                    </div>
                  </div>
                  <p className="text-base md:text-lg font-black text-white/90 group-hover:text-white group-focus:text-white line-clamp-1">{relMovie.title}</p>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </main>
  );
}