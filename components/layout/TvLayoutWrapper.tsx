'use client';

import React from 'react';
import { useTv } from '@/context/TvContext';
import TvSidebar from './TvSidebar';

export default function TvLayoutWrapper({ children }: { children: React.ReactNode }) {
  const { isTvMode } = useTv();

  if (isTvMode) {
    return (
      <div className="min-h-screen flex bg-[#0a0a0c]">
        <TvSidebar />
        <div className="flex-1 w-full min-w-0">
          {children}
        </div>
      </div>
    );
  }

  return <>{children}</>;
}
