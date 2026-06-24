'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Grid, Heart, History, Search } from 'lucide-react';
import { clsx } from 'clsx';

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
    href: '/yeu-thich',
    icon: Heart,
  },
  {
    name: 'Trang chủ',
    href: '/',
    isHome: true,
  },
  {
    name: 'Lịch sử',
    href: '/lich-su',
    icon: History,
  },
  {
    name: 'Tìm kiếm',
    href: '/tim-kiem',
    icon: Search,
  },
];

export default function BottomNav() {
  const pathname = usePathname();
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);
  const [activeTab, setActiveTab] = useState<'genre' | 'country'>('genre');

  // Tự động đóng drawer khi chuyển trang
  useEffect(() => {
    setIsDrawerOpen(false);
  }, [pathname]);

  // Khóa cuộn trang bên ngoài khi drawer đang mở
  useEffect(() => {
    if (isDrawerOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }
    return () => {
      document.body.style.overflow = '';
    };
  }, [isDrawerOpen]);

  // Ẩn BottomNav khi ở các trang chi tiết phim/phát phim (/phim/[slug]) để không bị đè lên trình phát
  const isWatchPage = pathname?.startsWith('/phim/');

  if (isWatchPage) return null;

  return (
    <>
      <div 
        className="xl:hidden fixed left-4 right-4 z-[120] bg-[#0a0a0c]/80 backdrop-blur-2xl border border-white/10 shadow-[0_8px_32px_rgba(0,0,0,0.8)] rounded-full px-2"
        style={{ 
          bottom: 'calc(16px + env(safe-area-inset-bottom, 0px))', 
          maxWidth: '480px', 
          marginLeft: 'auto', 
          marginRight: 'auto' 
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
                      href={`/the-loai/${genre.slug}`}
                      onClick={() => setIsDrawerOpen(false)}
                      className="px-4 py-3 text-sm text-white/70 hover:text-white bg-white/5 hover:bg-white/10 rounded-xl transition-all font-semibold active-scale text-center border border-white/5"
                    >
                      {genre.name}
                    </Link>
                  ))
                  : COUNTRIES.map((country) => (
                    <Link
                      key={country.slug}
                      href={`/quoc-gia/${country.slug}`}
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
    </>
  );
}
