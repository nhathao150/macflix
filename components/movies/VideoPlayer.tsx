'use client';

import React, { useEffect, useState, useRef } from 'react';
import Hls from 'hls.js';
import { 
  Play, Pause, Maximize, Minimize, Settings, 
  Subtitles, Volume2, VolumeX, RotateCcw, RotateCw, 
  PictureInPicture, PictureInPicture2, SkipForward
} from 'lucide-react';

interface VideoPlayerProps {
  currentEpisode: {
    name: string;
    link_m3u8?: string;
    link_embed?: string;
  };
  movieName: string;
  bannerUrl: string;
  onNextEpisode?: () => void;
  hasNextEpisode?: boolean;
}

export default function VideoPlayer({ 
  currentEpisode, 
  movieName, 
  bannerUrl, 
  onNextEpisode, 
  hasNextEpisode 
}: VideoPlayerProps) {
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [useEmbedPlayer, setUseEmbedPlayer] = useState(false);
  const [hasAutoFullscreen, setHasAutoFullscreen] = useState(false);
  const [isPiP, setIsPiP] = useState(false);
  
  const [playbackRate, setPlaybackRate] = useState(1);
  const [isSpeedMenuOpen, setIsSpeedMenuOpen] = useState(false);

  const [subtitleTracks, setSubtitleTracks] = useState<any[]>([]);
  const [activeSubIndex, setActiveSubIndex] = useState(-1);
  const [isSubMenuOpen, setIsSubMenuOpen] = useState(false);

  // === TOUCH GESTURES & SEEK ===
  const lastTapRef = useRef<number>(0);
  const lastTouchTimeRef = useRef<number>(0);
  const [seekFeedback, setSeekFeedback] = useState<'forward' | 'backward' | null>(null);

  const [volume, setVolume] = useState(1);
  const [isMuted, setIsMuted] = useState(false);

  // === STATE CHO ZOOM ASPECT RATIO ===
  const [videoFitMode, setVideoFitMode] = useState<'contain' | 'cover'>('contain');
  const [zoomToast, setZoomToast] = useState<string | null>(null);
  const initialPinchDistanceRef = useRef<number | null>(null);
  const isPinchingRef = useRef<boolean>(false);

  // UI CONTROLS VISIBILITY
  const [isControlsVisible, setIsControlsVisible] = useState(true);
  const controlsTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  const videoRef = useRef<HTMLVideoElement>(null);
  const playerContainerRef = useRef<HTMLDivElement>(null);
  const hlsRef = useRef<Hls | null>(null);

  const isMobile = typeof window !== 'undefined' ? window.innerWidth < 768 : false;

  // Xử lý HLS & Video Setup
  useEffect(() => {
    if (!currentEpisode || (!currentEpisode.link_m3u8 && currentEpisode.link_embed)) {
      setUseEmbedPlayer(true);
      return;
    }
    
    setUseEmbedPlayer(false);
    if (!currentEpisode.link_m3u8 || !videoRef.current) return;
    
    let videoSrc = currentEpisode.link_m3u8;
    if (videoSrc && videoSrc.startsWith('http://')) {
      videoSrc = videoSrc.replace('http://', 'https://');
    }
    
    const video = videoRef.current;
    let fallbackTimeout: NodeJS.Timeout;

    const handleNativeError = (e: Event) => {
      console.log("Native HLS error, fallback to embed player...", e);
      setUseEmbedPlayer(true);
    };
    
    const isSafari = /^((?!chrome|android).)*safari/i.test(navigator.userAgent);
    const isIOS = /iPad|iPhone|iPod/.test(navigator.userAgent) || (navigator.userAgent.includes("Mac") && "ontouchend" in document);
    
    const handleLoadedMetadata = () => {
      if (fallbackTimeout) clearTimeout(fallbackTimeout);
      
      const tracks = [];
      for (let i = 0; i < video.textTracks.length; i++) {
        if (video.textTracks[i].kind === 'subtitles' || video.textTracks[i].kind === 'captions') {
          tracks.push(video.textTracks[i]);
        }
      }
      setSubtitleTracks(tracks);
    };

    if ((isSafari || isIOS) && video.canPlayType('application/vnd.apple.mpegurl')) {
      video.src = videoSrc;
      video.load();
      video.addEventListener('error', handleNativeError);
      fallbackTimeout = setTimeout(() => setUseEmbedPlayer(true), 7000);
      video.addEventListener('loadedmetadata', handleLoadedMetadata, { once: true });
    } else if (Hls.isSupported()) {
      const hls = new Hls({
        startLevel: -1, 
        capLevelToPlayerSize: true, 
        maxBufferLength: 15,
        maxMaxBufferLength: 30,
        maxBufferSize: 15 * 1000 * 1000,
        abrEwmaDefaultEstimate: 500000, 
      });
      hlsRef.current = hls; 
      
      hls.loadSource(videoSrc);
      hls.attachMedia(video);
      
      hls.on(Hls.Events.MANIFEST_PARSED, () => {
        if (hls.subtitleTracks && hls.subtitleTracks.length > 0) {
           setSubtitleTracks(hls.subtitleTracks);
        }
      });

      hls.on(Hls.Events.ERROR, (event, data) => {
        if (data.fatal) {
          switch (data.type) {
            case Hls.ErrorTypes.NETWORK_ERROR:
              hls.startLoad();
              break;
            case Hls.ErrorTypes.MEDIA_ERROR:
              hls.recoverMediaError();
              break;
            default:
              setUseEmbedPlayer(true);
              break;
          }
        }
      });
    } else if (video.canPlayType('application/vnd.apple.mpegurl')) {
      video.src = videoSrc;
      video.load();
      video.addEventListener('error', handleNativeError);
      fallbackTimeout = setTimeout(() => setUseEmbedPlayer(true), 7000);
      video.addEventListener('loadedmetadata', handleLoadedMetadata, { once: true });
    }

    return () => { 
      if (hlsRef.current) {
        hlsRef.current.destroy();
        hlsRef.current = null;
      }
    };
  }, [currentEpisode]);

  const triggerAutoFullscreen = () => {
    if (!hasAutoFullscreen && playerContainerRef.current) {
      setHasAutoFullscreen(true);
      if (!document.fullscreenElement && isMobile) {
        if (playerContainerRef.current.requestFullscreen) {
          playerContainerRef.current.requestFullscreen().catch(() => {});
        } else if (videoRef.current && (videoRef.current as any).webkitEnterFullscreen) {
          try {
            (videoRef.current as any).webkitEnterFullscreen();
          } catch (e) {
            console.warn('iOS blocked auto-fullscreen (InvalidStateError). User must tap manually.');
          }
        }
      }
    }
  };

  // HANDLERS
  const handleMouseMove = () => {
    if (Date.now() - lastTouchTimeRef.current < 1500) return;
    setIsControlsVisible(true);
    if (controlsTimeoutRef.current) clearTimeout(controlsTimeoutRef.current);
    if (!isSpeedMenuOpen && !isSubMenuOpen && isPlaying) {
        controlsTimeoutRef.current = setTimeout(() => setIsControlsVisible(false), 4000);
    }
  };

  const handleMouseLeave = () => {
    if (isPlaying && !isSpeedMenuOpen && !isSubMenuOpen) setIsControlsVisible(false);
  };

  const togglePlay = () => {
    if (videoRef.current?.paused) {
      videoRef.current.play().catch(() => {});
      setIsPlaying(true);
      if (isMobile && !isFullscreen) toggleFullScreen();
    } else {
      videoRef.current?.pause();
      setIsPlaying(false);
      setIsControlsVisible(true);
    }
  };

  // TOUCH GESTURES (Double Tap & Pinch)
  const handleVideoInteraction = (e: React.MouseEvent | React.TouchEvent, area: 'left' | 'right' | 'center') => {
    const now = Date.now();
    const DOUBLE_TAP_DELAY = 300;

    if (now - lastTapRef.current < DOUBLE_TAP_DELAY) {
      // Double tap
      if (area === 'left') {
        skipTime(-10);
        showFeedback('backward');
      } else if (area === 'right') {
        skipTime(10);
        showFeedback('forward');
      } else {
        toggleFullScreen();
      }
      lastTapRef.current = 0;
    } else {
      // Single tap
      if (controlsTimeoutRef.current) {
        clearTimeout(controlsTimeoutRef.current);
        controlsTimeoutRef.current = null;
      }
      setIsControlsVisible(prev => !prev);
      if (!isControlsVisible) {
        controlsTimeoutRef.current = setTimeout(() => setIsControlsVisible(false), 4000);
      }
      lastTapRef.current = now;
    }
  };

  const showFeedback = (type: 'forward' | 'backward') => {
    setSeekFeedback(type);
    setTimeout(() => setSeekFeedback(null), 500);
  };

  const handleTouchStart = (e: React.TouchEvent) => {
    lastTouchTimeRef.current = Date.now();
    if (e.touches.length === 2) {
      isPinchingRef.current = true;
      const dx = e.touches[0].clientX - e.touches[1].clientX;
      const dy = e.touches[0].clientY - e.touches[1].clientY;
      initialPinchDistanceRef.current = Math.sqrt(dx * dx + dy * dy);
    }
  };

  const handleTouchMove = (e: React.TouchEvent) => {
    if (isPinchingRef.current && e.touches.length === 2 && initialPinchDistanceRef.current !== null) {
      const dx = e.touches[0].clientX - e.touches[1].clientX;
      const dy = e.touches[0].clientY - e.touches[1].clientY;
      const currentDistance = Math.sqrt(dx * dx + dy * dy);
      const diff = currentDistance - initialPinchDistanceRef.current;
      
      if (Math.abs(diff) > 40) {
        changeFitMode(diff > 0 ? 'cover' : 'contain');
        initialPinchDistanceRef.current = currentDistance;
      }
    }
  };

  const handleTouchEnd = () => {
    isPinchingRef.current = false;
    initialPinchDistanceRef.current = null;
  };

  const changeFitMode = (mode: 'contain' | 'cover') => {
    if (videoFitMode === mode) return;
    setVideoFitMode(mode);
    setZoomToast(mode === 'cover' ? 'Tràn màn hình (Zoom to Fill)' : 'Vừa màn hình (Vừa tỷ lệ gốc)');
  };

  const skipTime = (seconds: number) => {
    if (videoRef.current) videoRef.current.currentTime += seconds;
  };

  const handleSeek = (e: React.ChangeEvent<HTMLInputElement>) => {
    const time = Number(e.target.value);
    if (videoRef.current) videoRef.current.currentTime = time;
    setCurrentTime(time);
  };

  const formatTime = (time: number) => {
    if (!time || isNaN(time)) return "00:00";
    const h = Math.floor(time / 3600);
    const m = Math.floor((time % 3600) / 60);
    const s = Math.floor(time % 60);
    if (h > 0) return `${h}:${m < 10 ? '0' : ''}${m}:${s < 10 ? '0' : ''}${s}`;
    return `${m < 10 ? '0' : ''}${m}:${s < 10 ? '0' : ''}${s}`;
  };

  // FULLSCREEN & PIP
  const toggleFullScreen = () => {
    if (videoRef.current) {
      const video = videoRef.current;
      if (!document.fullscreenElement && !(video as any).webkitDisplayingFullscreen) {
        if (playerContainerRef.current?.requestFullscreen) {
          playerContainerRef.current.requestFullscreen().then(() => {
            if (screen.orientation && (screen.orientation as any).lock) {
              (screen.orientation as any).lock('landscape').catch(() => {});
            }
          }).catch(err => console.error(err));
        } else if ((video as any).webkitEnterFullscreen) {
          try { (video as any).webkitEnterFullscreen(); } catch (e) {}
        }
      } else {
        if (document.exitFullscreen) document.exitFullscreen();
        else if ((video as any).webkitExitFullscreen) {
          try { (video as any).webkitExitFullscreen(); } catch (e) {}
        }
      }
    }
  };

  const togglePiP = async () => {
    try {
      if (document.pictureInPictureElement) {
        await document.exitPictureInPicture();
      } else if (document.pictureInPictureEnabled && videoRef.current) {
        await videoRef.current.requestPictureInPicture();
      }
    } catch (error) {
      console.error('PiP failed', error);
    }
  };

  useEffect(() => {
    const handleFsChange = () => {
      const isFs = !!document.fullscreenElement;
      setIsFullscreen(isFs);
      if (!isFs) {
        if (screen.orientation && screen.orientation.unlock) {
          try { screen.orientation.unlock(); } catch (e) {}
        }
        if (isMobile && videoRef.current && !videoRef.current.paused) {
          videoRef.current.pause();
          setIsPlaying(false);
        }
      }
    };
    document.addEventListener('fullscreenchange', handleFsChange);
    
    const video = videoRef.current;
    const handleWebKitFsChange = () => {
      const isFs = (video as any).webkitDisplayingFullscreen || false;
      setIsFullscreen(isFs);
      if (!isFs && isMobile && video && !video.paused) {
        video.pause();
        setIsPlaying(false);
      }
    };

    const handlePiPChange = () => {
      setIsPiP(!!document.pictureInPictureElement);
    };

    if (video) {
      video.addEventListener('webkitbeginfullscreen', handleWebKitFsChange);
      video.addEventListener('webkitendfullscreen', handleWebKitFsChange);
      video.addEventListener('enterpictureinpicture', handlePiPChange);
      video.addEventListener('leavepictureinpicture', handlePiPChange);
    }

    return () => {
      document.removeEventListener('fullscreenchange', handleFsChange);
      if (video) {
        video.removeEventListener('webkitbeginfullscreen', handleWebKitFsChange);
        video.removeEventListener('webkitendfullscreen', handleWebKitFsChange);
        video.removeEventListener('enterpictureinpicture', handlePiPChange);
        video.removeEventListener('leavepictureinpicture', handlePiPChange);
      }
    };
  }, [isMobile]);

  useEffect(() => {
    if (zoomToast) {
      const timeout = setTimeout(() => setZoomToast(null), 1500);
      return () => clearTimeout(timeout);
    }
  }, [zoomToast]);

  const changePlaybackRate = (rate: number) => {
    if (videoRef.current) videoRef.current.playbackRate = rate;
    setPlaybackRate(rate);
    setIsSpeedMenuOpen(false);
  };

  const changeSubtitle = (index: number) => {
    setActiveSubIndex(index);
    setIsSubMenuOpen(false);

    if (Hls.isSupported() && hlsRef.current) {
      hlsRef.current.subtitleTrack = index; 
    } else if (videoRef.current) {
      const tracks = videoRef.current.textTracks;
      let subIdx = 0;
      for (let i = 0; i < tracks.length; i++) {
        if (tracks[i].kind === 'subtitles' || tracks[i].kind === 'captions') {
          tracks[i].mode = (subIdx === index) ? 'showing' : 'hidden';
          subIdx++;
        }
      }
    }
  };

  const toggleMute = () => {
    if (videoRef.current) {
      const newMutedState = !isMuted;
      videoRef.current.muted = newMutedState;
      setIsMuted(newMutedState);
      if (!newMutedState && volume === 0) {
        setVolume(0.5);
        videoRef.current.volume = 0.5;
      }
    }
  };

  const handleVolumeChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newVolume = parseFloat(e.target.value);
    if (videoRef.current) {
      videoRef.current.volume = newVolume;
      videoRef.current.muted = newVolume === 0;
    }
    setVolume(newVolume);
    setIsMuted(newVolume === 0);
  };

  // KEYBOARD SHORTCUTS
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      const activeEl = document.activeElement as HTMLElement;
      const tag = activeEl?.tagName?.toLowerCase();
      const inputType = (activeEl as HTMLInputElement)?.type;
      
      if ((tag === 'input' && inputType === 'text') || tag === 'textarea' || tag === 'select') return;

      const isInsidePlayer = playerContainerRef.current && playerContainerRef.current.contains(activeEl);
      
      if (!isFullscreen && isInsidePlayer && (e.key === 'Enter' || e.key === ' ')) {
        e.preventDefault();
        toggleFullScreen();
        return;
      }
      
      setIsControlsVisible(true);
      if (controlsTimeoutRef.current) clearTimeout(controlsTimeoutRef.current);
      controlsTimeoutRef.current = setTimeout(() => setIsControlsVisible(false), 4000);

      switch (e.key) {
        case 'f':
        case 'F':
          e.preventDefault();
          toggleFullScreen();
          break;
        case ' ':
        case 'Enter':
          if (tag === 'button' || tag === 'a' || inputType === 'range') return;
          if (isInsidePlayer || isFullscreen) {
            e.preventDefault();
            togglePlay();
          }
          break;
        case 'ArrowRight':
          e.preventDefault();
          skipTime(10);
          showFeedback('forward');
          break;
        case 'ArrowLeft':
          e.preventDefault();
          skipTime(-10);
          showFeedback('backward');
          break;
        case 'ArrowUp':
          e.preventDefault();
          setVolume(prev => {
            const newVol = Math.min(1, prev + 0.1);
            if (videoRef.current) {
              videoRef.current.volume = newVol;
              videoRef.current.muted = newVol === 0;
            }
            setIsMuted(newVol === 0);
            return newVol;
          });
          break;
        case 'ArrowDown':
          e.preventDefault();
          setVolume(prev => {
            const newVol = Math.max(0, prev - 0.1);
            if (videoRef.current) {
              videoRef.current.volume = newVol;
              videoRef.current.muted = newVol === 0;
            }
            setIsMuted(newVol === 0);
            return newVol;
          });
          break;
      }
    };

    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [isFullscreen]);


  if (useEmbedPlayer) {
    return (
      <div 
        ref={playerContainerRef}
        className={`relative w-full aspect-video bg-black overflow-hidden outline-none transition-all duration-300 ${isFullscreen ? 'rounded-none border-none shadow-none' : 'rounded-3xl border-2 border-white/15 shadow-[0_20px_60px_rgba(0,0,0,0.9)]'}`}
      >
        <iframe
          src={currentEpisode?.link_embed?.startsWith('http://') ? currentEpisode.link_embed.replace('http://', 'https://') : currentEpisode?.link_embed}
          className="w-full h-full border-none"
          allowFullScreen
          allow="autoplay; encrypted-media; picture-in-picture"
        />
      </div>
    );
  }

  const progressPercent = (currentTime / (duration || 1)) * 100;

  return (
    <div 
      ref={playerContainerRef}
      onMouseMove={handleMouseMove}
      onMouseLeave={handleMouseLeave}
      className={`relative w-full aspect-video bg-black overflow-hidden group select-none flex flex-col justify-center touch-manipulation outline-none transition-all duration-300 ${!isPlaying || isControlsVisible ? 'cursor-pointer' : 'cursor-none'} ${isFullscreen ? 'rounded-none border-none shadow-none' : 'rounded-3xl border-2 border-white/15 shadow-[0_20px_60px_rgba(0,0,0,0.9)]'}`}
    >
      <video 
        ref={videoRef} 
        preload="metadata"
        playsInline
        className={`w-full h-full object-${videoFitMode} bg-black outline-none pointer-events-none transition-all duration-300`}
        poster={bannerUrl} 
        onTimeUpdate={() => setCurrentTime(videoRef.current?.currentTime || 0)}
        onLoadedMetadata={() => setDuration(videoRef.current?.duration || 0)}
        onPlay={() => { setIsPlaying(true); triggerAutoFullscreen(); }}
        onPause={() => { setIsPlaying(false); setIsControlsVisible(true); }}
        onEnded={() => {
          if (onNextEpisode) onNextEpisode();
        }}
        onError={() => setUseEmbedPlayer(true)}
      />

      {/* OVERLAY TƯƠNG TÁC DOUBLE TAP (3 VÙNG: TRÁI - GIỮA - PHẢI) */}
      <div className="absolute inset-0 z-0 flex" onTouchStart={handleTouchStart} onTouchMove={handleTouchMove} onTouchEnd={handleTouchEnd}>
        <div className="flex-1" onClick={(e) => { e.stopPropagation(); handleVideoInteraction(e, 'left'); }} />
        <div className="flex-1" onClick={(e) => { e.stopPropagation(); handleVideoInteraction(e, 'center'); }} />
        <div className="flex-1" onClick={(e) => { e.stopPropagation(); handleVideoInteraction(e, 'right'); }} />
      </div>

      {/* TOAST THÔNG BÁO THU PHÓNG */}
      {zoomToast && (
        <div className="absolute top-16 left-1/2 -translate-x-1/2 bg-black/80 backdrop-blur-md px-6 py-3 rounded-full border border-white/20 z-50 text-white font-black text-base pointer-events-none animate-in fade-in zoom-in-95 duration-200 shadow-2xl">
            {zoomToast}
        </div>
      )}

      {/* HIỆU ỨNG TUA NHANH 10S */}
      <div className={`absolute inset-y-0 left-0 w-[30%] bg-gradient-to-r from-[#7226FF]/30 to-transparent flex items-center justify-center transition-opacity duration-300 pointer-events-none rounded-l-3xl ${seekFeedback === 'backward' ? 'opacity-100' : 'opacity-0'}`}>
          <div className="flex flex-col items-center gap-2 animate-bounce">
              <RotateCcw className="w-10 h-10 md:w-16 md:h-16 text-white" />
              <span className="text-white font-black text-lg md:text-2xl">-10s</span>
          </div>
      </div>
      <div className={`absolute inset-y-0 right-0 w-[30%] bg-gradient-to-l from-[#7226FF]/30 to-transparent flex items-center justify-center transition-opacity duration-300 pointer-events-none rounded-r-3xl ${seekFeedback === 'forward' ? 'opacity-100' : 'opacity-0'}`}>
          <div className="flex flex-col items-center gap-2 animate-bounce">
              <RotateCw className="w-10 h-10 md:w-16 md:h-16 text-white" />
              <span className="text-white font-black text-lg md:text-2xl">+10s</span>
          </div>
      </div>

      {/* KHU VỰC 1: TOP BAR (TIÊU ĐỀ PHIM) */}
      <div className={`absolute top-0 left-0 right-0 pt-6 px-6 md:px-8 pb-10 bg-gradient-to-b from-black/80 to-transparent flex justify-between items-start z-30 transition-all duration-300 ${!isPlaying || isControlsVisible ? 'opacity-100 -translate-y-0' : 'opacity-0 -translate-y-4 pointer-events-none'}`} onClick={(e) => e.stopPropagation()}>
          <div className="flex flex-col drop-shadow-2xl pr-4 cursor-default max-w-[85%]">
              <p className="text-sm md:text-base font-black text-[#F042FF] tracking-widest mb-1 uppercase drop-shadow-[0_2px_4px_rgba(0,0,0,0.8)]">
                  {currentEpisode?.name || 'Đang tải...'}
              </p>
              <h2 className="text-xl md:text-4xl font-black text-white tracking-tight line-clamp-2 drop-shadow-[0_2px_4px_rgba(0,0,0,0.8)]">
                  {movieName}
              </h2>
          </div>
      </div>

      <div className={`absolute inset-0 transition-all duration-300 pointer-events-none z-10 ${!isPlaying ? 'opacity-100 bg-black/40' : (isControlsVisible ? 'opacity-100 bg-black/10' : 'opacity-0')}`} />

      {/* KHU VỰC 2: CENTER CONTROLS (PLAY/PAUSE/NEXT) */}
      <div className={`absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 flex items-center justify-center gap-8 md:gap-24 transition-all duration-300 z-50 ${!isPlaying || isControlsVisible ? 'opacity-100 pointer-events-auto scale-100' : 'opacity-0 pointer-events-none scale-95'}`} onClick={(e) => e.stopPropagation()}>
          
          <button 
            onClick={(e) => { e.stopPropagation(); skipTime(-10); }} 
            onTouchEnd={(e) => { e.stopPropagation(); e.preventDefault(); skipTime(-10); }}
            className="pointer-events-auto w-12 h-12 md:w-20 md:h-20 rounded-full bg-black/40 hover:bg-[#7226FF] backdrop-blur-xl flex items-center justify-center border-2 border-white/20 text-white hover:scale-110 active:scale-95 transition-all shadow-2xl"
          >
              <RotateCcw className="w-5 h-5 md:w-9 md:h-9" />
          </button>

          <button 
            onClick={(e) => { e.stopPropagation(); togglePlay(); }} 
            onTouchEnd={(e) => { e.stopPropagation(); e.preventDefault(); togglePlay(); }}
            className="pointer-events-auto w-16 h-16 md:w-28 md:h-28 bg-[#7226FF] hover:bg-[#853aff] backdrop-blur-xl rounded-full flex items-center justify-center border-4 border-transparent text-white shadow-[0_0_50px_rgba(114,38,255,0.7)] hover:scale-110 active:scale-95 transition-all outline-none"
          >
              {isPlaying ? <Pause className="w-8 h-8 md:w-14 md:h-14 fill-white" /> : <Play className="w-8 h-8 md:w-14 md:h-14 fill-white ml-1.5 md:ml-2" />}
          </button>

          <button 
            onClick={(e) => { e.stopPropagation(); skipTime(10); }} 
            onTouchEnd={(e) => { e.stopPropagation(); e.preventDefault(); skipTime(10); }}
            className="pointer-events-auto w-12 h-12 md:w-20 md:h-20 rounded-full bg-black/40 hover:bg-[#7226FF] backdrop-blur-xl flex items-center justify-center border-2 border-white/20 text-white hover:scale-110 active:scale-95 transition-all shadow-2xl"
          >
              <RotateCw className="w-5 h-5 md:w-9 md:h-9" />
          </button>
      </div>

      {/* KHU VỰC 3: BOTTOM BAR (TIMELINE VÀ CÔNG CỤ) */}
      <div className={`absolute bottom-0 left-0 right-0 px-4 md:px-8 pb-4 md:pb-6 pt-16 bg-gradient-to-t from-black/95 via-black/60 to-transparent flex flex-col gap-1 md:gap-4 z-30 transition-all duration-300 ${!isPlaying || isControlsVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4 pointer-events-none'}`} onClick={(e) => e.stopPropagation()}>
          
          <div className="flex flex-col md:flex-row md:items-center gap-1 md:gap-6 w-full cursor-default pointer-events-auto">
              
              {/* DESKTOP TIME (TRÁI) */}
              <span className="hidden md:block text-base font-mono font-black text-white shrink-0 min-w-[70px] text-left drop-shadow-lg z-20 order-1">
                  {formatTime(currentTime)}
              </span>

              {/* TIMELINE (TRÊN CÙNG MOBILE, GIỮA DESKTOP) */}
              <div className="flex-1 relative flex items-center group/timeline h-6 md:h-8 order-1 md:order-2">
                  <input
                      type="range"
                      min={0}
                      max={duration || 100}
                      value={currentTime}
                      onChange={handleSeek}
                      className="w-full h-1.5 md:h-2 rounded-full appearance-none cursor-pointer relative z-10 accent-[#F042FF] shadow-lg custom-slider"
                      style={{ background: `linear-gradient(to right, #F042FF ${progressPercent}%, rgba(255, 255, 255, 0.25) ${progressPercent}%)` }}
                  />
              </div>

              {/* DESKTOP TIME (PHẢI) */}
              <span className="hidden md:block text-base font-mono font-black text-white shrink-0 min-w-[70px] text-right drop-shadow-lg z-20 order-3">
                  -{formatTime(duration - currentTime)}
              </span>

              {/* MOBILE TIME & TOOLS (DƯỚI TIMELINE) */}
              <div className="flex justify-between items-center w-full md:hidden order-2 mt-1 px-1">
                 <div className="text-sm font-mono font-black text-white drop-shadow-lg z-20">
                    {formatTime(currentTime)} <span className="text-white/50 font-bold">/ {formatTime(duration)}</span>
                 </div>
                 <div className="flex items-center gap-2">
                   {hasNextEpisode && onNextEpisode && (
                     <button onClick={onNextEpisode} className="text-white/80 hover:text-white p-2 transition cursor-pointer">
                       <SkipForward className="w-6 h-6" />
                     </button>
                   )}
                   <button onClick={toggleFullScreen} className="text-white/80 hover:text-white hover:scale-110 p-2 transition flex items-center justify-center cursor-pointer">
                       {isFullscreen ? <Minimize className="w-6 h-6" /> : <Maximize className="w-6 h-6" />}
                   </button>
                 </div>
              </div>
          </div>

          {/* DESKTOP TOOLS (BOTTOM ROW) */}
          <div className="hidden md:flex justify-between items-center w-full pointer-events-auto md:mt-2">
              
              {/* LEFT: VOLUME & NEXT EPISODE */}
              <div className="flex items-center gap-2 md:gap-4 group/vol">
                  <div className="flex items-center">
                    <button onClick={toggleMute} className="text-white/80 hover:text-white hover:scale-110 rounded-xl p-2 transition flex items-center justify-center shrink-0 cursor-pointer">
                        {isMuted || volume === 0 ? <VolumeX className="w-6 h-6 md:w-7 md:h-7" /> : <Volume2 className="w-6 h-6 md:w-7 md:h-7" />}
                    </button>
                    <div className="w-0 overflow-hidden group-hover/vol:w-28 transition-all duration-300 ease-out flex items-center ml-0 group-hover/vol:ml-2">
                        <input type="range" min={0} max={1} step={0.01} value={isMuted ? 0 : volume} onChange={(e) => { e.stopPropagation(); handleVolumeChange(e); }} className="w-full h-1.5 rounded-full appearance-none cursor-pointer accent-[#F042FF] custom-slider" style={{ background: `linear-gradient(to right, #F042FF ${(isMuted ? 0 : volume) * 100}%, rgba(255, 255, 255, 0.3) ${(isMuted ? 0 : volume) * 100}%)` }} />
                    </div>
                  </div>

                  {hasNextEpisode && onNextEpisode && (
                    <button onClick={onNextEpisode} className="flex items-center gap-2 text-white/80 hover:text-white hover:bg-white/20 px-3 py-1.5 rounded-xl transition cursor-pointer font-bold text-sm border border-white/20 bg-black/40 backdrop-blur-md">
                      <SkipForward className="w-5 h-5" /> Tập tiếp
                    </button>
                  )}
              </div>

              {/* RIGHT: SUBTITLES, SPEED, PIP, FULLSCREEN */}
              <div className="flex items-center gap-1 md:gap-4 ml-auto">


                  <div className="relative hidden md:block">
                      {isSubMenuOpen && (
                          <>
                              <div className="fixed inset-0 z-40" onClick={() => setIsSubMenuOpen(false)} />
                              <div className="absolute bottom-full right-0 mb-4 w-max min-w-[200px] z-50">
                                <div className="bg-black/90 backdrop-blur-xl border border-white/20 rounded-2xl overflow-hidden shadow-2xl flex flex-col py-3">
                                    <div className="px-5 py-2 text-xs font-black text-[#F042FF] border-b border-white/10 uppercase mb-1">Ngôn ngữ hỗ trợ</div>
                                    <button onClick={() => changeSubtitle(-1)} className={`px-5 py-3 text-base text-left hover:bg-white/20 transition-colors flex items-center gap-2 ${activeSubIndex === -1 ? 'text-[#F042FF]' : 'text-white/80'}`}>Tắt phụ đề</button>
                                    {subtitleTracks.length > 0 ? (
                                        subtitleTracks.map((track, idx) => (
                                            <button key={idx} onClick={() => changeSubtitle(idx)} className={`px-5 py-3 text-base text-left hover:bg-white/20 transition-colors flex items-center gap-2 ${activeSubIndex === idx ? 'text-[#F042FF] font-black' : 'text-white/80 font-bold'}`}>{track.name || track.label || track.language || `Ngôn ngữ ${idx + 1}`}</button>
                                        ))
                                    ) : (
                                        <div className="px-5 py-3 text-sm text-white/50 italic">Bản mặc định (Vietsub)</div>
                                    )}
                                </div>
                              </div>
                          </>
                      )}
                      <button onClick={() => { setIsSubMenuOpen(!isSubMenuOpen); setIsSpeedMenuOpen(false); }} className={`hover:scale-110 transition flex items-center justify-center cursor-pointer rounded-xl p-2 ${isSubMenuOpen || activeSubIndex !== -1 ? 'text-[#F042FF]' : 'text-white/80 hover:text-white'}`}><Subtitles className="w-6 h-6 md:w-7 md:h-7" /></button>
                  </div>

                  <div className="relative hidden md:block">
                      {isSpeedMenuOpen && (
                          <>
                              <div className="fixed inset-0 z-40" onClick={() => setIsSpeedMenuOpen(false)} />
                              <div className="absolute bottom-full right-0 mb-4 w-44 z-50">
                                <div className="bg-black/90 backdrop-blur-xl border border-white/20 rounded-2xl overflow-hidden shadow-2xl flex flex-col py-3">
                                    <div className="px-5 py-2 text-xs font-black text-[#F042FF] border-b border-white/10 uppercase mb-1">Tốc độ phát</div>
                                    {[0.5, 0.75, 1, 1.25, 1.5, 2].map(rate => (
                                        <button key={rate} onClick={() => changePlaybackRate(rate)} className={`px-5 py-2.5 text-base text-left hover:bg-white/20 transition-colors ${playbackRate === rate ? 'text-[#F042FF] font-black' : 'text-white/80 font-bold'}`}>{rate === 1 ? 'Chuẩn (1x)' : `${rate}x`}</button>
                                    ))}
                                </div>
                              </div>
                          </>
                      )}
                      <button onClick={() => { setIsSpeedMenuOpen(!isSpeedMenuOpen); setIsSubMenuOpen(false); }} className={`hover:scale-110 transition flex items-center justify-center cursor-pointer rounded-xl p-2 ${isSpeedMenuOpen || playbackRate !== 1 ? 'text-[#F042FF]' : 'text-white/80 hover:text-white'}`}><Settings className="w-6 h-6 md:w-7 md:h-7" /></button>
                  </div>

                  {/* PiP Button (Desktop only) */}
                  <button onClick={togglePiP} className="hidden md:flex text-white/80 hover:text-white hover:scale-110 transition items-center justify-center cursor-pointer rounded-xl p-2">
                      {isPiP ? <PictureInPicture2 className="w-6 h-6 md:w-7 md:h-7" /> : <PictureInPicture className="w-6 h-6 md:w-7 md:h-7" />}
                  </button>

                  <button onClick={toggleFullScreen} className="text-white/80 hover:text-white hover:scale-110 transition flex items-center justify-center cursor-pointer rounded-xl p-2">
                      {isFullscreen ? <Minimize className="w-6 h-6 md:w-7 md:h-7" /> : <Maximize className="w-6 h-6 md:w-7 md:h-7" />}
                  </button>
              </div>
          </div>
      </div>
    </div>
  );
}
