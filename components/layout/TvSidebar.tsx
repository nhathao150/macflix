'use client';

import { useState, useEffect, useRef } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { usePathname, useRouter } from 'next/navigation';
import { Home, Search, Heart, History, Grid, Globe, LogOut, Menu } from 'lucide-react';
import { useSession, signOut } from 'next-auth/react';
import { useTv } from '@/context/TvContext';

const NAV_ITEMS = [
  { name: 'Tìm kiếm', href: '/tim-kiem', icon: Search },
  { name: 'Trang chủ', href: '/', icon: Home },
  { name: 'Yêu thích', href: '/yeu-thich', icon: Heart },
  { name: 'Lịch sử xem', href: '/lich-su', icon: History },
  { name: 'Thể loại', href: '/the-loai/hanh-dong', icon: Grid },
  { name: 'Quốc gia', href: '/quoc-gia/trung-quoc', icon: Globe },
];

export default function TvSidebar() {
  const pathname = usePathname();
  const router = useRouter();
  const { data: session } = useSession();
  const { isTvMode } = useTv();
  const [isExpanded, setIsExpanded] = useState(false);
  const [clock, setClock] = useState('');
  const pillRef = useRef<HTMLDivElement>(null);

  // Cập nhật đồng hồ thời gian thực HH:mm (VD: 12:00)
  useEffect(() => {
    const updateClock = () => {
      const now = new Date();
      const hours = String(now.getHours()).padStart(2, '0');
      const minutes = String(now.getMinutes()).padStart(2, '0');
      setClock(`${hours}:${minutes}`);
    };
    updateClock();
    const interval = setInterval(updateClock, 10000);
    return () => clearInterval(interval);
  }, []);

  if (!isTvMode) return null;

  // Lấy ra item hiện tại
  const activeItem =
    NAV_ITEMS.find((item) =>
      item.href === '/' ? pathname === '/' : pathname.startsWith(item.href)
    ) || NAV_ITEMS[1];

  const ActiveIcon = activeItem.icon;
  const userName = session?.user?.name || 'Nhật Hảo';

  // Hàm mở menu khi người dùng BẤM NÚT GIỮA / OK / ENTER trên remote
  const handleOpenMenu = () => {
    setIsExpanded(true);
    setTimeout(() => {
      const container = document.getElementById('tv-menu-card');
      if (container) {
        const firstFocusable = container.querySelector('a[tabIndex="0"], button[tabIndex="0"]') as HTMLElement;
        firstFocusable?.focus();
      }
    }, 100);
  };

  const handleCloseMenu = () => {
    setIsExpanded(false);
    setTimeout(() => {
      pillRef.current?.focus();
    }, 50);
  };

  return (
    <>
      {/* 1. TRẠNG THÁI THU NHỎ: VIÊN THUỐC (PILL BADGE TO RÕ NÉT CHO TV 4K 55-INCH) */}
      {!isExpanded && (
        <div
          ref={pillRef}
          tabIndex={0}
          onClick={handleOpenMenu}
          onKeyDown={(e) => {
            if (e.key === 'Enter' || e.key === ' ' || e.keyCode === 13) {
              e.preventDefault();
              e.stopPropagation();
              handleOpenMenu();
            }
          }}
          className="fixed top-8 left-12 md:left-16 z-[120] bg-[#2a2d35]/90 border border-white/20 px-5 py-3 rounded-full shadow-[0_15px_35px_rgba(0,0,0,0.8)] backdrop-blur-xl flex items-center gap-3.5 cursor-pointer focus:outline-none focus:ring-4 focus:ring-[#F042FF] focus:scale-105 transition-all duration-200 animate-in fade-in"
        >
          <div className="w-9 h-9 rounded-full bg-gradient-to-tr from-[#7226FF] to-[#F042FF] flex items-center justify-center shadow-md shrink-0">
            <ActiveIcon className="w-5 h-5 text-white" />
          </div>
          <span className="font-black text-white text-base tracking-wide">
            {activeItem.name}
          </span>
          {clock && <span className="text-sm text-white/60 font-extrabold ml-1">{clock}</span>}
          <Menu className="w-5 h-5 text-white/50 ml-0.5" />
        </div>
      )}

      {/* 2. TRẠNG THÁI MỞ RỘNG: CARD OVERLAY NỔI KHÓA TIÊU ĐIỂM BÊN TRONG (FOCUS TRAP) */}
      {isExpanded && (
        <div
          id="tv-menu-card"
          onKeyDown={(e) => {
            // Ngăn sự kiện phím thoát ra giao diện trang bên ngoài khi đang mở Menu
            e.stopPropagation();

            // Bấm Escape, Phím Back Remote, hoặc Phím Phải để đóng/thu nhỏ Menu
            if (
              e.key === 'Escape' || 
              e.key === 'Back' || 
              e.key === 'GoBack' || 
              e.key === 'BrowserBack' || 
              e.key === 'ArrowRight' ||
              e.keyCode === 27 || 
              e.keyCode === 8 || 
              e.keyCode === 10009 || 
              e.keyCode === 461
            ) {
              e.preventDefault();
              handleCloseMenu();
              return;
            }

            // Điều hướng D-Pad Lên / Xuống gói gọn 100% bên trong Menu
            const container = document.getElementById('tv-menu-card');
            if (!container) return;
            const focusables = Array.from(
              container.querySelectorAll<HTMLElement>('a[tabIndex="0"], button[tabIndex="0"]')
            );
            const currentIndex = focusables.indexOf(document.activeElement as HTMLElement);

            if (e.key === 'ArrowDown') {
              e.preventDefault();
              if (currentIndex >= 0 && currentIndex < focusables.length - 1) {
                focusables[currentIndex + 1]?.focus();
              } else {
                focusables[0]?.focus(); // Vòng lại phần tử đầu tiên
              }
            } else if (e.key === 'ArrowUp') {
              e.preventDefault();
              if (currentIndex > 0) {
                focusables[currentIndex - 1]?.focus();
              } else {
                focusables[focusables.length - 1]?.focus(); // Vòng xuống phần tử cuối cùng
              }
            }
          }}
          onBlur={(e) => {
            if (!e.currentTarget.contains(e.relatedTarget as Node)) {
              handleCloseMenu();
            }
          }}
          className="fixed top-8 left-12 md:left-16 z-[130] w-[360px] bg-[#23262d]/95 backdrop-blur-3xl border border-white/20 rounded-[36px] p-5 shadow-[0_35px_90px_rgba(0,0,0,0.9)] flex flex-col gap-4 animate-in zoom-in-95 duration-200"
        >
          {/* HEADER: AVATAR + TÊN NGƯỜI DÙNG + ĐỒNG HỒ */}
          <div className="flex items-center justify-between px-2 pt-1 pb-3 border-b border-white/10">
            <div className="flex items-center gap-3.5 min-w-0">
              <div className="w-12 h-12 shrink-0 rounded-full bg-white/15 border border-white/20 flex items-center justify-center font-black text-base text-white overflow-hidden shadow-inner">
                {session?.user?.image ? (
                  <Image src={session.user.image} alt="Avatar" width={48} height={48} className="object-cover" />
                ) : (
                  <span>NH</span>
                )}
              </div>
              <span className="font-black text-white text-lg truncate max-w-[170px]">
                {userName}
              </span>
            </div>
            {clock && (
              <span className="text-gray-300 font-extrabold text-base tracking-wider pr-1">
                {clock}
              </span>
            )}
          </div>

          {/* DANH SÁCH MENU DẠNG VIÊN THUỐC BO TRÒN SCALED HD */}
          <nav className="flex flex-col gap-2 my-1">
            {NAV_ITEMS.map((item) => {
              const Icon = item.icon;
              const isActive = pathname === item.href || (item.href !== '/' && pathname.startsWith(item.href));

              return (
                <Link
                  key={item.href}
                  href={item.href}
                  tabIndex={0}
                  onClick={() => setIsExpanded(false)}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter' || e.key === ' ' || e.keyCode === 13) {
                      e.preventDefault();
                      e.stopPropagation();
                      setIsExpanded(false);
                      router.push(item.href);
                    }
                  }}
                  className={`flex items-center gap-4 px-5 py-3.5 rounded-full transition-all duration-150 cursor-pointer focus:outline-none focus:ring-4 focus:ring-[#F042FF] ${
                    isActive
                      ? 'bg-[#f0f0f2] text-black font-black shadow-md scale-100'
                      : 'text-white/80 hover:bg-white/10 hover:text-white focus:bg-white focus:text-black font-bold'
                  }`}
                >
                  <Icon className={`w-6 h-6 shrink-0 ${isActive ? 'text-black' : 'text-white'}`} />
                  <span className="text-lg tracking-wide">{item.name}</span>
                </Link>
              );
            })}

            {/* NÚT ĐĂNG XUẤT */}
            {session?.user && (
              <button
                tabIndex={0}
                onClick={() => {
                  signOut();
                  setIsExpanded(false);
                }}
                onKeyDown={(e) => {
                  if (e.key === 'Enter' || e.key === ' ' || e.keyCode === 13) {
                    e.preventDefault();
                    e.stopPropagation();
                    signOut();
                    setIsExpanded(false);
                  }
                }}
                className="flex items-center gap-4 px-5 py-3.5 rounded-full text-red-400 hover:bg-red-500/15 focus:bg-red-500 focus:text-white focus:ring-4 focus:ring-red-500 focus:outline-none transition-all cursor-pointer font-bold mt-1"
              >
                <LogOut className="w-6 h-6 shrink-0" />
                <span className="text-lg tracking-wide">Đăng xuất</span>
              </button>
            )}
          </nav>
        </div>
      )}
    </>
  );
}
