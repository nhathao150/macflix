'use client';

import { useState, useEffect } from 'react';
import { createPortal } from 'react-dom';
import Link from 'next/link';
import Image from 'next/image';
import { usePathname, useRouter } from 'next/navigation';
import { Grid, Heart, History, Search } from 'lucide-react';
import { clsx } from 'clsx';
import { searchMovies } from '@/services/movie.service';

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

// Custom M Logo Icon styled with Macflix brand look
const MacflixMIcon = ({ className, isActive }: { className?: string; isActive?: boolean }) => {
  return (
    <svg
      viewBox="0 0 24 24"
      className={className}
      xmlns="http://www.w3.org/2000/svg"
    >
      <defs>
        <linearGradient id="m-logo-grad" x1="0%" y1="0%" x2="0%" y2="100%">
          <stop offset="0%" stopColor="#d070ff" />
          <stop offset="100%" stopColor="#7226FF" />
        </linearGradient>
      </defs>
      <text
        x="12"
        y="19.5"
        textAnchor="middle"
        fontFamily="'Arial Black', 'Helvetica Neue', Arial, sans-serif"
        fontWeight="900"
        fontSize="21"
        fontStyle="italic"
        fill={isActive ? 'url(#m-logo-grad)' : 'currentColor'}
      >
        M
      </text>
    </svg>
  );
};

const NAV_ITEMS = [
  {
    name: 'Danh mục',
    isCategories: true,
  },
  {
    name: 'Yêu thích',
    href: '/favorites',
    icon: Heart,
  },
  {
    name: 'Trang chủ',
    href: '/',
    isHome: true,
  },
  {
    name: 'Lịch sử',
    href: '/history',
    icon: History,
  },
  {
    name: 'Tìm kiếm',
    href: '/search',
    icon: Search,
  },
];

