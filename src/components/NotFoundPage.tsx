import React from 'react';
import { Link } from 'react-router-dom';
import { Home, BookOpen, FileText, Headphones, Award, Route, Search, ArrowRight } from 'lucide-react';
import ShibaMascot from './mascot/ShibaMascot';
import JpStudyLogo from './JpStudyLogo';
import { BRAND_NAME } from '../constants/brand';

export default function NotFoundPage() {
  const quickLinks = [
    { label: 'Ngữ pháp (Bunpo)', path: '/bunpo', icon: FileText, color: 'text-cyan-400 bg-cyan-500/10 border-cyan-500/30' },
    { label: 'Hán tự (Kanji)', path: '/kanji', icon: BookOpen, color: 'text-amber-400 bg-amber-500/10 border-amber-500/30' },
    { label: 'Từ vựng (Tango)', path: '/tango', icon: BookOpen, color: 'text-emerald-400 bg-emerald-500/10 border-emerald-500/30' },
    { label: 'JLPT Listening (Cho)', path: '/cho', icon: Headphones, color: 'text-emerald-400 bg-emerald-500/10 border-emerald-500/30' },
    { label: 'Luyện thi JLPT', path: '/jlpt', icon: Award, color: 'text-rose-400 bg-rose-500/10 border-rose-500/30' },
    { label: 'Lộ trình học', path: '/lo-trinh', icon: Route, color: 'text-purple-400 bg-purple-500/10 border-purple-500/30' },
  ];

  return (
    <div className="flex-1 flex items-center justify-center p-4 sm:p-6 min-h-[70vh]">
      <div className="w-full max-w-lg bg-[#111827]/90 border border-slate-800 rounded-3xl p-6 sm:p-8 text-center space-y-6 shadow-2xl backdrop-blur-md">
        {/* Brand Logo Header */}
        <div className="flex justify-center">
          <Link to="/" className="inline-block hover:opacity-90 transition-opacity">
            <JpStudyLogo size="md" dark={true} showSubtitle={true} layout="vertical" />
          </Link>
        </div>

        {/* Mascot */}
        <div className="flex justify-center">
          <div className="p-4 rounded-3xl bg-slate-800/60 border border-slate-700/60 inline-block shadow-inner">
            <ShibaMascot pose="wrong_answer" size={80} animated={true} />
          </div>
        </div>

        {/* Header error code & text */}
        <div className="space-y-2">
          <span className="px-3 py-1 rounded-full text-xs font-mono font-black tracking-widest bg-rose-500/20 text-rose-300 border border-rose-500/40 uppercase">
            Lỗi 404 - Không tìm thấy trang
          </span>
          <h1 className="text-xl sm:text-2xl font-black text-white tracking-tight pt-1">
            Đường dẫn không tồn tại
          </h1>
          <p className="text-xs sm:text-sm text-slate-400 max-w-md mx-auto leading-relaxed">
            Đường dẫn bạn vừa mở có thể đã được thay đổi cấu trúc URL hoặc không chính xác trên {BRAND_NAME}.
          </p>
        </div>

        {/* Primary Call to Action */}
        <div className="pt-2">
          <Link
            to="/"
            className="inline-flex items-center justify-center gap-2 px-6 py-3 rounded-2xl bg-gradient-to-r from-[#E89A3C] to-[#E64556] text-white font-extrabold text-sm shadow-lg shadow-amber-950/40 hover:brightness-110 active:scale-98 transition-all"
          >
            <Home className="w-4 h-4" />
            <span>Về Trung tâm Luyện tập</span>
            <ArrowRight className="w-4 h-4 ml-1" />
          </Link>
        </div>

        {/* Quick Links Grid */}
        <div className="pt-4 border-t border-slate-800/80 text-left">
          <p className="text-xs font-bold text-slate-400 mb-3 text-center uppercase tracking-wider">
            Các chuyên mục học phổ biến:
          </p>
          <div className="grid grid-cols-2 gap-2">
            {quickLinks.map((item) => {
              const Icon = item.icon;
              return (
                <Link
                  key={item.path}
                  to={item.path}
                  className={`p-2.5 rounded-xl border flex items-center gap-2 text-xs font-bold transition-all hover:scale-[1.02] hover:bg-slate-800/70 text-slate-200 ${item.color}`}
                >
                  <Icon className="w-4 h-4 shrink-0" />
                  <span className="truncate">{item.label}</span>
                </Link>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
}
