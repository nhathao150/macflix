'use client';

import { useState, useEffect, useRef } from 'react';
import { createPortal } from 'react-dom';
import Link from 'next/link';
import Image from 'next/image';
import { useRouter, usePathname } from 'next/navigation';
import { Search, User, ChevronDown, Menu, LogOut, History, Settings, Heart } from 'lucide-react';
import { searchMovies } from '@/services/movie.service';
import { useSession, signOut } from 'next-auth/react';

const GENRES = [
  { name: 'Hành Động', slug: 'hanh-dong' }, { name: 'Tình Cảm', slug: 'tinh-cam' }, { name: 'Hài Hước', slug: 'hai-huoc' },
  { name: 'Cổ Trang', slug: 'co-trang' }, { name: 'Tâm Lý', slug: 'tam-ly' }, { name: 'Hình Sự', slug: 'hinh-su' },
  { name: 'Chiến Tranh', slug: 'chien-tranh' }, { name: 'Thể Thao', slug: 'the-thao' }, { name: 'Võ Thuật', slug: 'vo-thuat' },
  { name: 'Viễn Tưởng', slug: 'vien-tuong' }, { name: 'Phiêu Lưu', slug: 'phieu-luu' }, { name: 'Khoa Học', slug: 'khoa-hoc' },
  { name: 'Kinh Dị', slug: 'kinh-di' }, { name: 'Âm Nhạc', slug: 'am-nhac' }, { name: 'Thần Thoại', slug: 'than-thoai' },
  { name: 'Tài Liệu', slug: 'tai-lieu' }, { name: 'Gia Đình', slug: 'gia-dinh' }, { name: 'Chính kịch', slug: 'chinh-kich' },
  { name: 'Bí ẩn', slug: 'bi-an' }, { name: 'Học Đường', slug: 'hoc-duong' }, { name: 'Kinh Điển', slug: 'kinh-dien' },
  { name: 'Phim 18+', slug: 'phim-18' }
];

const COUNTRIES = [
  { name: 'Trung Quốc', slug: 'trung-quoc' }, { name: 'Hàn Quốc', slug: 'han-quoc' }, { name: 'Nhật Bản', slug: 'nhat-ban' }, { name: 'Thái Lan', slug: 'thai-lan' }, { name: 'Âu Mỹ', slug: 'au-my' },
  { name: 'Đài Loan', slug: 'dai-loan' }, { name: 'Hồng Kông', slug: 'hong-kong' }, { name: 'Ấn Độ', slug: 'an-do' }, { name: 'Anh', slug: 'anh' }, { name: 'Pháp', slug: 'phap' },
  { name: 'Canada', slug: 'canada' }, { name: 'Quốc Gia Khác', slug: 'quoc-gia-khac' }, { name: 'Đức', slug: 'duc' }, { name: 'Tây Ban Nha', slug: 'tay-ban-nha' }, { name: 'Thổ Nhĩ Kỳ', slug: 'tho-nhi-ky' },
  { name: 'Hà Lan', slug: 'ha-lan' }, { name: 'Indonesia', slug: 'indonesia' }, { name: 'Nga', slug: 'nga' }, { name: 'Mexico', slug: 'mexico' }, { name: 'Ba lan', slug: 'ba-lan' },
  { name: 'Úc', slug: 'uc' }, { name: 'Thụy Điển', slug: 'thuy-dien' }, { name: 'Malaysia', slug: 'malaysia' }, { name: 'Brazil', slug: 'brazil' }, { name: 'Philippines', slug: 'philippines' },
  { name: 'Bồ Đào Nha', slug: 'bo-dao-nha' }, { name: 'Ý', slug: 'y' }, { name: 'Đan Mạch', slug: 'dan-mach' }, { name: 'UAE', slug: 'uae' }, { name: 'Na Uy', slug: 'na-uy' },
  { name: 'Thụy Sĩ', slug: 'thuy-si' }, { name: 'Châu Phi', slug: 'chau-phi' }, { name: 'Nam Phi', slug: 'nam-phi' }, { name: 'Ukraina', slug: 'ukraina' }, { name: 'Ả Rập Xê Út', slug: 'a-rap-xe-ut' },
  { name: 'Bỉ', slug: 'bi' }, { name: 'Ireland', slug: 'ireland' }, { name: 'Colombia', slug: 'colombia' }, { name: 'Phần Lan', slug: 'phan-lan' }, { name: 'Việt Nam', slug: 'viet-nam' },
  { name: 'Chile', slug: 'chile' }, { name: 'Hy Lạp', slug: 'hy-lap' }, { name: 'Nigeria', slug: 'nigeria' }, { name: 'Argentina', slug: 'argentina' }, { name: 'Singapore', slug: 'singapore' }
];

