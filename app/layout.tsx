import type { Metadata } from 'next';
import { Inter } from 'next/font/google';
import './globals.css';
import { AuthProvider } from './Providers';
import { ModalProvider } from '@/context/ModalContext';

// Inter với đủ font-weight cần thiết cho hierarchy rõ ràng
const inter = Inter({
  subsets: ['latin', 'latin-ext'],
  weight: ['400', '500', '600', '700', '800', '900'],
  display: 'swap',
  variable: '--font-inter',
});

export const metadata: Metadata = {
  title: {
    default: 'Macflix — Xem Phim HD Miễn Phí',
    template: '%s | Macflix',
  },
  description:
    'Macflix — Nền tảng xem phim trực tuyến miễn phí chất lượng cao. Hàng nghìn bộ phim lẻ, phim bộ, anime, phim chiếu rạp mới nhất với phụ đề tiếng Việt.',
  keywords: ['xem phim online', 'phim HD', 'phim miễn phí', 'macflix', 'phim chiếu rạp', 'anime'],
  openGraph: {
    title: 'Macflix — Xem Phim HD Miễn Phí',
    description: 'Nền tảng xem phim trực tuyến: phim lẻ, phim bộ, anime, phim chiếu rạp HD.',
    locale: 'vi_VN',
    type: 'website',
  },
  robots: {
    index: true,
    follow: true,
  },
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="vi" suppressHydrationWarning>
      <body className={`${inter.variable} font-sans`} suppressHydrationWarning>
        <AuthProvider>
          <ModalProvider>
            {children}
          </ModalProvider>
        </AuthProvider>
      </body>
    </html>
  );
}