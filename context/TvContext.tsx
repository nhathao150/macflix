'use client';

import React, { createContext, useContext, useState, useEffect } from 'react';
import { useSession } from 'next-auth/react';

interface TvContextType {
  isTvMode: boolean;
  setIsTvMode: (value: boolean) => void;
  isDesignatedAccount: boolean;
}

const DESIGNATED_TV_EMAIL = 'tranphannhathao159@gmail.com';

const TvContext = createContext<TvContextType>({
  isTvMode: false,
  setIsTvMode: () => {},
  isDesignatedAccount: false,
});

export const TvProvider = ({ children }: { children: React.ReactNode }) => {
  const { data: session, status } = useSession();
  const [isTvMode, setIsTvMode] = useState(false);
  const [isDesignatedAccount, setIsDesignatedAccount] = useState(false);

  useEffect(() => {
    if (typeof window === 'undefined') return;

    const userEmail = session?.user?.email?.toLowerCase() || '';
    const isTvEmail = userEmail === DESIGNATED_TV_EMAIL.toLowerCase();
    const isTvUa = navigator.userAgent.includes('MacFlixAndroidTV') || /GoogleTV|AndroidTV|SmartTV|Leanback/i.test(navigator.userAgent);
    
    // Kiểm tra thêm thủ công nếu người dùng test bằng localStorage
    const localTvOverride = localStorage.getItem('macflix_tv_mode') === 'true';

    const shouldEnableTvMode = isTvEmail || isTvUa || localTvOverride;

    setIsDesignatedAccount(isTvEmail);
    setIsTvMode(shouldEnableTvMode);

    if (shouldEnableTvMode) {
      document.body.classList.add('tv-mode-active');
    } else {
      document.body.classList.remove('tv-mode-active');
    }
  }, [session, status]);

  return (
    <TvContext.Provider value={{ isTvMode, setIsTvMode, isDesignatedAccount }}>
      {children}
    </TvContext.Provider>
  );
};

export const useTv = () => useContext(TvContext);
