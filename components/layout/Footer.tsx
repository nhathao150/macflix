'use client';

import Link from 'next/link';
import { Facebook, Instagram, Twitter } from 'lucide-react';

const LEGAL_LINKS = [
  { name: 'Privacy Policy - Chính sách bảo mật', href: '/chinh-sach-bao-mat' },
  { name: 'Terms of Service - Điều khoản sử dụng', href: '/dieu-khoan-su-dung' },
  { name: 'Copyright/DMCA - Thông báo bản quyền', href: '/ban-quyen-dmca' },
  { name: 'Contact Us - Liên hệ', href: '/lien-he' },
];

const SUPPORT_LINKS = [
  { name: 'Help/FAQ - Trợ giúp', href: '/tro-giup' },
  { name: 'Settings - Cài đặt', href: '/cai-dat' },
  { name: 'About - Giới thiệu ứng dụng', href: '/gioi-thieu' },
  { name: 'Version - Phiên bản ứng dụng', href: '/phien-ban' },
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

      <div className="max-w-[1400px] mx-auto px-6 md:px-10 py-6 md:py-10">
        <div className="grid grid-cols-2 md:grid-cols-3 gap-8 mb-6 md:mb-8">

          {/* Logo + tagline + Social */}
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

            {/* Social media links */}
            <div className="flex gap-2.5 mt-1">
              {[
                { label: 'Facebook', href: '#', icon: Facebook },
                { label: 'Instagram', href: '#', icon: Instagram },
                { label: 'Twitter', href: '#', icon: Twitter },
              ].map((s) => {
                const IconComponent = s.icon;
                return (
                  <a key={s.label} href={s.href} aria-label={s.label}
                    className="w-8 h-8 rounded-full bg-white/5 border border-white/10 flex items-center justify-center text-white/35 hover:text-[#d070ff] hover:border-[#d070ff]/40 transition-all duration-200">
                    <IconComponent className="w-4 h-4" />
                  </a>
                );
              })}
            </div>
          </div>

          {/* Thông tin Pháp lý & Chính sách */}
          <div className="col-span-1">
            <h4 className="text-white/60 text-[10px] sm:text-xs font-bold uppercase tracking-widest mb-3">Thông Tin Pháp Lý & Chính Sách</h4>
            <ul className="space-y-2">
              {LEGAL_LINKS.map((item) => (
                <li key={item.name}>
                  <Link href={item.href}
                    className="text-white/35 text-[11px] sm:text-xs hover:text-[#d070ff] transition-colors duration-200 block leading-snug">
                    {item.name}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Hỗ trợ & Khác */}
          <div className="col-span-1">
            <h4 className="text-white/60 text-[10px] sm:text-xs font-bold uppercase tracking-widest mb-3">Hỗ Trợ & Khác</h4>
            <ul className="space-y-2">
              {SUPPORT_LINKS.map((item) => (
                <li key={item.name}>
                  <Link href={item.href}
                    className="text-white/35 text-[11px] sm:text-xs hover:text-[#d070ff] transition-colors duration-200 block leading-snug">
                    {item.name}
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        </div>

        {/* Bottom bar */}
        <div className="border-t border-white/5 pt-5 flex flex-col sm:flex-row items-center justify-between gap-2">
          <p className="text-white/20 text-xs text-center sm:text-left">
            Copyright © {currentYear} Macflix · Chỉ dành cho mục đích giải trí
          </p>
          <p className="text-white/15 text-xs text-center sm:text-right">Phim HD · Phụ đề Tiếng Việt · Miễn phí</p>
        </div>
      </div>
    </footer>
  );
}
