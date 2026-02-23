import type {Metadata} from 'next';
import { Inter } from 'next/font/google';
import './globals.css';

const inter = Inter({
  subsets: ['latin'],
  variable: '--font-sans',
});

export const metadata: Metadata = {
  title: 'Liquid Glass Movies',
  description: 'A glassmorphism-styled movie streaming application interface.',
};

export default function RootLayout({children}: {children: React.ReactNode}) {
  return (
    <html lang="en" className={`${inter.variable} dark`}>
      <body className="font-sans antialiased text-white min-h-screen bg-slate-950 overflow-x-hidden relative" suppressHydrationWarning>
        {/* Abstract Background */}
        <div className="fixed inset-0 z-[-1] bg-[radial-gradient(ellipse_at_top_left,_var(--tw-gradient-stops))] from-blue-900/40 via-purple-900/40 to-emerald-900/40 opacity-80 blur-3xl"></div>
        <div className="fixed inset-0 z-[-1] bg-[radial-gradient(ellipse_at_bottom_right,_var(--tw-gradient-stops))] from-orange-900/30 via-rose-900/30 to-cyan-900/30 opacity-80 blur-3xl"></div>
        {children}
      </body>
    </html>
  );
}
