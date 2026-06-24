'use client';

import { useEffect, useState } from 'react';
import { usePathname } from 'next/navigation';
import { RotateCw } from 'lucide-react';

export default function OrientationGate() {
  const pathname = usePathname();
  const [isLandscapeMobile, setIsLandscapeMobile] = useState(false);

  useEffect(() => {
    const checkOrientation = () => {
      // Kích hoạt trên các thiết bị có chiều rộng màn hình nhỏ hơn 768px (Mobile)
      const isMobileSize = window.innerWidth < 768;
      // Kiểm tra xem màn hình có đang xoay ngang không (width > height)
      const isLandscape = window.innerWidth > window.innerHeight;
      
      // Không chặn xoay ngang trên trang chi tiết phim/xem phim (/phim/[slug])
      const isWatchPage = pathname?.startsWith('/phim/');

      setIsLandscapeMobile(isMobileSize && isLandscape && !isWatchPage);
    };

    // Kiểm tra ngay khi mount và khi thay đổi kích thước cửa sổ/xoay thiết bị
    checkOrientation();
    window.addEventListener('resize', checkOrientation);
    window.addEventListener('orientationchange', checkOrientation);

    return () => {
      window.removeEventListener('resize', checkOrientation);
      window.removeEventListener('orientationchange', checkOrientation);
    };
  }, [pathname]);

  if (!isLandscapeMobile) return null;

  return (
    <div className="fixed inset-0 z-[99999] bg-[#0a0a0c] flex flex-col items-center justify-center text-center p-6 select-none animate-fade-in">
      {/* Background glow effects */}
      <div className="absolute top-[-10%] left-[-10%] w-[50%] h-[50%] bg-purple-900/20 blur-[120px] rounded-full mix-blend-screen" />
      <div className="absolute bottom-[-10%] right-[-10%] w-[50%] h-[50%] bg-cyan-900/10 blur-[120px] rounded-full mix-blend-screen" />

      <div className="relative z-10 flex flex-col items-center max-w-sm gap-6">
        {/* Animated Device Rotation Icon */}
        <div className="relative w-24 h-24 flex items-center justify-center bg-white/5 border border-white/10 rounded-3xl shadow-2xl backdrop-blur-md">
          <div className="absolute w-12 h-20 border-2 border-white/40 rounded-xl flex items-center justify-center animate-pulse">
            <span className="w-1.5 h-1.5 rounded-full bg-white/40 absolute bottom-1.5" />
          </div>
          <RotateCw className="w-8 h-8 text-[#d070ff] animate-[spin_3s_linear_infinite]" />
        </div>

        <div className="flex flex-col gap-2">
          <h2 className="text-white font-black text-xl tracking-tight">Xoay dọc thiết bị</h2>
          <p className="text-white/60 text-sm leading-relaxed px-4">
            Vui lòng xoay dọc màn hình thiết bị của bạn để tiếp tục sử dụng ứng dụng Macflix.
          </p>
        </div>
      </div>
    </div>
  );
}
