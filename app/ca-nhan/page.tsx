'use client';

import { useState, useEffect, useRef, useCallback } from 'react';
import { useSession, signOut } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import Navbar from '@/components/Navbar';
import Image from 'next/image';
import Link from 'next/link';
import {
  User, Mail, Calendar, Film, Heart, Lock, Eye, EyeOff,
  Camera, Save, Loader2, CheckCircle, AlertCircle, Shield, ArrowLeft
} from 'lucide-react';

type ProfileData = {
  name: string;
  email: string;
  avatar: string;
  createdAt: string;
  watchCount: number;
  favoriteCount: number;
};

type Status = { type: 'success' | 'error'; message: string } | null;

export default function ProfilePage() {
  const { data: session, status, update } = useSession();
  const router = useRouter();

  const [profile, setProfile] = useState<ProfileData | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  // Avatar states
  const [avatarPreview, setAvatarPreview] = useState<string>('');
  const [isUploadingAvatar, setIsUploadingAvatar] = useState(false);
  const [avatarStatus, setAvatarStatus] = useState<Status>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Name states
  const [editName, setEditName] = useState('');
  const [isEditingName, setIsEditingName] = useState(false);
  const [isSavingName, setIsSavingName] = useState(false);
  const [nameStatus, setNameStatus] = useState<Status>(null);

  // Password states
  const [pwForm, setPwForm] = useState({ current: '', new: '', confirm: '' });
  const [showPw, setShowPw] = useState({ current: false, new: false, confirm: false });
  const [isSavingPw, setIsSavingPw] = useState(false);
  const [pwStatus, setPwStatus] = useState<Status>(null);

  const fetchProfile = useCallback(async () => {
    if (!session?.user?.email) return;
    try {
      const res = await fetch(`/api/profile?email=${session.user.email}`);
      const data = await res.json();
      if (res.ok) {
        setProfile(data);
        setEditName(data.name);
        setAvatarPreview(data.avatar || '');
      }
    } catch (e) {
      console.error('Lỗi load profile:', e);
    } finally {
      setIsLoading(false);
    }
  }, [session?.user?.email]);

  useEffect(() => {
    if (status === 'unauthenticated') {
      router.push('/dang-nhap');
      return;
    }
    if (status === 'authenticated') {
      fetchProfile();
    }
  }, [status, fetchProfile, router]);

  // ---- AVATAR ----
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (!file.type.startsWith('image/')) {
      setAvatarStatus({ type: 'error', message: 'Vui lòng chọn file ảnh (JPG, PNG, GIF...)' });
      return;
    }

    const reader = new FileReader();
    reader.onload = (ev) => {
      const base64 = ev.target?.result as string;
      // Resize ảnh xuống 200x200 trước khi lưu
      const img = document.createElement('img');
      img.onload = () => {
        const canvas = document.createElement('canvas');
        const size = 200;
        canvas.width = size;
        canvas.height = size;
        const ctx = canvas.getContext('2d')!;
        // Crop vuông từ giữa
        const min = Math.min(img.width, img.height);
        const sx = (img.width - min) / 2;
        const sy = (img.height - min) / 2;
        ctx.drawImage(img, sx, sy, min, min, 0, 0, size, size);
        setAvatarPreview(canvas.toDataURL('image/jpeg', 0.85));
        setAvatarStatus(null);
      };
      img.src = base64;
    };
    reader.readAsDataURL(file);
  };

  const handleSaveAvatar = async () => {
    if (!avatarPreview || avatarPreview === profile?.avatar) return;
    setIsUploadingAvatar(true);
    setAvatarStatus(null);
    try {
      const res = await fetch('/api/profile', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: session?.user?.email, avatar: avatarPreview }),
      });
      const data = await res.json();
      if (res.ok) {
        setProfile(prev => prev ? { ...prev, avatar: avatarPreview } : prev);
        setAvatarStatus({ type: 'success', message: 'Cập nhật ảnh đại diện thành công!' });
      } else {
        setAvatarStatus({ type: 'error', message: data.message });
      }
    } catch {
      setAvatarStatus({ type: 'error', message: 'Lỗi kết nối server!' });
    } finally {
      setIsUploadingAvatar(false);
    }
  };

  // ---- TÊN ----
  const handleSaveName = async () => {
    if (!editName.trim() || editName.trim() === profile?.name) {
      setIsEditingName(false);
      return;
    }
    setIsSavingName(true);
    setNameStatus(null);
    try {
      const res = await fetch('/api/profile', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: session?.user?.email, name: editName.trim() }),
      });
      const data = await res.json();
      if (res.ok) {
        setProfile(prev => prev ? { ...prev, name: data.name } : prev);
        setNameStatus({ type: 'success', message: 'Đã cập nhật tên hiển thị!' });
        setIsEditingName(false);
        await update({ name: data.name });
      } else {
        setNameStatus({ type: 'error', message: data.message });
      }
    } catch {
      setNameStatus({ type: 'error', message: 'Lỗi kết nối server!' });
    } finally {
      setIsSavingName(false);
    }
  };

  // ---- MẬT KHẨU ----
  const handleSavePassword = async (e: React.FormEvent) => {
    e.preventDefault();
    setPwStatus(null);
    if (!pwForm.current || !pwForm.new || !pwForm.confirm) {
      setPwStatus({ type: 'error', message: 'Vui lòng điền đầy đủ thông tin!' });
      return;
    }
    if (pwForm.new !== pwForm.confirm) {
      setPwStatus({ type: 'error', message: 'Mật khẩu mới không khớp!' });
      return;
    }
    if (pwForm.new.length < 6) {
      setPwStatus({ type: 'error', message: 'Mật khẩu mới phải có ít nhất 6 ký tự!' });
      return;
    }
    setIsSavingPw(true);
    try {
      const res = await fetch('/api/profile', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          email: session?.user?.email,
          currentPassword: pwForm.current,
          newPassword: pwForm.new,
        }),
      });
      const data = await res.json();
      if (res.ok) {
        setPwStatus({ type: 'success', message: 'Đổi mật khẩu thành công! Đang đăng xuất...' });
        setPwForm({ current: '', new: '', confirm: '' });
        setTimeout(() => signOut(), 2000);
      } else {
        setPwStatus({ type: 'error', message: data.message });
      }
    } catch {
      setPwStatus({ type: 'error', message: 'Lỗi kết nối server!' });
    } finally {
      setIsSavingPw(false);
    }
  };

  // ---- LOADING STATE ----
  if (isLoading || status === 'loading') {
    return (
      <main className="min-h-screen bg-[#010030] flex items-center justify-center">
        <div className="flex flex-col items-center gap-4">
          <Loader2 className="w-10 h-10 animate-spin" style={{color:'#F042FF'}} />
          <p className="text-white/50 text-sm">Đang tải thông tin...</p>
        </div>
      </main>
    );
  }

  const avatarInitial = (profile?.name || session?.user?.name || 'U').charAt(0).toUpperCase();
  const hasNewAvatar = avatarPreview && avatarPreview !== profile?.avatar;

  return (
    <main className="min-h-screen bg-[#010030] text-white pb-20 selection:bg-[#F042FF]/30">
      <Navbar />

      {/* Hero bar */}
      <div className="relative overflow-hidden pt-[90px]">
        <div className="absolute inset-0 bg-gradient-to-b from-[#F042FF]/10 via-[#7226FF]/5 to-transparent pointer-events-none" />
        <div className="max-w-5xl mx-auto px-4 md:px-8 py-8 flex items-center gap-4">
          <Link href="/" className="flex items-center gap-2 text-white/50 hover:text-white transition-colors text-sm">
            <ArrowLeft className="w-4 h-4" /> Trang chủ
          </Link>
          <span className="text-white/20">/</span>
          <span className="text-white/80 text-sm font-medium">Tùy chỉnh thông tin</span>
        </div>
      </div>

      <div className="max-w-5xl mx-auto px-4 md:px-8 grid grid-cols-1 lg:grid-cols-3 gap-6">

        {/* ============ CỘT TRÁI: AVATAR ============ */}
        <div className="lg:col-span-1 flex flex-col gap-6">
          <div className="bg-white/5 border border-white/10 rounded-3xl p-6 backdrop-blur-sm flex flex-col items-center gap-5">
            {/* Avatar display */}
            <div className="relative group">
      <div className="w-32 h-32 rounded-full ring-4 ring-white/10 group-hover:ring-[#F042FF]/50 transition-all duration-300 overflow-hidden shadow-2xl">
                {avatarPreview ? (
                  <Image
                    src={avatarPreview}
                    alt="Avatar"
                    width={128}
                    height={128}
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <div className="w-full h-full flex items-center justify-center text-4xl font-black text-white" style={{background:'linear-gradient(135deg,#F042FF,#7226FF)'}}>
                    {avatarInitial}
                  </div>
                )}
              </div>
              <button
                onClick={() => fileInputRef.current?.click()}
                className="absolute bottom-0 right-0 w-9 h-9 rounded-full flex items-center justify-center shadow-lg transition-all hover:scale-110 border-2 border-[#010030]"
                style={{background:'#F042FF'}}>

                <Camera className="w-4 h-4 text-white" />
              </button>
            </div>

            <input
              ref={fileInputRef}
              type="file"
              accept="image/*"
              className="hidden"
              onChange={handleFileChange}
            />

            <div className="text-center">
              <h2 className="text-lg font-bold text-white truncate max-w-[180px]">{profile?.name}</h2>
              <p className="text-xs text-white/50 truncate max-w-[180px] mt-1">{profile?.email}</p>
            </div>

            {hasNewAvatar && (
              <div className="w-full flex flex-col gap-2">
            <p className="text-sm font-medium" style={{color:'#F042FF'}}>Ảnh mới chưa được lưu</p>
                <button
                  onClick={handleSaveAvatar}
                  disabled={isUploadingAvatar}
                  className="w-full py-2.5 rounded-xl text-white text-sm font-bold transition-all flex items-center justify-center gap-2 disabled:opacity-50"
                  style={{background:'linear-gradient(135deg,#F042FF,#7226FF)',boxShadow:'0 0 20px rgba(240,66,255,0.3)'}}
                >
                  {isUploadingAvatar ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
                  {isUploadingAvatar ? 'Đang lưu...' : 'Lưu ảnh đại diện'}
                </button>
                <button
                  onClick={() => {
                    setAvatarPreview(profile?.avatar || '');
                    setAvatarStatus(null);
                  }}
                  className="w-full py-2 rounded-xl bg-white/5 hover:bg-white/10 text-white/60 text-sm transition-colors"
                >
                  Hủy
                </button>
              </div>
            )}

            {!hasNewAvatar && (
              <button
                onClick={() => fileInputRef.current?.click()}
                className="w-full py-2.5 rounded-xl border border-white/10 hover:border-white/20 text-white/70 hover:text-white text-sm font-medium transition-all flex items-center justify-center gap-2"
            style={{background:'rgba(255,255,255,0.05)'}}
              >
                <Camera className="w-4 h-4" /> Đổi ảnh đại diện
              </button>
            )}

            {avatarStatus && (
              <StatusBadge status={avatarStatus} />
            )}

            {/* Stats */}
            <div className="w-full grid grid-cols-2 gap-3 pt-2 border-t border-white/10">
              <Link href="/lich-su" className="flex flex-col items-center gap-1 p-3 bg-white/5 hover:bg-white/10 rounded-2xl transition-colors group">
                <Film className="w-5 h-5 group-hover:scale-110 transition-transform" style={{color:'#87F5F5'}} />
                <span className="text-lg font-black text-white">{profile?.watchCount ?? 0}</span>
                <span className="text-[10px] text-white/50">Đã xem</span>
              </Link>
              <Link href="/yeu-thich" className="flex flex-col items-center gap-1 p-3 bg-white/5 hover:bg-white/10 rounded-2xl transition-colors group">
                <Heart className="w-5 h-5 group-hover:scale-110 transition-transform" style={{color:'#F042FF'}} />
                <span className="text-lg font-black text-white">{profile?.favoriteCount ?? 0}</span>
                <span className="text-[10px] text-white/50">Yêu thích</span>
              </Link>
            </div>
          </div>
        </div>

        {/* ============ CỘT PHẢI: INFO + PASSWORD ============ */}
        <div className="lg:col-span-2 flex flex-col gap-6">

          {/* ---- THÔNG TIN TÀI KHOẢN ---- */}
          <div className="bg-white/5 border border-white/10 rounded-3xl p-6 backdrop-blur-sm">
            <div className="flex items-center gap-3 mb-6">
              <div className="w-9 h-9 rounded-xl flex items-center justify-center" style={{background:'rgba(240,66,255,0.2)'}}>
                <User className="w-5 h-5" style={{color:'#F042FF'}} />
              </div>
              <h3 className="text-base font-bold text-white">Thông tin tài khoản</h3>
            </div>

            <div className="flex flex-col gap-4">
              {/* Tên */}
              <div className="flex flex-col gap-1.5">
                <label className="text-xs text-white/50 font-medium uppercase tracking-wider">Tên hiển thị</label>
                <div className="flex items-center gap-3">
                  {isEditingName ? (
                    <>
                      <input
                        type="text"
                        value={editName}
                        onChange={(e) => setEditName(e.target.value)}
                        onKeyDown={(e) => { if (e.key === 'Enter') handleSaveName(); if (e.key === 'Escape') { setIsEditingName(false); setEditName(profile?.name || ''); } }}
                        className="flex-1 border rounded-xl px-4 py-2.5 text-sm text-white outline-none transition-all"
                        style={{background:'rgba(255,255,255,0.1)',borderColor:'rgba(240,66,255,0.5)'}}
                        autoFocus
                      />
                      <button onClick={handleSaveName} disabled={isSavingName} className="px-4 py-2.5 rounded-xl text-white text-xs font-bold transition-all flex items-center gap-1.5 disabled:opacity-50" style={{background:'#F042FF'}}>
                        {isSavingName ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Save className="w-3.5 h-3.5" />}
                        Lưu
                      </button>
                      <button onClick={() => { setIsEditingName(false); setEditName(profile?.name || ''); }} className="px-3 py-2.5 bg-white/10 hover:bg-white/15 rounded-xl text-xs text-white/60 transition-all">
                        Hủy
                      </button>
                    </>
                  ) : (
                    <>
                      <div className="flex-1 bg-white/5 border border-white/10 rounded-xl px-4 py-2.5 text-sm text-white">
                        {profile?.name}
                      </div>
                      <button
                        onClick={() => setIsEditingName(true)}
                        className="px-4 py-2.5 bg-white/10 hover:bg-white/15 rounded-xl text-xs text-white/70 hover:text-white font-medium transition-all"
                      >
                        Sửa
                      </button>
                    </>
                  )}
                </div>
                {nameStatus && <StatusBadge status={nameStatus} />}
              </div>

              {/* Email */}
              <div className="flex flex-col gap-1.5">
                <label className="text-xs text-white/50 font-medium uppercase tracking-wider flex items-center gap-1.5">
                  <Mail className="w-3 h-3" /> Email
                </label>
                <div className="flex items-center gap-3">
                  <div className="flex-1 bg-white/5 border border-white/10 rounded-xl px-4 py-2.5 text-sm text-white/60 flex items-center gap-2">
                    {profile?.email}
                  </div>
                  <div className="px-3 py-2.5 bg-white/5 rounded-xl text-[10px] text-white/30 font-medium border border-white/5">
                    Cố định
                  </div>
                </div>
              </div>

              {/* Ngày tạo */}
              <div className="flex flex-col gap-1.5">
                <label className="text-xs text-white/50 font-medium uppercase tracking-wider flex items-center gap-1.5">
                  <Calendar className="w-3 h-3" /> Ngày tham gia
                </label>
                <div className="bg-white/5 border border-white/10 rounded-xl px-4 py-2.5 text-sm text-white/60">
                  {profile?.createdAt
                    ? new Date(profile.createdAt).toLocaleDateString('vi-VN', { day: '2-digit', month: '2-digit', year: 'numeric' })
                    : '---'}
                </div>
              </div>
            </div>
          </div>

          {/* ---- ĐỔI MẬT KHẨU ---- */}
          <div className="bg-white/5 border border-white/10 rounded-3xl p-6 backdrop-blur-sm">
            <div className="flex items-center gap-3 mb-6">
              <div className="w-9 h-9 rounded-xl flex items-center justify-center" style={{background:'rgba(114,38,255,0.2)'}}>
                <Shield className="w-5 h-5" style={{color:'#7226FF'}} />
              </div>
              <h3 className="text-base font-bold text-white">Bảo mật & Mật khẩu</h3>
            </div>

            <form onSubmit={handleSavePassword} className="flex flex-col gap-4">
              <PasswordField
                label="Mật khẩu hiện tại"
                value={pwForm.current}
                show={showPw.current}
                onChange={(v) => setPwForm(p => ({ ...p, current: v }))}
                onToggle={() => setShowPw(p => ({ ...p, current: !p.current }))}
                placeholder="Nhập mật khẩu hiện tại"
              />
              <PasswordField
                label="Mật khẩu mới"
                value={pwForm.new}
                show={showPw.new}
                onChange={(v) => setPwForm(p => ({ ...p, new: v }))}
                onToggle={() => setShowPw(p => ({ ...p, new: !p.new }))}
                placeholder="Ít nhất 6 ký tự"
              />
              <PasswordField
                label="Xác nhận mật khẩu mới"
                value={pwForm.confirm}
                show={showPw.confirm}
                onChange={(v) => setPwForm(p => ({ ...p, confirm: v }))}
                onToggle={() => setShowPw(p => ({ ...p, confirm: !p.confirm }))}
                placeholder="Nhập lại mật khẩu mới"
                isMatch={pwForm.confirm ? pwForm.new === pwForm.confirm : undefined}
              />

              {pwStatus && <StatusBadge status={pwStatus} />}

              <button
                type="submit"
                disabled={isSavingPw}
                className="mt-1 py-3 rounded-xl text-white font-bold text-sm transition-all flex items-center justify-center gap-2 disabled:opacity-50 hover:opacity-90"
                style={{background:'linear-gradient(135deg,#7226FF,#F042FF)',boxShadow:'0 0 20px rgba(114,38,255,0.2)'}}>   
                {isSavingPw ? <Loader2 className="w-4 h-4 animate-spin" /> : <Lock className="w-4 h-4" />}
                {isSavingPw ? 'Đang lưu...' : 'Cập nhật mật khẩu'}
              </button>
            </form>
          </div>

        </div>
      </div>
    </main>
  );
}

