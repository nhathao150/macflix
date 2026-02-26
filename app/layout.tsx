import type { Metadata } from 'next';
import './globals.css';

// 1. Import trạm phát sóng của NextAuth (từ file Providers.tsx của bạn)
import { AuthProvider } from './Providers'; 
// 2. Import trạm phát sóng của Modal Popup (lưu ý dùng ./context cho chuẩn đường dẫn)
import { ModalProvider } from '@/context/ModalContext';

export const metadata: Metadata = {
  title: 'Macflix',
  description: 'Trải nghiệm xem phim mượt mà',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="vi">
      <body>
        {/* Lớp giáp 1: Quản lý tài khoản (NextAuth) nằm ngoài cùng */}
        <AuthProvider>
          {/* Lớp giáp 2: Quản lý Popup (Modal) nằm bên trong */}
          <ModalProvider>
            {children}
          </ModalProvider>
        </AuthProvider>
      </body>
    </html>
  );
}