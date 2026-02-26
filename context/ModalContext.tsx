'use client';

import { createContext, useContext, useState, ReactNode } from 'react';
import MovieModal from '@/components/MovieModal'; // Đường dẫn đến file MovieModal của bạn

// Định nghĩa kiểu dữ liệu cho Context
interface ModalContextType {
  openModal: (movie: any) => void;
  closeModal: () => void;
}

const ModalContext = createContext<ModalContextType | undefined>(undefined);

// Provider bọc ngoài ứng dụng
export function ModalProvider({ children }: { children: ReactNode }) {
  const [isOpen, setIsOpen] = useState(false);
  const [selectedMovie, setSelectedMovie] = useState<any>(null);

  const openModal = (movie: any) => {
    setSelectedMovie(movie);
    setIsOpen(true);
  };

  const closeModal = () => {
    setIsOpen(false);
    setTimeout(() => setSelectedMovie(null), 300); // Chờ animation đóng xong mới xóa data
  };

  return (
    <ModalContext.Provider value={{ openModal, closeModal }}>
      {children}
      {/* Đặt MovieModal ở đây để nó luôn sẵn sàng đè lên mọi trang */}
      <MovieModal isOpen={isOpen} onClose={closeModal} movie={selectedMovie} />
    </ModalContext.Provider>
  );
}

// Custom Hook để gọi Modal từ bất kỳ đâu
export function useModal() {
  const context = useContext(ModalContext);
  if (context === undefined) {
    throw new Error('useModal must be used within a ModalProvider');
  }
  return context;
}