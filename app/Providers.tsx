'use client';

import { SessionProvider } from "next-auth/react";
import { TvProvider } from "@/context/TvContext";
import TvNavigationListener from "@/components/layout/TvNavigationListener";

export const AuthProvider = ({ children }: { children: React.ReactNode }) => {
  return (
    <SessionProvider>
      <TvProvider>
        <TvNavigationListener />
        {children}
      </TvProvider>
    </SessionProvider>
  );
};