export default function Navbar() {
  const { data: session } = useSession();
  const router = useRouter();
  const pathname = usePathname();

  const [userAvatar, setUserAvatar] = useState<string>('');

  const [searchTerm, setSearchTerm] = useState('');
  const [searchResults, setSearchResults] = useState<any[]>([]);
  const [isSearching, setIsSearching] = useState(false);
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [mobileTab, setMobileTab] = useState<'genre' | 'country'>('genre');
  const [openDropdown, setOpenDropdown] = useState<'genre' | 'country' | null>(null);
  const navRef = useRef<HTMLDivElement>(null);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  // Khóa scroll body khi mở modal tìm kiếm
  useEffect(() => {
    if (isSearchOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }
    return () => {
      document.body.style.overflow = '';
    };
  }, [isSearchOpen]);

  // Lắng nghe phím ESC để đóng khung tìm kiếm
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        setIsSearchOpen(false);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  // Fetch avatar khi user đăng nhập
  useEffect(() => {
    let cancelled = false;
    const email = session?.user?.email;
    const fetchAvatar = async () => {
      if (!email) { if (!cancelled) setUserAvatar(''); return; }
      try {
        const r = await fetch(`/api/profile?email=${email}`);
        const d = await r.json();
        if (!cancelled) setUserAvatar(d.avatar || '');
      } catch { if (!cancelled) setUserAvatar(''); }
    };
    fetchAvatar();
    return () => { cancelled = true; };
  }, [session?.user?.email]);

  // Đóng mobile menu khi xoay ngang thiết bị (sang chế độ desktop)
  useEffect(() => {
    const mql = window.matchMedia("(orientation: landscape)");
    const handleOrientationChange = () => {
      if (mql.matches) setIsMobileMenuOpen(false);
    };
    mql.addEventListener("change", handleOrientationChange);
    if (mql.matches) setIsMobileMenuOpen(false);
    return () => mql.removeEventListener("change", handleOrientationChange);
  }, []);

  // Đóng dropdown khi click ra ngoài navbar
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (navRef.current && !navRef.current.contains(e.target as Node)) {
        setOpenDropdown(null);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  useEffect(() => {
    const delayDebounceFn = setTimeout(async () => {
      if (searchTerm.trim()) {
        setIsSearching(true);
        const results = await searchMovies(searchTerm);
        setSearchResults(results);
        setIsSearching(false);
      } else {
        setSearchResults([]);
      }
    }, 500);
    return () => clearTimeout(delayDebounceFn);
  }, [searchTerm]);

  const closeDropdown = () => {
    setOpenDropdown(null);
  };

  const handleSearchSubmit = () => {
    if (!searchTerm.trim()) return;
    setSearchResults([]);
    setIsSearchOpen(false);
    router.push(`/search?q=${encodeURIComponent(searchTerm.trim())}`);
    setSearchTerm('');
  };

  return (
    <div ref={navRef} className="absolute md:fixed top-0 left-0 w-full z-[100] flex justify-center pointer-events-none">
      <nav className="pointer-events-auto flex items-center justify-between w-[95%] max-w-6xl mt-3 md:mt-6 rounded-full px-4 md:px-8 py-2 md:py-3 transition-all duration-300 md:backdrop-blur-3xl md:shadow-[0_24px_50px_-12px_rgba(0,0,0,0.6),inset_0_1px_1px_rgba(255,255,255,0.08)] md:bg-[#0a0a0c]/60 md:border md:border-white/[0.08] border-none bg-transparent shadow-none backdrop-blur-none relative">
        
        {/* LOGO */}
        <div className="hidden md:flex items-center shrink-0">
          <Link href="/" className="flex items-center group">
            <svg
              viewBox="0 0 160 44"
              className="h-7 md:h-9 transition-opacity duration-200 group-hover:opacity-80"
              aria-label="Macflix"
              xmlns="http://www.w3.org/2000/svg"
            >
              <defs>
                <linearGradient id="macflix-grad" x1="0%" y1="0%" x2="0%" y2="100%">
                  <stop offset="0%" stopColor="#d070ff" />
                  <stop offset="100%" stopColor="#7226FF" />
                </linearGradient>
              </defs>
              <text
                x="4"
                y="36"
                fontFamily="'Arial Black', 'Helvetica Neue', Arial, sans-serif"
                fontWeight="900"
                fontSize="38"
                fontStyle="italic"
                fill="url(#macflix-grad)"
                letterSpacing="-1"
              >
                Macflix
              </text>
            </svg>
          </Link>
        </div>

        {/* MENU CHÍNH */}
        <div className="hidden md:flex items-center gap-6 text-sm font-medium text-white/80 md:absolute md:left-1/2 md:-translate-x-1/2">
          <Link href="/" className="hover:text-white transition-colors">Trang chủ</Link>
          
          <div className="relative py-2">
            <button
              onClick={() => setOpenDropdown(openDropdown === 'genre' ? null : 'genre')}
              className={`flex items-center gap-1 transition-colors ${
                openDropdown === 'genre'
                  ? 'text-white'
                  : 'text-white/80 hover:text-white'
              }`}
            >
              Thể loại
              <ChevronDown className={`w-4 h-4 transition-transform duration-200 ${
                openDropdown === 'genre' ? 'rotate-180' : ''
              }`} />
            </button>
            {openDropdown === 'genre' && (
              <div className="absolute top-full left-0 pt-4 w-[450px] z-50">
                <div className="bg-[#141414]/95 backdrop-blur-xl border border-white/10 rounded-2xl shadow-2xl flex flex-col p-4">
                  <div className="grid grid-cols-3 gap-x-2 gap-y-1">
                    {GENRES.map((genre) => (
                      <Link
                        key={genre.slug} href={`/genres/${genre.slug}`} onClick={closeDropdown}
                        className="px-3 py-2 text-xs font-medium text-white/70 hover:bg-white/10 hover:text-white rounded-lg transition-colors"
                      >
                        {genre.name}
                      </Link>
                    ))}
                  </div>
                </div>
              </div>
            )}
          </div>

          <div className="relative py-2">
            <button
              onClick={() => setOpenDropdown(openDropdown === 'country' ? null : 'country')}
              className={`flex items-center gap-1 transition-colors ${
                openDropdown === 'country'
                  ? 'text-white'
                  : 'text-white/80 hover:text-white'
              }`}
            >
              Quốc Gia
              <ChevronDown className={`w-4 h-4 transition-transform duration-200 ${
                openDropdown === 'country' ? 'rotate-180' : ''
              }`} />
            </button>
            {openDropdown === 'country' && (
              <div className="absolute top-full left-1/2 -translate-x-1/2 pt-4 w-[750px] z-50">
                <div className="bg-[#141414]/95 backdrop-blur-xl border border-white/10 rounded-2xl shadow-2xl flex flex-col p-5">
                  <div className="grid grid-cols-5 gap-x-2 gap-y-2">
                    {COUNTRIES.map((country) => (
                      <Link
                        key={country.slug} href={`/countries/${country.slug}`} onClick={closeDropdown}
                        className="px-3 py-2 text-sm text-white/70 hover:bg-white/10 hover:text-white rounded-lg transition-colors"
                      >
                        {country.name}
                      </Link>
                    ))}
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* --- CÔNG CỤ PHẢI --- */}
        <div className="flex items-center gap-4 md:gap-6 text-gray-700 dark:text-white/80 shrink-0 ml-auto">
          
          {/* TÌM KIẾM */}
          <div className="hidden lg:flex relative items-center">
            {/* Nút kích hoạt dạng icon */}
            <button
              onClick={() => {
                setIsSearchOpen(true);
                setSearchTerm('');
                setSearchResults([]);
              }}
              className="w-9 h-9 rounded-full bg-white/5 border border-white/10 flex items-center justify-center text-white/50 hover:text-white hover:border-white/20 transition-all duration-200 active-scale cursor-pointer"
              aria-label="Tìm kiếm phim"
            >
              <Search className="w-4 h-4" />
            </button>

            {/* Modal Tìm kiếm */}
            {isSearchOpen && mounted && createPortal(
              <>
                {/* Backdrop overlay */}
                <div 
                  onClick={() => setIsSearchOpen(false)}
                  className="fixed inset-0 bg-black/75 backdrop-blur-md transition-all z-[150] pointer-events-auto"
                />

                {/* Dialog container */}
                <div className="fixed top-[15vh] left-1/2 -translate-x-1/2 w-full max-w-xl bg-[#141414]/95 border border-white/10 rounded-3xl p-6 shadow-[0_24px_50px_rgba(0,0,0,0.8)] z-[160] pointer-events-auto flex flex-col gap-6 animate-in fade-in zoom-in-95 duration-200">
                  {/* Ô nhập từ khóa */}
                  <div className="flex items-center gap-3 bg-black/40 border border-white/15 focus-within:border-[#F042FF]/50 rounded-2xl px-4 py-3.5 transition-all">
                    <Search className="w-5 h-5 text-white/40" />
                    <input
                      type="text"
                      placeholder="Tìm kiếm phim..."
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      onKeyDown={(e) => e.key === 'Enter' && handleSearchSubmit()}
                      className="bg-transparent border-none outline-none text-base text-white w-full placeholder:text-white/30"
                      autoFocus
                    />
                  </div>

                  {/* Trạng thái kết quả tìm kiếm */}
                  <div className="flex-1 max-h-[50vh] overflow-y-auto pr-1 scrollbar-hide">
                    {!searchTerm.trim() || searchTerm.trim().length < 2 ? (
                      <div className="py-12 flex flex-col items-center justify-center text-center gap-3">
                        <Search className="w-12 h-12 text-white/10" />
                        <p className="text-white/40 text-sm font-semibold">Nhập từ khóa để tìm kiếm phim</p>
                        <p className="text-white/20 text-xs font-medium">Tối thiểu 2 ký tự</p>
                      </div>
                    ) : isSearching ? (
                      <div className="py-12 flex justify-center items-center">
                        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#d070ff]"></div>
                      </div>
                    ) : searchResults.length > 0 ? (
                      <div className="flex flex-col gap-2">
                        {searchResults.map((movie) => (
                          <Link 
                            href={`/movies/${movie.slug}`} 
                            key={movie.id} 
                            onClick={() => {
                              setIsSearchOpen(false);
                              setSearchTerm('');
                            }} 
                            className="flex items-center gap-3.5 p-2.5 hover:bg-white/5 rounded-2xl transition-all group"
                          >
                            <Image 
                              src={movie.imageSrc || '/placeholder-image.jpg'} 
                              alt={movie.title} 
                              width={44} 
                              height={62} 
                              className="w-11 h-[62px] object-cover rounded-xl shadow-md group-hover:scale-105 transition-transform" 
                              referrerPolicy="no-referrer"
                            />
                            <div className="flex flex-col">
                              <span className="text-sm font-bold text-white group-hover:text-[#d070ff] transition-colors line-clamp-1">{movie.title}</span>
                              <span className="text-[10px] text-white/40 uppercase tracking-wider mt-0.5">Xem chi tiết</span>
                            </div>
                          </Link>
                        ))}
                        {/* Nút xem tất cả */}
                        <button
                          onClick={handleSearchSubmit}
                          className="mt-3 py-3 rounded-2xl text-xs font-bold text-white text-center transition-opacity hover:opacity-90 flex items-center justify-center gap-2 cursor-pointer"
                          style={{ background: 'linear-gradient(135deg, #d070ff, #7226FF)', boxShadow: '0 4px 15px rgba(114,38,255,0.2)' }}
                        >
                          <Search className="w-4 h-4" />
                          Xem tất cả kết quả cho &ldquo;{searchTerm}&rdquo;
                        </button>
                      </div>
                    ) : (
                      <div className="py-12 text-center text-sm text-white/40 font-semibold">
                        Không tìm thấy kết quả nào
                      </div>
                    )}
                  </div>
                </div>
              </>,
              document.body
            )}
          </div>

          {/* MOBILE USER PROFILE AVATAR - PHAO NỔI TRÒN GÓC PHẢI (Chỉ xuất hiện ở trang chủ) */}
          {pathname === '/' && (
            session ? (
              <Link 
                href="/profile" 
                className="md:hidden w-10 h-10 flex items-center justify-center bg-[#0a0a0c]/60 backdrop-blur-md border border-white/10 rounded-full transition-all active-scale shadow-lg pointer-events-auto overflow-hidden"
              >
                <div className="w-8 h-8 rounded-full flex items-center justify-center text-white font-bold overflow-hidden" style={{background: 'linear-gradient(135deg, #F042FF, #7226FF)'}}>
                  {userAvatar ? (
                    <Image src={userAvatar} alt="avatar" width={32} height={32} className="w-full h-full object-cover" />
                  ) : (
                    session.user?.name?.charAt(0).toUpperCase() || 'U'
                  )}
                </div>
              </Link>
            ) : (
              <Link 
                href="/login" 
                className="md:hidden w-10 h-10 flex items-center justify-center bg-[#0a0a0c]/60 backdrop-blur-md border border-white/10 rounded-full transition-all active-scale shadow-lg pointer-events-auto"
              >
                <div className="w-8 h-8 rounded-full flex items-center justify-center text-white overflow-hidden" style={{background: 'linear-gradient(135deg, #F042FF, #7226FF)'}}>
                  <User className="w-4 h-4" />
                </div>
              </Link>
            )
          )}

          {/* LOGIC ĐĂNG NHẬP / ĐĂNG XUẤT CHO DESKTOP */}
          {session ? (
            <div className="hidden md:block relative group cursor-pointer pointer-events-auto active-scale">
              {/* Avatar */}
              <div className="w-8 h-8 rounded-full flex items-center justify-center text-white font-bold shadow-lg hover:ring-2 hover:ring-[#F042FF]/50 transition-all overflow-hidden" style={{background: 'linear-gradient(135deg, #F042FF, #7226FF)'}}>
                {userAvatar ? (
                  <Image src={userAvatar} alt="avatar" width={32} height={32} className="w-full h-full object-cover" />
                ) : (
                  session.user?.name?.charAt(0).toUpperCase() || 'U'
                )}
              </div>
              
              {/* Menu Đăng xuất (Có chứa Lịch sử và Tài khoản) */}
              <div className="absolute top-full right-0 mt-2 w-56 bg-[#141414]/95 backdrop-blur-xl border border-white/10 rounded-2xl shadow-2xl opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-300 overflow-hidden transform origin-top-right scale-95 group-hover:scale-100 z-50 pointer-events-auto flex flex-col">
                
                {/* Thông tin user */}
                <div className="px-4 py-3 border-b border-white/10 bg-white/5">
                  <p className="text-sm font-bold text-white truncate">{session.user?.name}</p>
                  <p className="text-[10px] text-white/50 truncate mt-0.5">{session.user?.email}</p>
                </div>
                
                {/* Lịch sử và Cài đặt */}
                <div className="py-2 border-b border-white/10 flex flex-col gap-1">
                  <Link href="/profile" className="px-4 py-2 text-sm text-white/80 hover:bg-white/10 hover:text-white transition-colors flex items-center gap-2 font-medium">
                    <Settings className="w-4 h-4" /> Tùy chỉnh thông tin
                  </Link>
                  <Link href="/history" className="px-4 py-2 text-sm text-white/80 hover:bg-white/10 hover:text-white transition-colors flex items-center gap-2 font-medium">
                    <History className="w-4 h-4" /> Lịch sử xem phim
                  </Link>
                  <Link href="/favorites" className="px-4 py-2 text-sm text-white/80 hover:bg-white/10 hover:text-red-400 transition-colors flex items-center gap-2 font-medium">
                    <Heart className="w-4 h-4" /> Phim yêu thích
                  </Link>
                </div>

                {/* Đăng xuất */}
                <button 
                  onClick={() => signOut()}
                  className="w-full text-left px-4 py-3 text-sm text-red-500 hover:bg-red-500/10 hover:text-red-300 transition-colors flex items-center gap-2 font-medium"
                >
                  <LogOut className="w-4 h-4" /> Đăng xuất
                </button>
              </div>
            </div>
          ) : (
            /* Nút hình người khi CHƯA đăng nhập */
            <Link href="/login" className="hidden md:flex w-11 h-11 items-center justify-center text-white cursor-pointer hover:scale-105 active-scale pointer-events-auto">
              <div className="w-8 h-8 rounded-full flex items-center justify-center text-white shadow-lg hover:ring-2 hover:ring-[#F042FF]/50 transition-all overflow-hidden" style={{background: 'linear-gradient(135deg, #F042FF, #7226FF)'}}>
                <User className="w-4 h-4" />
              </div>
            </Link>
          )}

          {/* NÚT HAMBURGER MOBILE - ĐÃ ẨN HOÀN TOÀN VÌ CÓ BOTTOM NAV CATEGORIES */}
          <button 
            className="hidden w-11 h-11 items-center justify-center text-gray-700 dark:text-white/80 hover:text-black dark:hover:text-white transition-all active-scale"
            onClick={() => setIsMobileMenuOpen(true)}
          >
            <Menu className="w-6 h-6" />
          </button>
        </div>
      </nav>

      {/* MOBILE DRAWER MENU */}
      {isMobileMenuOpen && (
        <>
          {/* Backdrop */}
          <div 
            className="fixed inset-0 bg-black/60 backdrop-blur-sm z-[150]"
            onClick={() => setIsMobileMenuOpen(false)}
          />
          {/* Drawer */}
          <div className="fixed top-0 right-0 h-full w-[85vw] max-w-sm bg-[#0a0a0c] border-l border-white/10 z-[200] flex flex-col overflow-hidden">
            {/* Header */}
            <div className="flex items-center justify-between px-6 py-5 border-b border-white/10">
              <span className="text-white font-black text-xl">Macflix</span>
              <button 
                onClick={() => setIsMobileMenuOpen(false)} 
                className="w-11 h-11 rounded-full bg-white/10 flex items-center justify-center active-scale"
              >
                <span className="text-white text-xl leading-none">&times;</span>
              </button>
            </div>

            {/* Tab chọn */}
            <div className="flex mx-4 mt-4 rounded-xl bg-white/5 p-1">
              <button
                onClick={() => setMobileTab('genre')}
                className={`flex-1 py-2 rounded-lg text-sm font-bold transition-all ${
                  mobileTab === 'genre' ? 'bg-white/20 text-white' : 'text-white/50'
                }`}
              >
                Thể Loại
              </button>
              <button
                onClick={() => setMobileTab('country')}
                className={`flex-1 py-2 rounded-lg text-sm font-bold transition-all ${
                  mobileTab === 'country' ? 'bg-white/20 text-white' : 'text-white/50'
                }`}
              >
                Quốc Gia
              </button>
            </div>

            {/* Danh sách */}
            <div className="flex-1 overflow-y-auto p-4">
              <div className="grid grid-cols-2 gap-2">
                {mobileTab === 'genre'
                  ? GENRES.map((genre) => (
                    <a
                      key={genre.slug}
                      href={`/genres/${genre.slug}`}
                      onClick={() => setIsMobileMenuOpen(false)}
                      className="px-3 py-3 text-sm text-white/70 hover:text-white bg-white/5 hover:bg-white/10 rounded-xl transition-all font-medium active-scale flex items-center"
                    >
                      {genre.name}
                    </a>
                  ))
                  : COUNTRIES.map((country) => (
                    <a
                      key={country.slug}
                      href={`/countries/${country.slug}`}
                      onClick={() => setIsMobileMenuOpen(false)}
                      className="px-3 py-3 text-sm text-white/70 hover:text-white bg-white/5 hover:bg-white/10 rounded-xl transition-all font-medium active-scale flex items-center"
                    >
                      {country.name}
                    </a>
                  ))
                }
              </div>
            </div>

            {/* Footer - Link nhanh */}
            <div className="px-4 py-4 border-t border-white/10 flex flex-col gap-2">
              {session ? (
                <>
                  <a href="/history" onClick={() => setIsMobileMenuOpen(false)} className="flex items-center gap-3 px-4 py-3 text-sm text-white/80 hover:text-white bg-white/5 hover:bg-white/10 rounded-xl transition-colors active-scale">
                    <History className="w-4 h-4" /> Lịch sử xem
                  </a>
                  <a href="/favorites" onClick={() => setIsMobileMenuOpen(false)} className="flex items-center gap-3 px-4 py-3 text-sm text-white/80 hover:text-white bg-white/5 hover:bg-white/10 rounded-xl transition-colors active-scale">
                    <Heart className="w-4 h-4" /> Phim yêu thích
                  </a>
                  <button onClick={() => { signOut(); setIsMobileMenuOpen(false); }} className="flex items-center gap-3 px-4 py-3 text-sm text-red-400 hover:text-red-300 bg-red-500/10 hover:bg-red-500/20 rounded-xl transition-colors active-scale text-left">
                    <LogOut className="w-4 h-4" /> Đăng xuất
                  </button>
                </>
              ) : (
                <a href="/login" onClick={() => setIsMobileMenuOpen(false)} className="flex items-center justify-center gap-2 px-4 py-3.5 text-sm font-bold text-white bg-gradient-to-r from-[#D9251D] to-orange-500 rounded-xl transition-opacity hover:opacity-80 active-scale">
                  <User className="w-4 h-4" /> Đăng nhập
                </a>
              )}
            </div>
          </div>
        </>
      )}
    </div>
  );
}