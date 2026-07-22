'use client';

import { useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { usePathname } from 'next/navigation';
import { Home, Search, Heart, History, Grid, Globe, User, LogOut, Tv } from 'lucide-react';
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

  return (
    <aside
      onMouseEnter={() => setIsExpanded(true)}
      onMouseLeave={() => setIsExpanded(false)}
      onFocus={() => setIsExpanded(true)}
      onBlur={(e) => {
        if (!e.currentTarget.contains(e.relatedTarget as Node)) {
          setIsExpanded(false);
        }
      }}
      className={`fixed top-0 left-0 bottom-0 z-[120] bg-[#0d0d12]/95 backdrop-blur-2xl border-r border-white/10 flex flex-col justify-between py-6 transition-all duration-300 ease-out shadow-[10px_0_30px_rgba(0,0,0,0.8)] ${
        isExpanded ? 'w-[260px] px-4' : 'w-[88px] px-3'
      }`}
    >
      {/* Top: Brand Logo */}
      <div className={`w-full flex items-center ${isExpanded ? 'justify-start px-2' : 'justify-center'} py-2`}>
        <div className="w-12 h-12 shrink-0 rounded-2xl bg-gradient-to-tr from-[#7226FF] to-[#F042FF] flex items-center justify-center shadow-[0_0_20px_rgba(240,66,255,0.4)]">
          <Tv className="w-6 h-6 text-white" />
        </div>
        {isExpanded && (
          <div className="flex flex-col whitespace-nowrap ml-3 animate-in fade-in duration-200">
            <span className="font-black text-xl tracking-wider text-white">MACFLIX</span>
            <span className="text-[10px] font-bold tracking-widest text-[#F042FF] uppercase">TV Mode</span>
          </div>
        )}
      </div>

      {/* Middle: Nav Links */}
      <nav className="w-full flex-1 my-6 space-y-3 flex flex-col items-center">
        {NAV_ITEMS.map((item) => {
          const Icon = item.icon;
          const isActive = pathname === item.href || (item.href !== '/' && pathname.startsWith(item.href));

          return (
            <Link
              key={item.href}
              href={item.href}
              tabIndex={0}
              title={item.name}
              className={`w-full flex items-center ${
                isExpanded ? 'justify-start px-4' : 'justify-center'
              } h-12 rounded-2xl transition-all duration-300 cursor-pointer focus:outline-none focus:ring-2 focus:ring-[#F042FF] focus:scale-105 ${
                isActive
                  ? 'bg-gradient-to-r from-[#7226FF] to-[#F042FF] text-white shadow-[0_0_20px_rgba(114,38,255,0.5)] font-bold'
                  : 'text-white/60 hover:text-white hover:bg-white/10 focus:bg-white/20'
              }`}
            >
              <Icon className="w-6 h-6 shrink-0" />
              {isExpanded && (
                <span className="ml-3.5 text-base font-semibold whitespace-nowrap animate-in fade-in duration-200">
                  {item.name}
                </span>
              )}
            </Link>
          );
        })}
      </nav>

      {/* Bottom: User Profile / Logout */}
      <div className="w-full border-t border-white/10 pt-4 space-y-2 flex flex-col items-center">
        {session?.user ? (
          <div className="w-full space-y-2">
            <div className={`w-full flex items-center ${isExpanded ? 'justify-start px-2' : 'justify-center'} py-1.5 rounded-xl`}>
              <div className="w-10 h-10 shrink-0 rounded-full bg-purple-950 border border-purple-500/50 flex items-center justify-center overflow-hidden">
                {session.user.image ? (
                  <Image src={session.user.image} alt="Avatar" width={40} height={40} className="object-cover" />
                ) : (
                  <User className="w-5 h-5 text-purple-300" />
                )}
              </div>
              {isExpanded && (
                <div className="flex flex-col min-w-0 flex-1 ml-3 whitespace-nowrap animate-in fade-in duration-200">
                  <span className="text-sm font-bold text-white truncate">{session.user.name || 'Người dùng TV'}</span>
                  <span className="text-[11px] text-white/50 truncate">{session.user.email}</span>
                </div>
              )}
            </div>

            <button
              tabIndex={0}
              onClick={() => signOut()}
              title="Đăng xuất"
              className={`w-full flex items-center ${
                isExpanded ? 'justify-start px-4' : 'justify-center'
              } h-11 rounded-2xl text-red-400 hover:bg-red-500/10 focus:bg-red-500/20 focus:ring-2 focus:ring-red-500 focus:outline-none transition-all cursor-pointer`}
            >
              <LogOut className="w-5 h-5 shrink-0" />
              {isExpanded && <span className="ml-3.5 text-sm font-bold whitespace-nowrap">Đăng xuất</span>}
            </button>
          </div>
        ) : (
          <Link
            href="/dang-nhap"
            tabIndex={0}
            className={`w-full flex items-center ${
              isExpanded ? 'justify-start px-4' : 'justify-center'
            } h-11 rounded-2xl bg-white/10 hover:bg-white/20 focus:ring-2 focus:ring-purple-500 text-white font-bold transition-all`}
          >
            <User className="w-5 h-5 shrink-0" />
            {isExpanded && <span className="ml-3.5 text-sm font-bold whitespace-nowrap">Đăng nhập</span>}
          </Link>
        )}
      </div>
    </aside>
  );
}
