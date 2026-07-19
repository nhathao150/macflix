'use client';

import { SessionProvider } from "next-auth/react";
import TvNavigationListener from "@/components/layout/TvNavigationListener";

export const AuthProvider = ({ children }: { children: React.ReactNode }) => {
  return (
    <SessionProvider>
      <TvNavigationListener />
      {children}
    </SessionProvider>
  );
};