'use client';

import { useState, useEffect, useRef } from 'react';
import Link from 'next/link';
import Image from 'next/image';
// Import thêm icon History và Settings
import { Search, Bell, User, ChevronDown, Menu, LogOut, History, Settings, Heart } from 'lucide-react';
import { searchMovies } from '@/lib/api';
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

  const [searchTerm, setSearchTerm] = useState('');
  const [searchResults, setSearchResults] = useState<any[]>([]);
  const [isSearching, setIsSearching] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [mobileTab, setMobileTab] = useState<'genre' | 'country'>('genre');
  const [openDropdown, setOpenDropdown] = useState<'genre' | 'country' | null>(null);
  const navRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    document.documentElement.classList.add('dark');
  }, []);

  // Đóng mobile menu khi resize lên desktop
  useEffect(() => {
    const handleResize = () => {
      if (window.innerWidth >= 768) setIsMobileMenuOpen(false);
    };
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
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

  return (
    <div ref={navRef} className="fixed top-0 left-0 w-full z-[100] flex justify-center pointer-events-none">
      <nav className="pointer-events-auto flex items-center justify-between w-[95%] max-w-6xl mt-6 rounded-full px-6 md:px-8 py-3 transition-colors duration-300 backdrop-blur-2xl shadow-[0_8px_32px_rgba(0,0,0,0.1)] dark:shadow-[0_8px_32px_rgba(0,0,0,0.5)] bg-white/60 dark:bg-black/40 border border-black/10 dark:border-white/20">
        
        {/* LOGO */}
        <div className="flex items-center shrink-0">
          <Link href="/" className="text-xl md:text-2xl font-black text-gray-900 dark:text-white tracking-wider flex items-center gap-1">
            <span className="text-gray-900 dark:text-white text-2xl md:text-3xl leading-none"></span> Macflix
          </Link>
        </div>

        {/* MENU CHÍNH */}
        <div className="hidden md:flex items-center gap-6 text-sm font-medium text-gray-700 dark:text-white/80">
          <Link href="/" className="hover:text-black dark:hover:text-white transition-colors">Trang chủ</Link>
          
          <div className="relative py-2">
            <button
              onClick={() => setOpenDropdown(openDropdown === 'genre' ? null : 'genre')}
              className={`flex items-center gap-1 transition-colors ${
                openDropdown === 'genre'
                  ? 'text-black dark:text-white'
                  : 'text-gray-700 dark:text-white/80 hover:text-black dark:hover:text-white'
              }`}
            >
              Thể loại
              <ChevronDown className={`w-4 h-4 transition-transform duration-200 ${
                openDropdown === 'genre' ? 'rotate-180' : ''
              }`} />
            </button>
            {openDropdown === 'genre' && (
              <div className="absolute top-full left-0 pt-4 w-[450px] z-50">
                <div className="bg-white/95 dark:bg-[#141414]/95 backdrop-blur-xl border border-black/10 dark:border-white/10 rounded-2xl shadow-2xl flex flex-col p-4">
                  <div className="grid grid-cols-3 gap-x-2 gap-y-1">
                    {GENRES.map((genre) => (
                      <Link
                        key={genre.slug} href={`/the-loai/${genre.slug}`} onClick={closeDropdown}
                        className="px-3 py-2 text-xs font-medium text-gray-600 dark:text-white/70 hover:bg-gray-100 dark:hover:bg-white/10 hover:text-black dark:hover:text-white rounded-lg transition-colors"
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
                  ? 'text-black dark:text-white'
                  : 'text-gray-700 dark:text-white/80 hover:text-black dark:hover:text-white'
              }`}
            >
              Quốc Gia
              <ChevronDown className={`w-4 h-4 transition-transform duration-200 ${
                openDropdown === 'country' ? 'rotate-180' : ''
              }`} />
            </button>
            {openDropdown === 'country' && (
              <div className="absolute top-full left-1/2 -translate-x-1/2 pt-4 w-[750px] z-50">
                <div className="bg-white/95 dark:bg-[#141414]/95 backdrop-blur-xl border border-black/10 dark:border-white/10 rounded-2xl shadow-2xl flex flex-col p-5">
                  <div className="grid grid-cols-5 gap-x-2 gap-y-2">
                    {COUNTRIES.map((country) => (
                      <Link
                        key={country.slug} href={`/quoc-gia/${country.slug}`} onClick={closeDropdown}
                        className="px-3 py-2 text-sm text-gray-600 dark:text-white/70 hover:bg-gray-100 dark:hover:bg-white/10 hover:text-black dark:hover:text-white rounded-lg transition-colors"
                      >
                        {country.name}
                      </Link>
                    ))}
                  </div>
                </div>
              </div>
            )}
          </div>
          
          {/* Đã xóa chữ Lịch sử ở đây cho Menu gọn gàng */}
        </div>

        {/* --- CÔNG CỤ PHẢI --- */}
        <div className="flex items-center gap-4 md:gap-6 text-gray-700 dark:text-white/80 shrink-0">
          
          {/* TÌM KIẾM */}
          <div className="hidden lg:flex relative items-center">
            <div className="flex items-center gap-2 bg-black/5 dark:bg-black/30 border border-black/10 dark:border-white/10 rounded-full px-4 py-1.5 backdrop-blur-sm transition-all focus-within:bg-white dark:focus-within:bg-[#1a1a1a] focus-within:ring-2 focus-within:ring-cyan-500/50">
              <Search className="w-4 h-4 text-gray-500 dark:text-white/50" />
              <input 
                type="text" placeholder="Tìm kiếm phim..." value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)}
                className="bg-transparent border-none outline-none text-xs text-black dark:text-white w-24 focus:w-48 transition-all duration-300 placeholder:text-gray-500 dark:placeholder:text-white/50"
              />
            </div>

            {searchTerm && (
              <div className="absolute top-full right-0 mt-4 w-72 bg-white/95 dark:bg-[#141414]/95 backdrop-blur-xl border border-black/10 dark:border-white/10 rounded-2xl shadow-2xl flex flex-col p-2 z-50 overflow-hidden">
                {isSearching ? (
                   <div className="p-4 flex justify-center items-center">
                      <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-gray-900 dark:border-white"></div>
                   </div>
                ) : searchResults.length > 0 ? (
                  searchResults.map((movie) => (
                    <Link href={`/phim/${movie.slug}`} key={movie.id} onClick={() => setSearchTerm('')} className="flex items-center gap-3 p-2 hover:bg-black/5 dark:hover:bg-white/10 rounded-xl transition-colors group">
                      <Image src={movie.imageSrc || '/placeholder-image.jpg'} alt={movie.title} width={40} height={56} className="w-10 h-14 object-cover rounded-md shadow-sm group-hover:scale-105 transition-transform" />
                      <div className="flex flex-col">
                        <span className="text-sm font-bold text-gray-800 dark:text-white line-clamp-1">{movie.title}</span>
                        <span className="text-[10px] text-gray-500 dark:text-white/50 uppercase">Xem chi tiết</span>
                      </div>
                    </Link>
                  ))
                ) : (
                  <div className="p-4 text-center text-xs text-gray-500 dark:text-white/50 font-medium">Không tìm thấy</div>
                )}
              </div>
            )}
          </div>

          {/* NÚT TÌM KIẾM MOBILE */}
          <button className="lg:hidden hover:text-black dark:hover:text-white transition-transform hover:scale-110"><Search className="w-5 h-5" /></button>
          
          {/* CHUÔNG THÔNG BÁO - disabled v&agrave; có tooltip */}
          <button 
            title="Thông báo (sắp ra mắt)"
            disabled
            className="opacity-40 cursor-not-allowed"
          >
            <Bell className="w-5 h-5" />
          </button>

          {/* LOGIC ĐĂNG NHẬP / ĐĂNG XUẤT */}
          {session ? (
            <div className="relative group cursor-pointer pointer-events-auto">
              {/* Avatar */}
              <div className="w-8 h-8 rounded-full bg-gradient-to-tr from-cyan-500 to-blue-600 flex items-center justify-center text-white font-bold shadow-lg hover:ring-2 hover:ring-cyan-500/50 transition-all">
                {session.user?.name?.charAt(0).toUpperCase() || 'U'}
              </div>
              
              {/* Menu Đăng xuất (Có chứa Lịch sử và Tài khoản) */}
              <div className="absolute top-full right-0 mt-2 w-56 bg-white/95 dark:bg-[#141414]/95 backdrop-blur-xl border border-black/10 dark:border-white/10 rounded-2xl shadow-2xl opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-300 overflow-hidden transform origin-top-right scale-95 group-hover:scale-100 z-50 pointer-events-auto flex flex-col">
                
                {/* Thông tin user */}
                <div className="px-4 py-3 border-b border-black/5 dark:border-white/10 bg-black/5 dark:bg-white/5">
                  <p className="text-sm font-bold text-gray-900 dark:text-white truncate">{session.user?.name}</p>
                  <p className="text-[10px] text-gray-500 dark:text-white/50 truncate mt-0.5">{session.user?.email}</p>
                </div>
                
                {/* Lịch sử và Cài đặt */}
                <div className="py-2 border-b border-black/5 dark:border-white/10 flex flex-col gap-1">
                  <Link href="/ca-nhan" className="px-4 py-2 text-sm text-gray-700 dark:text-white/80 hover:bg-black/5 dark:hover:bg-white/10 hover:text-black dark:hover:text-white transition-colors flex items-center gap-2 font-medium">
                    <Settings className="w-4 h-4" /> Tùy chỉnh thông tin
                  </Link>
                  <Link href="/lich-su" className="px-4 py-2 text-sm text-gray-700 dark:text-white/80 hover:bg-black/5 dark:hover:bg-white/10 hover:text-black dark:hover:text-white transition-colors flex items-center gap-2 font-medium">
                    <History className="w-4 h-4" /> Lịch sử xem phim
                  </Link>
                  <Link href="/yeu-thich" className="px-4 py-2 text-sm text-gray-700 dark:text-white/80 hover:bg-black/5 dark:hover:bg-white/10 hover:text-red-500 dark:hover:text-red-400 transition-colors flex items-center gap-2 font-medium">
                    <Heart className="w-4 h-4" /> Phim yêu thích
                  </Link>
                </div>

                {/* Đăng xuất */}
                <button 
                  onClick={() => signOut()}
                  className="w-full text-left px-4 py-3 text-sm text-red-500 hover:bg-red-50 dark:hover:bg-red-500/10 hover:text-red-600 dark:hover:text-red-300 transition-colors flex items-center gap-2 font-medium"
                >
                  <LogOut className="w-4 h-4" /> Đăng xuất
                </button>
              </div>
            </div>
          ) : (
            /* Nút hình người khi CHƯA đăng nhập */
            <Link href="/dang-nhap" className="w-8 h-8 rounded-full bg-gradient-to-tr from-[#D9251D] to-orange-500 flex items-center justify-center text-white cursor-pointer hover:ring-2 hover:ring-red-500/50 transition-all shadow-lg pointer-events-auto">
              <User className="w-4 h-4" />
            </Link>
          )}

          {/* NÚT HAMBURGER MOBILE */}
          <button 
            className="md:hidden hover:text-black dark:hover:text-white transition-colors"
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
          <div className="fixed top-0 right-0 h-full w-[85vw] max-w-sm bg-[#0a0a0a] border-l border-white/10 z-[200] flex flex-col overflow-hidden">
            {/* Header */}
            <div className="flex items-center justify-between px-6 py-5 border-b border-white/10">
              <span className="text-white font-black text-xl">Macflix</span>
              <button onClick={() => setIsMobileMenuOpen(false)} className="w-8 h-8 rounded-full bg-white/10 flex items-center justify-center">
                <span className="text-white text-lg leading-none">&times;</span>
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
                      href={`/the-loai/${genre.slug}`}
                      onClick={() => setIsMobileMenuOpen(false)}
                      className="px-3 py-2.5 text-sm text-white/70 hover:text-white bg-white/5 hover:bg-white/10 rounded-xl transition-colors font-medium"
                    >
                      {genre.name}
                    </a>
                  ))
                  : COUNTRIES.map((country) => (
                    <a
                      key={country.slug}
                      href={`/quoc-gia/${country.slug}`}
                      onClick={() => setIsMobileMenuOpen(false)}
                      className="px-3 py-2.5 text-sm text-white/70 hover:text-white bg-white/5 hover:bg-white/10 rounded-xl transition-colors font-medium"
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
                  <a href="/lich-su" onClick={() => setIsMobileMenuOpen(false)} className="flex items-center gap-3 px-4 py-2.5 text-sm text-white/80 hover:text-white bg-white/5 hover:bg-white/10 rounded-xl transition-colors">
                    <History className="w-4 h-4" /> Lịch sử xem
                  </a>
                  <a href="/yeu-thich" onClick={() => setIsMobileMenuOpen(false)} className="flex items-center gap-3 px-4 py-2.5 text-sm text-white/80 hover:text-white bg-white/5 hover:bg-white/10 rounded-xl transition-colors">
                    <Heart className="w-4 h-4" /> Phim yêu thích
                  </a>
                  <button onClick={() => { signOut(); setIsMobileMenuOpen(false); }} className="flex items-center gap-3 px-4 py-2.5 text-sm text-red-400 hover:text-red-300 bg-red-500/10 hover:bg-red-500/20 rounded-xl transition-colors">
                    <LogOut className="w-4 h-4" /> Đăng xuất
                  </button>
                </>
              ) : (
                <a href="/dang-nhap" onClick={() => setIsMobileMenuOpen(false)} className="flex items-center justify-center gap-2 px-4 py-3 text-sm font-bold text-white bg-gradient-to-r from-[#D9251D] to-orange-500 rounded-xl transition-opacity hover:opacity-80">
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