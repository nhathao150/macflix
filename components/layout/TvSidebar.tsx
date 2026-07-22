'use client';

import { useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { usePathname } from 'next/navigation';
import { Home, Search, Heart, History, Grid, Globe, User, LogOut, Tv, Menu, X } from 'lucide-react';
import { useSession, signOut } from 'next-auth/react';
import { useTv } from '@/context/TvContext';

const NAV_ITEMS = [
  { name: 'Trang chủ', href: '/', icon: Home },
  { name: 'Tìm kiếm', href: '/tim-kiem', icon: Search },
  { name: 'Yêu thích', href: '/yeu-thich', icon: Heart },
  { name: 'Lịch sử xem', href: '/lich-su', icon: History },
  { name: 'Thể loại', href: '/the-loai/hanh-dong', icon: Grid },
  { name: 'Quốc gia', href: '/quoc-gia/trung-quoc', icon: Globe },
];

export default function TvSidebar() {
  const pathname = usePathname();
  const { data: session } = useSession();
  const { isTvMode } = useTv();
  const [isExpanded, setIsExpanded] = useState(false);

  if (!isTvMode) return null;

  // Lấy ra item hiện tại để hiển thị biểu tượng + tên trong Viên Thuốc (Pill Badge)
  const activeItem =
    NAV_ITEMS.find((item) =>
      item.href === '/' ? pathname === '/' : pathname.startsWith(item.href)
    ) || NAV_ITEMS[0];

  const ActiveIcon = activeItem.icon;

  return (
    <>
      {/* 1. TRẠNG THÁI THU NHỎ: VIÊN THUỐC (PILL BADGE) Ở GÓC TRÁI MÀN HÌNH */}
      {!isExpanded && (
        <div
          tabIndex={0}
          onMouseEnter={() => setIsExpanded(true)}
          onFocus={() => setIsExpanded(true)}
          onClick={() => setIsExpanded(true)}
          className="fixed top-6 left-6 z-[120] bg-[#0d0d12]/90 border border-white/20 px-4 py-2.5 rounded-full shadow-[0_10px_30px_rgba(0,0,0,0.8)] backdrop-blur-xl flex items-center gap-3 cursor-pointer focus:outline-none focus:ring-4 focus:ring-[#F042FF] focus:scale-105 transition-all duration-200 animate-in fade-in"
        >
          <div className="w-8 h-8 rounded-full bg-gradient-to-tr from-[#7226FF] to-[#F042FF] flex items-center justify-center shadow-md shrink-0">
            <ActiveIcon className="w-4 h-4 text-white" />
          </div>
          <span className="font-extrabold text-white text-sm tracking-wide">
            {activeItem.name}
          </span>
          <Menu className="w-4 h-4 text-white/50 ml-1" />
        </div>
      )}

      {/* 2. TRẠNG THÁI MỞ RỘNG: THANH MENU DỌC TV CHUYÊN NGHIỆP */}
      {isExpanded && (
        <aside
          onMouseLeave={() => setIsExpanded(false)}
          onBlur={(e) => {
            if (!e.currentTarget.contains(e.relatedTarget as Node)) {
              setIsExpanded(false);
            }
          }}
          className="fixed top-0 left-0 bottom-0 z-[130] w-[280px] bg-[#0d0d12]/95 backdrop-blur-2xl border-r border-white/10 flex flex-col justify-between py-6 px-4 transition-all duration-300 ease-out shadow-[20px_0_50px_rgba(0,0,0,0.9)] animate-in slide-in-from-left duration-200"
        >
          {/* Top: Brand Logo */}
          <div className="w-full flex items-center justify-between px-2 py-2">
            <div className="flex items-center gap-3">
              <div className="w-11 h-11 shrink-0 rounded-2xl bg-gradient-to-tr from-[#7226FF] to-[#F042FF] flex items-center justify-center shadow-[0_0_20px_rgba(240,66,255,0.4)]">
                <Tv className="w-6 h-6 text-white" />
              </div>
              <div className="flex flex-col whitespace-nowrap">
                <span className="font-black text-xl tracking-wider text-white">MACFLIX</span>
                <span className="text-[10px] font-bold tracking-widest text-[#F042FF] uppercase">TV Mode</span>
              </div>
            </div>
            <button
              onClick={() => setIsExpanded(false)}
              className="p-2 text-white/60 hover:text-white rounded-lg focus:outline-none focus:ring-2 focus:ring-[#F042FF]"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Middle: Nav Links */}
          <nav className="w-full flex-1 my-6 space-y-2 flex flex-col">
            {NAV_ITEMS.map((item) => {
              const Icon = item.icon;
              const isActive = pathname === item.href || (item.href !== '/' && pathname.startsWith(item.href));

              return (
                <Link
                  key={item.href}
                  href={item.href}
                  tabIndex={0}
                  onClick={() => setIsExpanded(false)}
                  className={`w-full flex items-center justify-start px-4 h-12 rounded-2xl transition-all duration-200 cursor-pointer focus:outline-none focus:ring-2 focus:ring-[#F042FF] focus:scale-105 ${
                    isActive
                      ? 'bg-gradient-to-r from-[#7226FF] to-[#F042FF] text-white shadow-[0_0_20px_rgba(114,38,255,0.5)] font-extrabold'
                      : 'text-white/60 hover:text-white hover:bg-white/10 focus:bg-white/20'
                  }`}
                >
                  <Icon className="w-5 h-5 shrink-0" />
                  <span className="ml-3.5 text-base font-semibold whitespace-nowrap">
                    {item.name}
                  </span>
                </Link>
              );
            })}
          </nav>

          {/* Bottom: User Profile / Logout */}
          <div className="w-full border-t border-white/10 pt-4 space-y-2 flex flex-col">
            {session?.user ? (
              <div className="w-full space-y-2">
                <div className="w-full flex items-center justify-start px-2 py-1.5 rounded-xl">
                  <div className="w-10 h-10 shrink-0 rounded-full bg-purple-950 border border-purple-500/50 flex items-center justify-center overflow-hidden">
                    {session.user.image ? (
                      <Image src={session.user.image} alt="Avatar" width={40} height={40} className="object-cover" />
                    ) : (
                      <User className="w-5 h-5 text-purple-300" />
                    )}
                  </div>
                  <div className="flex flex-col min-w-0 flex-1 ml-3 whitespace-nowrap">
                    <span className="text-sm font-bold text-white truncate">{session.user.name || 'Người dùng TV'}</span>
                    <span className="text-[11px] text-white/50 truncate">{session.user.email}</span>
                  </div>
                </div>

                <button
                  tabIndex={0}
                  onClick={() => {
                    signOut();
                    setIsExpanded(false);
                  }}
                  className="w-full flex items-center justify-start px-4 h-11 rounded-2xl text-red-400 hover:bg-red-500/10 focus:bg-red-500/20 focus:ring-2 focus:ring-red-500 focus:outline-none transition-all cursor-pointer"
                >
                  <LogOut className="w-5 h-5 shrink-0" />
                  <span className="ml-3.5 text-sm font-bold whitespace-nowrap">Đăng xuất</span>
                </button>
              </div>
            ) : (
              <Link
                href="/dang-nhap"
                tabIndex={0}
                onClick={() => setIsExpanded(false)}
                className="w-full flex items-center justify-start px-4 h-11 rounded-2xl bg-white/10 hover:bg-white/20 focus:ring-2 focus:ring-purple-500 text-white font-bold transition-all"
              >
                <User className="w-5 h-5 shrink-0" />
                <span className="ml-3.5 text-sm font-bold whitespace-nowrap">Đăng nhập</span>
              </Link>
            )}
          </div>
        </aside>
      )}
    </>
  );
}