export default function BottomNav() {
  const pathname = usePathname();
  const router = useRouter();

  const [isDrawerOpen, setIsDrawerOpen] = useState(false);
  const [activeTab, setActiveTab] = useState<'genre' | 'country'>('genre');

  const [searchTerm, setSearchTerm] = useState('');
  const [searchResults, setSearchResults] = useState<any[]>([]);
  const [isSearching, setIsSearching] = useState(false);
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  // Tự động đóng drawer và search khi chuyển trang
  useEffect(() => {
    setIsDrawerOpen(false);
    setIsSearchOpen(false);
  }, [pathname]);

  // Khóa cuộn trang bên ngoài khi drawer hoặc search modal mở
  useEffect(() => {
    if (isDrawerOpen || isSearchOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }
    return () => {
      document.body.style.overflow = '';
    };
  }, [isDrawerOpen, isSearchOpen]);

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

  // Debounce API search
  useEffect(() => {
    if (searchTerm.trim().length < 2) {
      setSearchResults([]);
      return;
    }

    const delayDebounceFn = setTimeout(async () => {
      setIsSearching(true);
      try {
        const results = await searchMovies(searchTerm);
        setSearchResults(results);
      } catch (err) {
        console.error(err);
      } finally {
        setIsSearching(false);
      }
    }, 500);

    return () => clearTimeout(delayDebounceFn);
  }, [searchTerm]);

  const handleSearchSubmit = () => {
    if (!searchTerm.trim()) return;
    setSearchResults([]);
    setIsSearchOpen(false);
    router.push(`/tim-kiem?q=${encodeURIComponent(searchTerm.trim())}`);
    setSearchTerm('');
  };

  // Ẩn BottomNav khi ở các trang chi tiết phim/phát phim (/phim/[slug]) để không bị đè lên trình phát
  const isWatchPage = pathname?.startsWith('/movies/');

  if (isWatchPage) return null;

  return (
    <>
      <div 
        className="md:hidden fixed left-4 right-4 z-[120] bg-[#0a0a0c]/80 backdrop-blur-lg border border-white/10 shadow-[0_8px_32px_rgba(0,0,0,0.8)] rounded-full px-2"
        style={{ 
          bottom: 'calc(16px + env(safe-area-inset-bottom, 0px))', 
          maxWidth: '480px', 
          marginLeft: 'auto', 
          marginRight: 'auto',
          willChange: 'transform',
          transform: 'translate3d(0, 0, 0)'
        }}
      >
        <div className="flex items-center justify-around h-16">
          {NAV_ITEMS.map((item) => {
            const isActive = item.href
              ? item.href === '/'
                ? pathname === '/'
                : pathname?.startsWith(item.href)
              : false;

            if (item.isCategories) {
              return (
                <button
                  key="categories-btn"
                  onClick={() => setIsDrawerOpen((prev) => !prev)}
                  className="flex flex-col items-center justify-center flex-1 h-full min-w-[48px] active-scale group select-none cursor-pointer bg-transparent border-none outline-none"
                >
                  <div className="relative flex items-center justify-center">
                    <Grid
                      className={clsx(
                        'w-5 h-5 transition-all duration-300',
                        isDrawerOpen
                          ? 'text-purple-400 scale-110 drop-shadow-[0_0_8px_rgba(168,85,247,0.5)]'
                          : 'text-white/40 group-hover:text-white/80'
                      )}
                    />
                  </div>
                  <span
                    className={clsx(
                      'text-[10px] font-bold mt-1.5 tracking-tight transition-colors duration-300',
                      isDrawerOpen
                        ? 'text-purple-400 font-extrabold'
                        : 'text-white/40 group-hover:text-white/80'
                    )}
                  >
                    {item.name}
                  </span>
                </button>
              );
            }

            if (item.name === 'Tìm kiếm') {
              return (
                <button
                  key="search-btn"
                  onClick={() => {
                    setIsSearchOpen(true);
                    setIsDrawerOpen(false);
                    setSearchTerm('');
                    setSearchResults([]);
                  }}
                  className="flex flex-col items-center justify-center flex-1 h-full min-w-[48px] active-scale group select-none cursor-pointer bg-transparent border-none outline-none"
                >
                  <div className="relative flex items-center justify-center">
                    <Search
                      className={clsx(
                        'w-5 h-5 transition-all duration-300',
                        isSearchOpen
                          ? 'text-[#d070ff] scale-110 drop-shadow-[0_0_8px_rgba(208,112,255,0.5)]'
                          : 'text-white/40 group-hover:text-white/80'
                      )}
                    />
                    {isSearchOpen && (
                      <span className="absolute -bottom-1.5 w-1 h-1 rounded-full bg-[#d070ff] shadow-[0_0_6px_#d070ff]" />
                    )}
                  </div>
                  <span
                    className={clsx(
                      'text-[10px] font-bold mt-1.5 tracking-tight transition-colors duration-300',
                      isSearchOpen
                        ? 'text-[#d070ff] font-extrabold'
                        : 'text-white/40 group-hover:text-white/80'
                    )}
                  >
                    {item.name}
                  </span>
                </button>
              );
            }

            return (
              <Link
                key={item.href}
                href={item.href || '/'}
                onClick={() => setIsDrawerOpen(false)}
                className="flex flex-col items-center justify-center flex-1 h-full min-w-[48px] active-scale group select-none"
              >
                <div className="relative flex items-center justify-center">
                  {item.isHome ? (
                    <MacflixMIcon
                      isActive={isActive}
                      className={clsx(
                        'w-6 h-6 transition-all duration-300',
                        isActive
                          ? 'scale-110 drop-shadow-[0_0_8px_rgba(168,85,247,0.5)]'
                          : 'text-white/40 group-hover:text-white/80'
                      )}
                    />
                  ) : (
                    item.icon && (
                      <item.icon
                        className={clsx(
                          'w-5 h-5 transition-all duration-300',
                          isActive
                            ? 'text-purple-400 scale-110 drop-shadow-[0_0_8px_rgba(168,85,247,0.5)]'
                            : 'text-white/40 group-hover:text-white/80'
                        )}
                      />
                    )
                  )}
                  {isActive && (
                    <span className="absolute -bottom-1.5 w-1 h-1 rounded-full bg-purple-500 shadow-[0_0_6px_#a855f7]" />
                  )}
                </div>
                <span
                  className={clsx(
                    'text-[10px] font-bold mt-1.5 tracking-tight transition-colors duration-300',
                    isActive
                      ? 'text-purple-400 font-extrabold'
                      : 'text-white/40 group-hover:text-white/80'
                  )}
                >
                  {item.name}
                </span>
              </Link>
            );
          })}
        </div>
      </div>

      {/* DRAWER CHỌN DANH MỤC */}
      {isDrawerOpen && (
        <>
          {/* Backdrop */}
          <div
            className="fixed inset-0 bg-black/60 backdrop-blur-sm z-[100]"
            onClick={() => setIsDrawerOpen(false)}
          />
          {/* Floating Card panel */}
          <div
            className="fixed left-4 right-4 max-w-md mx-auto max-h-[65vh] bg-[#0a0a0c]/95 backdrop-blur-2xl border border-white/10 rounded-3xl z-[110] flex flex-col overflow-hidden shadow-[0_8px_32px_rgba(0,0,0,0.8)] pb-6"
            style={{ bottom: 'calc(88px + env(safe-area-inset-bottom, 0px))', paddingBottom: '10px' }}
          >
            {/* Header */}
            <div className="flex items-center justify-between px-6 py-5 border-b border-white/5">
              <span className="text-white font-black text-lg">Danh mục phim</span>
              <button
                onClick={() => setIsDrawerOpen(false)}
                className="w-8 h-8 rounded-full bg-white/10 flex items-center justify-center active-scale"
              >
                <span className="text-white text-lg leading-none">&times;</span>
              </button>
            </div>

            {/* Tabs chọn Thể loại / Quốc gia */}
            <div className="flex mx-6 mt-4 rounded-xl bg-white/5 p-1" style={{ marginBottom: "16px" }}>
              <button
                onClick={() => setActiveTab('genre')}
                className={clsx(
                  'flex-1 py-2.5 rounded-lg text-sm font-bold transition-all active-scale',
                  activeTab === 'genre'
                    ? 'bg-white/10 text-white shadow-md'
                    : 'text-white/40'
                )}
              >
                Thể Loại
              </button>
              <button
                onClick={() => setActiveTab('country')}
                className={clsx(
                  'flex-1 py-2.5 rounded-lg text-sm font-bold transition-all active-scale',
                  activeTab === 'country'
                    ? 'bg-white/10 text-white shadow-md'
                    : 'text-white/40'
                )}
              >
                Quốc Gia
              </button>
            </div>

            {/* List items scrollable grid */}
            <div className="flex-1 overflow-y-auto p-6 scrollbar-hide">
              <div className="grid grid-cols-2 gap-3 pb-8">
                {activeTab === 'genre'
                  ? GENRES.map((genre) => (
                    <Link
                      key={genre.slug}
                      href={`/genres/${genre.slug}`}
                      onClick={() => setIsDrawerOpen(false)}
                      className="px-4 py-3 text-sm text-white/70 hover:text-white bg-white/5 hover:bg-white/10 rounded-xl transition-all font-semibold active-scale text-center border border-white/5"
                    >
                      {genre.name}
                    </Link>
                  ))
                  : COUNTRIES.map((country) => (
                    <Link
                      key={country.slug}
                      href={`/countries/${country.slug}`}
                      onClick={() => setIsDrawerOpen(false)}
                      className="px-4 py-3 text-sm text-white/70 hover:text-white bg-white/5 hover:bg-white/10 rounded-xl transition-all font-semibold active-scale text-center border border-white/5"
                    >
                      {country.name}
                    </Link>
                  ))}
              </div>
            </div>
          </div>
        </>
      )}

      {/* MOBILE SEARCH PORTAL */}
      {isSearchOpen && mounted && createPortal(
        <>
          {/* Backdrop overlay */}
          <div 
            onClick={() => setIsSearchOpen(false)}
            className="fixed inset-0 bg-black/75 backdrop-blur-md transition-all z-[150] pointer-events-auto"
          />

          {/* Dialog container */}
          <div className="fixed top-[8vh] left-4 right-4 max-w-md mx-auto bg-[#141414]/95 border border-white/10 rounded-3xl p-5 shadow-[0_24px_50px_rgba(0,0,0,0.8)] z-[160] pointer-events-auto flex flex-col gap-5 animate-in fade-in zoom-in-95 duration-200">
            {/* Ô nhập từ khóa */}
            <div className="flex items-center gap-3 bg-black/40 border border-white/15 focus-within:border-[#F042FF]/50 rounded-2xl px-4 py-3 transition-all">
              <Search className="w-4.5 h-4.5 text-white/40" />
              <input
                type="text"
                placeholder="Tìm kiếm phim..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && handleSearchSubmit()}
                className="bg-transparent border-none outline-none text-sm text-white w-full placeholder:text-white/30"
                autoFocus
              />
            </div>

            {/* Trạng thái kết quả tìm kiếm */}
            <div className="flex-1 max-h-[50vh] overflow-y-auto pr-1 scrollbar-hide">
              {!searchTerm.trim() || searchTerm.trim().length < 2 ? (
                <div className="py-10 flex flex-col items-center justify-center text-center gap-2">
                  <Search className="w-10 h-10 text-white/10" />
                  <p className="text-white/40 text-xs font-semibold">Nhập từ khóa để tìm kiếm phim</p>
                  <p className="text-white/20 text-[10px] font-medium">Tối thiểu 2 ký tự</p>
                </div>
              ) : isSearching ? (
                <div className="py-10 flex justify-center items-center">
                  <div className="animate-spin rounded-full h-7 w-7 border-b-2 border-[#d070ff]"></div>
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
                      className="flex items-center gap-3 p-2 hover:bg-white/5 rounded-2xl transition-all group"
                    >
                      <Image 
                        src={movie.imageSrc || '/placeholder-image.jpg'} 
                        alt={movie.title} 
                        width={40} 
                        height={56} 
                        className="w-10 h-14 object-cover rounded-xl shadow-md group-hover:scale-105 transition-transform" 
                        referrerPolicy="no-referrer"
                      />
                      <div className="flex flex-col">
                        <span className="text-xs font-bold text-white group-hover:text-[#d070ff] transition-colors line-clamp-1">{movie.title}</span>
                        <span className="text-[9px] text-white/40 uppercase tracking-wider mt-0.5 font-bold">Xem chi tiết</span>
                      </div>
                    </Link>
                  ))}
                  {/* Nút xem tất cả */}
                  <button
                    onClick={handleSearchSubmit}
                    className="mt-2 py-2.5 rounded-2xl text-xs font-bold text-white text-center transition-opacity hover:opacity-90 flex items-center justify-center gap-2 cursor-pointer"
                    style={{ background: 'linear-gradient(135deg, #d070ff, #7226FF)', boxShadow: '0 4px 15px rgba(114,38,255,0.2)' }}
                  >
                    <Search className="w-3.5 h-3.5" />
                    Xem tất cả kết quả cho &ldquo;{searchTerm}&rdquo;
                  </button>
                </div>
              ) : (
                <div className="py-10 text-center text-xs text-white/40 font-semibold">
                  Không tìm thấy kết quả nào
                </div>
              )}
            </div>
          </div>
        </>,
        document.body
      )}
    </>
  );
}