// ---- Sub-components ----

function StatusBadge({ status }: { status: { type: 'success' | 'error'; message: string } }) {
  const isOk = status.type === 'success';
  return (
    <div className={`flex items-center gap-2 px-3 py-2 rounded-xl text-xs font-medium ${
      isOk ? 'bg-green-500/10 text-green-400 border border-green-500/20' : 'bg-red-500/10 text-red-400 border border-red-500/20'
    }`}>
      {isOk ? <CheckCircle className="w-3.5 h-3.5 shrink-0" /> : <AlertCircle className="w-3.5 h-3.5 shrink-0" />}
      {status.message}
    </div>
  );
}

function PasswordField({
  label, value, show, onChange, onToggle, placeholder, isMatch
}: {
  label: string; value: string; show: boolean;
  onChange: (v: string) => void; onToggle: () => void;
  placeholder?: string; isMatch?: boolean;
}) {
  const borderColor = isMatch === undefined ? 'border-white/10' : isMatch ? 'border-green-500/50' : 'border-red-500/50';
  return (
    <div className="flex flex-col gap-1.5">
      <label className="text-xs text-white/50 font-medium uppercase tracking-wider">{label}</label>
      <div className={`flex items-center bg-white/5 border ${borderColor} rounded-xl px-4 py-2.5 focus-within:border-purple-500/50 focus-within:ring-2 focus-within:ring-purple-500/20 transition-all`}>
        <input
          type={show ? 'text' : 'password'}
          value={value}
          onChange={(e) => onChange(e.target.value)}
          placeholder={placeholder}
          className="flex-1 bg-transparent border-none outline-none text-sm text-white placeholder:text-white/30"
        />
        <button type="button" onClick={onToggle} className="text-white/40 hover:text-white/70 transition-colors ml-2">
          {show ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
        </button>
      </div>
    </div>
  );
}
