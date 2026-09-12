'use client';

import { Smartphone } from 'lucide-react';
import { useEffect, useState } from 'react';

export default function LandscapeBlocker() {
  const [isFullscreen, setIsFullscreen] = useState(false);

  useEffect(() => {
    // Nếu đang bật chế độ toàn màn hình (xem video), thì không hiển thị màn hình chặn
    const handleFullscreenChange = () => {
      setIsFullscreen(!!document.fullscreenElement);
    };

    document.addEventListener('fullscreenchange', handleFullscreenChange);
    document.addEventListener('webkitfullscreenchange', handleFullscreenChange); // Dành cho iOS/Safari cũ

    return () => {
      document.removeEventListener('fullscreenchange', handleFullscreenChange);
      document.removeEventListener('webkitfullscreenchange', handleFullscreenChange);
    };
  }, []);

  if (isFullscreen) return null;

  return (
    <>
      
      <div 
        id="landscape-blocker" 
        className="fixed inset-0 z-[999999] bg-[#0a0a0c] hidden flex-col items-center justify-center text-center p-6"
      >
        <div className="w-24 h-24 rounded-full bg-white/5 flex items-center justify-center mb-6 animate-pulse">
            <Smartphone className="w-12 h-12 text-[#F042FF] rotate-90" />
        </div>
        <h2 className="text-2xl font-black text-white mb-3">Vui lòng xoay dọc màn hình</h2>
        <p className="text-white/60 text-lg max-w-sm">
          Giao diện hiện tại được tối ưu tốt nhất cho trải nghiệm cầm dọc điện thoại.
        </p>
      </div>
    </>
  );
}
