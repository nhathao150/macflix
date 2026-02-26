'use client';

import { useEffect, useState, useRef } from 'react';
import { useParams } from 'next/navigation';
import Navbar from '@/components/Navbar';
import { getMovieDetails } from '@/lib/api';
import Hls from 'hls.js';
// Thêm icon Heart
import { ListVideo, CircleAlert, MoreHorizontal, ChevronUp, Mic2, ChevronLeft, ChevronRight, Heart } from 'lucide-react'; 
import Link from 'next/link';
import { useSession } from 'next-auth/react';

const EPISODES_PER_GROUP = 100;
const INITIAL_VISIBLE_EPISODES = 24; 

export default function MovieDetailPage() {
  const params = useParams();
  const slug = params.slug as string;
  const { data: session } = useSession(); 

  const [movieDetails, setMovieDetails] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);
  
  const [activeServerIndex, setActiveServerIndex] = useState(0);
  const [currentEpisodeIndex, setCurrentEpisodeIndex] = useState(0);
  
  const [activeGroupIndex, setActiveGroupIndex] = useState(0);
  const [isExpanded, setIsExpanded] = useState(false);
  
  const [hasLoadedHistory, setHasLoadedHistory] = useState(false);
  
  // STATE LƯU TRẠNG THÁI YÊU THÍCH (TRÁI TIM)
  const [isFavorited, setIsFavorited] = useState(false);
  
  const videoRef = useRef<HTMLVideoElement>(null);
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
          const previousWatch = data.history.find((item: any) => item.slug === slug);
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

  // 3. KIỂM TRA PHIM CÓ TRONG DANH SÁCH YÊU THÍCH CHƯA
  useEffect(() => {
    const userEmail = session?.user?.email;
    if (!userEmail || !slug) return;

    const checkFavorite = async () => {
      try {
        const res = await fetch(`/api/favorites?email=${userEmail}`);
        const data = await res.json();
        if (res.ok && data.favorites) {
          const isFav = data.favorites.some((item: any) => item.slug === slug);
          setIsFavorited(isFav);
        }
      } catch (error) {
        console.error("Lỗi check phim yêu thích:", error);
      }
    };
    checkFavorite();
  }, [session, slug]);

  // 4. LƯU NGẦM LỊCH SỬ XEM PHIM (SAU 5 GIÂY)
  useEffect(() => {
    const userEmail = session?.user?.email;
    if (!userEmail || !movieDetails?.movie || !hasLinkMovie || !hasLoadedHistory) return;

    const syncHistoryToDB = async () => {
      const currentEpName = episodesList[currentEpisodeIndex]?.name || '';
      const bannerUrl = movieDetails.movie.thumb_url?.startsWith('http') 
          ? movieDetails.movie.thumb_url 
          : (movieDetails.movie.poster_url?.startsWith('http') ? movieDetails.movie.poster_url : `https://phimimg.com/${movieDetails.movie.poster_url}`);

      const movieData = {
        slug: slug,
        name: movieDetails.movie.name,
        imageSrc: bannerUrl,
        episodeName: currentEpName,
        episodeIndex: currentEpisodeIndex,
        serverIndex: activeServerIndex,
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
  }, [movieDetails, currentEpisodeIndex, activeServerIndex, session, hasLoadedHistory, hasLinkMovie]);

  // HÀM BẤM NÚT TRÁI TIM (THÊM/XÓA YÊU THÍCH)
  const handleToggleFavorite = async () => {
    const userEmail = session?.user?.email;
    if (!userEmail) {
      alert("Vui lòng đăng nhập để thêm phim vào danh sách Yêu thích!");
      return;
    }

    // Đổi màu tim ngay lập tức để tạo cảm giác mượt (Optimistic UI)
    setIsFavorited(!isFavorited);

    const bannerUrl = movieDetails.movie.thumb_url?.startsWith('http') 
        ? movieDetails.movie.thumb_url 
        : (movieDetails.movie.poster_url?.startsWith('http') ? movieDetails.movie.poster_url : `https://phimimg.com/${movieDetails.movie.poster_url}`);

    const movieData = {
      slug: slug,
      name: movieDetails.movie.name,
      imageSrc: bannerUrl,
    };

    try {
      const res = await fetch('/api/favorites', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: userEmail, movieData })
      });
      const data = await res.json();
      if (res.ok) {
        setIsFavorited(data.isFavorited); // Cập nhật trạng thái thật từ Database
      }
    } catch (error) {
      console.error("Lỗi bấm yêu thích:", error);
      setIsFavorited(!isFavorited); // Trả lại tim cũ nếu API lỗi
    }
  };

  // Tự động chuyển cụm (Tab)
  useEffect(() => {
    const correctGroupIndex = Math.floor(currentEpisodeIndex / EPISODES_PER_GROUP);
    if (correctGroupIndex !== activeGroupIndex && !isNaN(correctGroupIndex)) {
      setActiveGroupIndex(correctGroupIndex);
    }
  }, [currentEpisodeIndex]);

  // Video Player (Apple Native / HLS)
  useEffect(() => {
    if (!hasLinkMovie || !currentEpisode?.link_m3u8 || !videoRef.current) return;
    const videoSrc = currentEpisode.link_m3u8;
    const video = videoRef.current;

    if (Hls.isSupported()) {
      const hls = new Hls();
      hls.loadSource(videoSrc);
      hls.attachMedia(video);
      hls.on(Hls.Events.MANIFEST_PARSED, () => { video.play().catch(() => {}); });
    } else if (video.canPlayType('application/vnd.apple.mpegurl')) {
      video.src = videoSrc;
      video.addEventListener('loadedmetadata', () => { video.play().catch(() => {}); });
    }
  }, [hasLinkMovie, currentEpisode]);

  const scrollTabs = (direction: 'left' | 'right') => {
    if (tabContainerRef.current) {
      const scrollAmount = direction === 'left' ? -300 : 300;
      tabContainerRef.current.scrollBy({ left: scrollAmount, behavior: 'smooth' });
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-[#050505] flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-white"></div>
      </div>
    );
  }

  if (!movieDetails?.movie) {
    return (
      <div className="min-h-screen bg-[#050505] flex flex-col items-center justify-center text-white">
        <h1 className="text-2xl font-bold mb-4">Không tìm thấy phim!</h1>
        <Link href="/" className="px-6 py-2 bg-white/10 hover:bg-white/20 rounded-full transition-colors">Về trang chủ</Link>
      </div>
    );
  }

  const { movie } = movieDetails;
  const bannerUrl = movie.thumb_url?.startsWith('http') ? movie.thumb_url : (movie.poster_url.startsWith('http') ? movie.poster_url : `https://phimimg.com/${movie.poster_url}`);

  const currentGroupEpisodes = episodeGroups[activeGroupIndex] || [];
  const visibleEpisodes = isExpanded ? currentGroupEpisodes : currentGroupEpisodes.slice(0, INITIAL_VISIBLE_EPISODES);
  const hasMoreInGroup = currentGroupEpisodes.length > INITIAL_VISIBLE_EPISODES;

  return (
    <main className="min-h-screen bg-[#050505] text-white selection:bg-cyan-500/30 pb-20 relative overflow-hidden">
      <Navbar />

      <div className="fixed top-0 left-0 right-0 h-screen pointer-events-none z-0">
         <div className="absolute top-[-10%] left-[-10%] w-[50%] h-[50%] bg-blue-900/30 blur-[120px] rounded-full mix-blend-screen" />
         <div className="absolute bottom-[-10%] right-[-10%] w-[50%] h-[50%] bg-cyan-900/20 blur-[120px] rounded-full mix-blend-screen" />
      </div>

      <div className="max-w-[1400px] mx-auto px-4 md:px-8 pt-[80px] md:pt-[100px] relative z-10 flex flex-col gap-8">
        
        {/* MEDIA PLAYER AREA */}
        <div className="relative w-full aspect-video bg-black/50 rounded-2xl md:rounded-3xl overflow-hidden shadow-[0_0_50px_rgba(0,0,0,0.8)] border border-white/10 group">
            
            {/* ====== NÚT YÊU THÍCH NẰM CHILL TRÊN GÓC PHẢI ====== */}
            <button
              onClick={handleToggleFavorite}
              className="absolute top-4 right-4 z-20 w-12 h-12 flex items-center justify-center rounded-full bg-black/40 backdrop-blur-md border border-white/10 hover:bg-black/70 hover:scale-110 transition-all group/fav"
              title={isFavorited ? "Bỏ yêu thích" : "Thêm vào yêu thích"}
            >
              <Heart 
                className={`w-6 h-6 transition-all duration-300 ${
                  isFavorited 
                  ? 'text-red-500 fill-red-500 drop-shadow-[0_0_12px_rgba(239,68,68,0.8)] scale-110' 
                  : 'text-white/70 group-hover/fav:text-white'
                }`} 
              />
            </button>
            {/* ==================================================== */}

            {hasLinkMovie ? (
                <video ref={videoRef} controls autoPlay className="w-full h-full object-contain bg-black outline-none" poster={bannerUrl} />
            ) : (
                <div className="absolute inset-0 flex flex-col items-center justify-center text-white/50 bg-white/5 backdrop-blur-sm gap-2">
                    <CircleAlert className="w-10 h-10 opacity-50" />
                    <p>Chưa có link phim</p>
                </div>
            )}
        </div>

        {/* THÔNG TIN CƠ BẢN */}
        <div className="flex flex-col gap-2 mt-2">
            <h1 className="text-2xl md:text-4xl font-black uppercase tracking-tight text-white drop-shadow-md leading-tight">
                {movie.name}
            </h1>
            <div className="flex flex-wrap items-center gap-3 text-xs font-bold text-white/60 uppercase tracking-wider">
                <span className="text-cyan-400">{movie.year}</span>
                <span>•</span>
                <span className="text-yellow-400">{movie.time}</span>
                 <span>•</span>
                <span className="border border-white/20 px-1 rounded">{movie.quality}</span>
                 {movie.category?.slice(0, 3).map((cat: any) => (
                    <span key={cat.id} className="hidden md:inline-block before:content-['•'] before:mr-2 before:opacity-50">
                        {cat.name}
                    </span>
                 ))}
            </div>
        </div>

        {/* CÁC PHẦN DƯỚI (SERVER, TẬP PHIM, MÔ TẢ...) GIỮ NGUYÊN */}
        <div className="bg-white/5 border border-white/5 p-4 md:p-6 rounded-2xl md:rounded-3xl backdrop-blur-sm flex flex-col gap-6">
            {servers.length > 1 && (
                <div className="flex flex-col gap-3 pb-4 border-b border-white/10">
                    <div className="flex items-center gap-2 text-white/90 font-bold text-sm uppercase tracking-wider">
                        <Mic2 className="w-5 h-5 text-yellow-400" /> Chọn Âm thanh / Phụ đề
                    </div>
                    <div className="flex flex-wrap gap-3">
                        {servers.map((server: any, idx: number) => (
                            <button
                                key={idx}
                                onClick={() => { setActiveServerIndex(idx); setCurrentEpisodeIndex(0); setActiveGroupIndex(0); setIsExpanded(false); }}
                                className={`px-5 py-2.5 rounded-xl text-sm font-bold transition-all border ${activeServerIndex === idx ? 'bg-gradient-to-r from-cyan-500 to-blue-600 text-white border-transparent shadow-[0_0_15px_rgba(6,182,212,0.4)]' : 'bg-black/40 text-white/70 border-white/10 hover:bg-white/10 hover:text-white'}`}
                            >
                                {server.server_name}
                            </button>
                        ))}
                    </div>
                </div>
            )}

            {episodesList.length > 1 && (
                <div>
                    <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-4">
                        <div className="flex items-center gap-2 text-white/90 font-bold text-sm uppercase tracking-wider shrink-0">
                            <ListVideo className="w-5 h-5 text-cyan-400" /> Chọn tập phim
                        </div>
                        {episodeGroups.length > 1 && (
                            <div className="relative group/tabs flex-1 overflow-hidden flex items-center w-full md:max-w-[75%] lg:max-w-[80%]">
                                <button onClick={() => scrollTabs('left')} className="absolute left-0 z-10 w-8 h-8 flex items-center justify-center bg-[#141414]/90 hover:bg-[#2a2a2a] backdrop-blur-md border border-white/10 rounded-full transition-all opacity-0 group-hover/tabs:opacity-100 hidden md:flex"><ChevronLeft className="w-4 h-4 text-white" /></button>
                                <div ref={tabContainerRef} className="flex gap-2 overflow-x-auto scrollbar-hide bg-black/30 p-1 rounded-xl w-full px-2 md:px-8 snap-x">
                                    {episodeGroups.map((group, idx) => {
                                        const firstEp = group[0]?.name?.replace(/Tập\s*/i, '').trim();
                                        const lastEp = group[group.length - 1]?.name?.replace(/Tập\s*/i, '').trim();
                                        return (
                                            <button key={idx} onClick={() => { setActiveGroupIndex(idx); setIsExpanded(false); }} className={`shrink-0 px-4 py-1.5 rounded-lg text-xs font-bold transition-all snap-start ${activeGroupIndex === idx ? 'bg-white text-black shadow-md' : 'text-white/60 hover:text-white hover:bg-white/10'}`}>Tập {firstEp} - {lastEp}</button>
                                        )
                                    })}
                                </div>
                                <button onClick={() => scrollTabs('right')} className="absolute right-0 z-10 w-8 h-8 flex items-center justify-center bg-[#141414]/90 hover:bg-[#2a2a2a] backdrop-blur-md border border-white/10 rounded-full transition-all opacity-0 group-hover/tabs:opacity-100 hidden md:flex"><ChevronRight className="w-4 h-4 text-white" /></button>
                            </div>
                        )}
                    </div>
                    <div className="flex flex-wrap gap-2 md:gap-3">
                        {visibleEpisodes.map((ep: any, localIndex: number) => {
                            const globalIndex = activeGroupIndex * EPISODES_PER_GROUP + localIndex;
                            const isPlaying = currentEpisodeIndex === globalIndex;
                            return (
                                <button key={ep.slug} onClick={() => { setCurrentEpisodeIndex(globalIndex); window.scrollTo({ top: 0, behavior: 'smooth' }); }} className={`w-[calc(25%-6px)] sm:w-[calc(20%-8px)] md:w-[calc(10%-11px)] py-2 md:py-3 rounded-xl text-xs font-bold transition-all border ${isPlaying ? 'bg-gradient-to-tr from-cyan-500 to-blue-600 text-white border-transparent shadow-[0_0_15px_rgba(6,182,212,0.4)] scale-105 z-10' : 'bg-[#1a1a1c] text-white/70 border-white/5 hover:bg-white/20 hover:text-white hover:border-white/20'}`}>{ep.name.replace('Tập ', '')}</button>
                            );
                        })}
                        {hasMoreInGroup && !isExpanded && (
                            <button onClick={() => setIsExpanded(true)} className="w-[calc(25%-6px)] sm:w-[calc(20%-8px)] md:w-[calc(10%-11px)] py-2 md:py-3 rounded-xl text-xs font-bold transition-all border bg-white/5 text-white/70 border-white/10 hover:bg-white hover:text-black flex items-center justify-center"><MoreHorizontal className="w-5 h-5" /></button>
                        )}
                    </div>
                    {hasMoreInGroup && isExpanded && (
                        <div className="mt-4 flex justify-center">
                            <button onClick={() => setIsExpanded(false)} className="flex items-center gap-1 text-xs font-bold text-white/50 hover:text-white uppercase tracking-widest transition-colors py-2 px-4 rounded-full hover:bg-white/10"><ChevronUp className="w-4 h-4" /> Thu gọn</button>
                        </div>
                    )}
                </div>
            )}
        </div>

         <div className="text-white/80 text-sm leading-relaxed p-4 md:p-6 rounded-2xl bg-[#141414] border border-white/5 shadow-inner" dangerouslySetInnerHTML={{ __html: movie.content }} />

        <div className="pt-4 border-t border-white/10">
            <h3 className="text-xs font-bold mb-4 uppercase tracking-wider text-white/70">Cast & Crew</h3>
            <div className="flex flex-wrap gap-4">
                {[...(movie.director || []), ...(movie.actor || [])].filter(name => name && name !== 'Đang cập nhật').map((name, idx) => {
                    const colors = ['from-pink-500 to-rose-500', 'from-cyan-500 to-blue-500', 'from-purple-500 to-indigo-500', 'from-yellow-500 to-orange-500'];
                    const randomColor = colors[idx % colors.length];
                    const initials = name.split(' ').map((n:string) => n[0]).join('').slice(0,2).toUpperCase();
                    return (
                        <div key={idx} className="flex items-center gap-3 bg-[#141414] border border-white/5 pr-4 rounded-full hover:bg-white/10 transition-colors cursor-pointer group">
                            <div className={`w-10 h-10 rounded-full bg-gradient-to-tr ${randomColor} flex items-center justify-center text-white font-bold text-sm shadow-sm group-hover:scale-105 transition-transform`}>{initials}</div>
                            <div>
                                <p className="text-xs font-bold text-white line-clamp-1">{name}</p>
                                <p className="text-[10px] text-white/50">{movie.director?.includes(name) ? 'Đạo diễn' : 'Diễn viên'}</p>
                            </div>
                        </div>
                    )
                })}
            </div>
        </div>
      </div>
    </main>
  );
}