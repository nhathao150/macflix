import Link from 'next/link';

const INFO_LINKS = [
  { name: 'Thông báo', href: '#' },
  { name: 'Hỗ trợ', href: '#' },
  { name: 'Liên hệ', href: '#' },
  { name: 'Góp ý', href: '#' },
];

const QUICK_LINKS = [
  { name: 'Phim Bộ', href: '/danh-sach/phim-bo' },
  { name: 'Phim Lẻ', href: '/danh-sach/phim-le' },
  { name: 'Hoạt Hình', href: '/danh-sach/hoat-hinh' },
  { name: 'TV Shows', href: '/danh-sach/tv-shows' },
];

const GENRE_LINKS = [
  { name: 'Hành Động', slug: 'hanh-dong' },
  { name: 'Tình Cảm', slug: 'tinh-cam' },
  { name: 'Kinh Dị', slug: 'kinh-di' },
  { name: 'Viễn Tưởng', slug: 'vien-tuong' },
];

export default function Footer() {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="relative bg-[#0a0a0c] border-t border-white/5 mt-auto">
      {/* Top glow line */}
      <div
        className="absolute top-0 left-1/2 -translate-x-1/2 w-1/2 h-px"
        style={{ background: 'linear-gradient(90deg, transparent, #7226FF90, #d070ff90, #7226FF90, transparent)' }}
      />

      <div className="max-w-[1400px] mx-auto px-6 md:px-10 py-10">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-8 mb-8">

          {/* Logo + tagline */}
          <div className="col-span-2 md:col-span-1 flex flex-col gap-3">
            <Link href="/">
              <svg viewBox="0 0 160 44" height="30" aria-label="Macflix" xmlns="http://www.w3.org/2000/svg">
                <defs>
                  <linearGradient id="ft-grad" x1="0%" y1="0%" x2="0%" y2="100%">
                    <stop offset="0%" stopColor="#d070ff" />
                    <stop offset="100%" stopColor="#7226FF" />
                  </linearGradient>
                </defs>
                <text x="4" y="36" fontFamily="'Arial Black', Arial, sans-serif"
                  fontWeight="900" fontSize="38" fontStyle="italic"
                  fill="url(#ft-grad)" letterSpacing="-1">
                  Macflix
                </text>
              </svg>
            </Link>
            <p className="text-white/35 text-xs leading-relaxed">
              Xem phim HD miễn phí, phụ đề tiếng Việt.
            </p>

            {/* Social */}
            <div className="flex gap-2 mt-1">
              {[
                { label: 'Facebook', path: 'M18 2h-3a5 5 0 0 0-5 5v3H7v4h3v8h4v-8h3l1-4h-4V7a1 1 0 0 1 1-1h3z' },
                { label: 'YouTube', path: 'M22.54 6.42a2.78 2.78 0 0 0-2-1.94C18.88 4 12 4 12 4s-6.88 0-8.54.48a2.78 2.78 0 0 0-2 1.94A29 29 0 0 0 1 12a29 29 0 0 0 .46 5.58A2.78 2.78 0 0 0 3.46 19.5C5.12 20 12 20 12 20s6.88 0 8.54-.48a2.78 2.78 0 0 0 2-1.94A29 29 0 0 0 23 12a29 29 0 0 0-.46-5.58zM9.75 15.02V8.98L15.5 12l-5.75 3.02z' },
              ].map((s) => (
                <a key={s.label} href="#" aria-label={s.label}
                  className="w-8 h-8 rounded-full bg-white/5 border border-white/10 flex items-center justify-center text-white/35 hover:text-[#d070ff] hover:border-[#d070ff]/40 transition-all duration-200">
                  <svg className="w-3.5 h-3.5" fill="currentColor" viewBox="0 0 24 24">
                    <path d={s.path} />
                  </svg>
                </a>
              ))}
            </div>
          </div>

          {/* Thông tin */}
          <div>
            <h4 className="text-white/60 text-xs font-bold uppercase tracking-widest mb-3">Thông Tin</h4>
            <ul className="space-y-2">
              {INFO_LINKS.map((item) => (
                <li key={item.name}>
                  <Link href={item.href}
                    className="text-white/35 text-sm hover:text-[#d070ff] transition-colors duration-200">
                    {item.name}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Danh mục */}
          <div>
            <h4 className="text-white/60 text-xs font-bold uppercase tracking-widest mb-3">Danh Mục</h4>
            <ul className="space-y-2">
              {QUICK_LINKS.map((item) => (
                <li key={item.href}>
                  <Link href={item.href}
                    className="text-white/35 text-sm hover:text-[#d070ff] transition-colors duration-200">
                    {item.name}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Thể loại */}
          <div>
            <h4 className="text-white/60 text-xs font-bold uppercase tracking-widest mb-3">Thể Loại</h4>
            <ul className="space-y-2">
              {GENRE_LINKS.map((g) => (
                <li key={g.slug}>
                  <Link href={`/the-loai/${g.slug}`}
                    className="text-white/35 text-sm hover:text-[#d070ff] transition-colors duration-200">
                    {g.name}
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        </div>

        {/* Bottom bar */}
        <div className="border-t border-white/5 pt-5 flex flex-col sm:flex-row items-center justify-between gap-2">
          <p className="text-white/20 text-xs">
            © {currentYear} Macflix · Chỉ dành cho mục đích giải trí
          </p>
          <p className="text-white/15 text-xs">Phim HD · Phụ đề Tiếng Việt · Miễn phí</p>
        </div>
      </div>
    </footer>
  );
}
