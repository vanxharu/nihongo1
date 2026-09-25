/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { 
  BookMarked, 
  BarChart3, 
  Puzzle, 
  MessagesSquare, 
  BookOpen, 
  ShieldCheck, 
  X, 
  Coins, 
  Bookmark, 
  Search, 
  Radio, 
  Sliders, 
  ChevronDown, 
  ChevronUp, 
  Award,
  PenTool,
  Route,
  TrendingUp,
  Trophy,
  GraduationCap,
  Headphones
} from 'lucide-react';
import JpStudyLogo from './JpStudyLogo';
import ShibaMascot from './mascot/ShibaMascot';
import { motion, AnimatePresence } from 'motion/react';
import { UserProfile } from '../types';
import { SidebarWindowsInstallCard } from './PwaInstallPrompt';
import { calculateUnlockedAchievements, TOTAL_ACHIEVEMENTS_COUNT } from '../data/achievementsData';

interface SidebarProps {
  currentTab: string;
  setCurrentTab: (tab: string) => void;
  userCoins: number;
  isOpen: boolean;
  onClose: () => void;
  userProfile?: UserProfile;
}

export default function Sidebar({ currentTab, setCurrentTab, userCoins, isOpen, onClose, userProfile }: SidebarProps) {
  const location = useLocation();

  // Collapsible toggle for secondary options
  const isSecondaryActive = ['notebook', 'achievements', 'progress', 'admin'].includes(currentTab);
  const [showMoreOptions, setShowMoreOptions] = useState<boolean>(isSecondaryActive);

  const unlockedCount = calculateUnlockedAchievements(userProfile).size;

  // CHỨC NĂNG CHÍNH VỚI URL ROUTE CHUẨN
  const primaryMenuItems = [
    { 
      id: 'practice', 
      path: '/',
      label: 'Trung tâm Luyện tập', 
      icon: GraduationCap, 
      iconColor: 'text-cyan-400', 
      activeBg: 'bg-gradient-to-r from-cyan-500/25 via-blue-500/15 to-transparent border-cyan-400/60 text-cyan-100 shadow-[0_0_18px_rgba(6,182,212,0.25)]',
      activeIconBg: 'bg-cyan-400/25 border border-cyan-400/50 shadow-[0_0_10px_rgba(6,182,212,0.4)]',
      dotColor: 'bg-cyan-400 shadow-[0_0_8px_#22D3EE]'
    },
    { 
      id: 'exam', 
      path: '/jlpt',
      label: 'Luyện thi JLPT', 
      icon: Award, 
      iconColor: 'text-rose-400', 
      activeBg: 'bg-gradient-to-r from-rose-500/25 via-pink-500/15 to-transparent border-rose-400/60 text-rose-100 shadow-[0_0_18px_rgba(244,63,94,0.25)]',
      activeIconBg: 'bg-rose-400/25 border border-rose-400/50 shadow-[0_0_10px_rgba(244,63,94,0.4)]',
      dotColor: 'bg-rose-400 shadow-[0_0_8px_#F43F5E]'
    },
    { 
      id: 'roadmap', 
      path: '/lo-trinh',
      label: 'Lộ trình JLPT', 
      icon: Route, 
      iconColor: 'text-purple-400', 
      activeBg: 'bg-gradient-to-r from-purple-500/25 via-indigo-500/15 to-transparent border-purple-400/60 text-purple-100 shadow-[0_0_18px_rgba(168,85,247,0.25)]',
      activeIconBg: 'bg-purple-400/25 border border-purple-400/50 shadow-[0_0_10px_rgba(168,85,247,0.4)]',
      dotColor: 'bg-purple-400 shadow-[0_0_8px_#C084FC]'
    },
    { 
      id: 'grammar', 
      path: '/bunpo',
      label: 'Lý thuyết (Ngữ pháp, Từ vựng, Hán tự)', 
      icon: BookOpen, 
      iconColor: 'text-cyan-400', 
      activeBg: 'bg-gradient-to-r from-cyan-500/25 via-teal-500/15 to-transparent border-cyan-400/60 text-cyan-100 shadow-[0_0_18px_rgba(6,182,212,0.25)]',
      activeIconBg: 'bg-cyan-400/25 border border-cyan-400/50 shadow-[0_0_10px_rgba(6,182,212,0.4)]',
      dotColor: 'bg-cyan-400 shadow-[0_0_8px_#22D3EE]'
    },
    { 
      id: 'reading', 
      path: '/doc-hieu',
      label: 'Đọc hiểu & Tin tức', 
      icon: BookOpen, 
      iconColor: 'text-indigo-400', 
      activeBg: 'bg-gradient-to-r from-indigo-500/25 via-purple-500/15 to-transparent border-indigo-400/60 text-indigo-100 shadow-[0_0_18px_rgba(99,102,241,0.25)]',
      activeIconBg: 'bg-indigo-400/25 border border-indigo-400/50 shadow-[0_0_10px_rgba(99,102,241,0.4)]',
      dotColor: 'bg-indigo-400 shadow-[0_0_8px_#818CF8]'
    },
    { 
      id: 'listening', 
      path: '/cho',
      label: 'JLPT Listening', 
      icon: Headphones, 
      iconColor: 'text-emerald-400', 
      activeBg: 'bg-gradient-to-r from-emerald-500/25 via-teal-500/15 to-transparent border-emerald-400/60 text-emerald-100 shadow-[0_0_18px_rgba(16,185,129,0.25)]',
      activeIconBg: 'bg-emerald-400/25 border border-emerald-400/50 shadow-[0_0_10px_rgba(16,185,129,0.4)]',
      dotColor: 'bg-emerald-400 shadow-[0_0_8px_#10B981]'
    },
    { 
      id: 'study-books', 
      path: '/sach',
      label: 'Sách ôn thi', 
      icon: BookMarked, 
      iconColor: 'text-amber-400', 
      activeBg: 'bg-gradient-to-r from-amber-500/25 via-orange-500/15 to-transparent border-amber-400/60 text-amber-100 shadow-[0_0_18px_rgba(245,158,11,0.25)]',
      activeIconBg: 'bg-amber-400/25 border border-amber-400/50 shadow-[0_0_10px_rgba(245,158,11,0.4)]',
      dotColor: 'bg-amber-400 shadow-[0_0_8px_#F59E0B]'
    },
    { 
      id: 'japanese-chat', 
      path: '/chat-ai',
      label: 'Luyện thoại Kaiwa', 
      icon: MessagesSquare, 
      iconColor: 'text-amber-400', 
      activeBg: 'bg-gradient-to-r from-amber-500/25 via-orange-500/15 to-transparent border-amber-400/60 text-amber-100 shadow-[0_0_18px_rgba(245,158,11,0.25)]',
      activeIconBg: 'bg-amber-400/25 border border-amber-400/50 shadow-[0_0_10px_rgba(245,158,11,0.4)]',
      dotColor: 'bg-amber-400 shadow-[0_0_8px_#F59E0B]'
    }
  ];

  // GÔM VÀO NÚT TÙY CHỌN & MỞ RỘNG (Sổ tay từ vựng, Tiến độ, Quản trị Admin)
  const secondaryMenuItems = [
    { 
      id: 'notebook', 
      path: '/so-tay',
      label: 'Sổ tay từ vựng', 
      icon: Bookmark, 
      iconColor: 'text-amber-400', 
      activeBg: 'bg-gradient-to-r from-amber-500/25 to-transparent border-amber-400/50 text-amber-100',
      activeIconBg: 'bg-amber-400/20 border border-amber-400/40',
      dotColor: 'bg-amber-400'
    },
    { 
      id: 'achievements', 
      path: '/thanh-tich',
      label: `Thành tựu (${unlockedCount}/${TOTAL_ACHIEVEMENTS_COUNT})`, 
      icon: Trophy, 
      iconColor: 'text-amber-400', 
      activeBg: 'bg-gradient-to-r from-amber-500/25 to-transparent border-amber-400/50 text-amber-100',
      activeIconBg: 'bg-amber-400/20 border border-amber-400/40',
      dotColor: 'bg-amber-400'
    },
    { 
      id: 'progress', 
      path: '/xep-hang',
      label: 'Tiến độ & Thống kê', 
      icon: BarChart3, 
      iconColor: 'text-cyan-400', 
      activeBg: 'bg-gradient-to-r from-cyan-500/25 to-transparent border-cyan-400/50 text-cyan-100',
      activeIconBg: 'bg-cyan-400/20 border border-cyan-400/40',
      dotColor: 'bg-cyan-400'
    },
    ...(userProfile?.role === 'admin' ? [{ 
      id: 'admin', 
      path: '/admin',
      label: 'Quản trị Admin', 
      icon: ShieldCheck, 
      iconColor: 'text-orange-400',
      activeBg: 'bg-gradient-to-r from-orange-500/25 to-transparent border-orange-400/50 text-orange-100',
      activeIconBg: 'bg-orange-400/20 border border-orange-400/40',
      dotColor: 'bg-orange-400'
    }] : []),
  ];

  return (
    <>
      {/* Mobile & Tablet Backdrop Overlay */}
      {isOpen && (
        <div 
          className="fixed inset-0 bg-slate-950/80 backdrop-blur-sm z-50 xl:hidden"
          onClick={onClose}
        />
      )}

      <aside 
        id="app-sidebar" 
        className={`fixed inset-y-0 left-0 z-50 xl:static xl:flex flex-col w-[280px] xl:w-64 max-w-[85vw] bg-gradient-to-b from-[#0F172A] via-[#16192E] to-[#0D111E] border-r border-rose-900/30 shadow-2xl h-screen shrink-0 select-none transition-transform duration-300 ${
          isOpen ? 'translate-x-0' : '-translate-x-full xl:translate-x-0'
        }`}
      >
        {/* Brand Logo & Close Action */}
        <div 
          id="sidebar-brand" 
          className="h-16 flex items-center justify-between px-3.5 sm:px-4 gap-2 bg-[#13172E]/90 backdrop-blur-md border-b border-rose-500/20"
        >
          <Link
            to="/"
            onClick={onClose}
            className="flex items-center gap-2 cursor-pointer outline-hidden"
            title="Về Trang chủ NihonGo!"
          >
            <JpStudyLogo size="md" dark={true} showSubtitle={true} />
          </Link>

          {/* Close button for mobile & tablet view */}
          <button 
            onClick={(e) => {
              e.stopPropagation();
              onClose();
            }}
            className="p-1.5 bg-slate-800/80 hover:bg-slate-700 text-slate-300 hover:text-white rounded-xl xl:hidden transition-colors cursor-pointer border border-rose-500/30 shrink-0"
            title="Đóng menu"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Navigation Menu */}
        <nav id="sidebar-nav" className="flex-1 px-3 py-3 space-y-1 overflow-y-auto">
          {/* 9 Chức năng chính */}
          {primaryMenuItems.map((item) => {
            const IconComponent = item.icon;
            const isActive = currentTab === item.id || (item.path === '/' ? location.pathname === '/' : location.pathname.startsWith(item.path));
            
            return (
              <Link
                key={item.id}
                id={`sidebar-tab-${item.id}`}
                to={item.path}
                onClick={() => {
                  setCurrentTab(item.id);
                  onClose();
                }}
                className={`w-full flex items-center px-3 py-2 rounded-2xl transition-all duration-200 group text-left relative border ${
                  isActive 
                    ? item.activeBg + ' font-extrabold' 
                    : 'text-slate-400 border-transparent hover:bg-slate-800/50 hover:text-slate-200 hover:border-slate-800/60 font-semibold'
                }`}
              >
                <div className={`p-1.5 rounded-xl mr-2.5 transition-all duration-200 group-hover:scale-105 ${
                  isActive 
                    ? item.activeIconBg 
                    : 'bg-slate-800/60 group-hover:bg-slate-800 border border-slate-700/40'
                }`}>
                  <IconComponent 
                    className={`w-4 h-4 ${isActive ? item.iconColor : 'text-slate-400 group-hover:' + item.iconColor}`} 
                  />
                </div>
                <span className={`text-xs tracking-tight flex-1 ${isActive ? 'text-white font-bold drop-shadow-[0_0_4px_rgba(255,255,255,0.4)]' : ''}`}>
                  {item.label}
                </span>

                {isActive && (
                  <motion.div
                    layoutId="activeIndicator"
                    className={`absolute right-3 w-2 h-2 rounded-full ${item.dotColor}`}
                    transition={{ type: 'spring', stiffness: 350, damping: 30 }}
                  />
                )}
              </Link>
            );
          })}

          {/* Grouped "Nút Tùy chọn & Mở rộng" */}
          <div className="pt-2 border-t border-slate-800/60 mt-2">
            <button
              id="sidebar-toggle-more-options"
              type="button"
              onClick={() => setShowMoreOptions(!showMoreOptions)}
              className="w-full flex items-center justify-between px-3 py-1.5 rounded-xl text-slate-400 hover:text-slate-200 hover:bg-slate-800/40 text-xs font-bold transition-all"
            >
              <span className="flex items-center gap-1.5">
                <Sliders className="w-3.5 h-3.5 text-slate-400" />
                <span>Tùy chọn & Mở rộng</span>
              </span>
              {showMoreOptions ? (
                <ChevronUp className="w-3.5 h-3.5 text-slate-500" />
              ) : (
                <ChevronDown className="w-3.5 h-3.5 text-slate-500" />
              )}
            </button>

            {/* Collapsed Secondary Options List */}
            <AnimatePresence>
              {showMoreOptions && (
                <motion.div
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: 'auto' }}
                  exit={{ opacity: 0, height: 0 }}
                  className="space-y-1 pt-1 overflow-hidden"
                >
                  {secondaryMenuItems.map((item) => {
                    const IconComponent = item.icon;
                    const isActive = currentTab === item.id || (item.path === '/' ? location.pathname === '/' : location.pathname.startsWith(item.path));
                    return (
                      <Link
                        key={item.id}
                        id={`sidebar-subtab-${item.id}`}
                        to={item.path}
                        onClick={() => {
                          setCurrentTab(item.id);
                          onClose();
                        }}
                        className={`w-full flex items-center px-3 py-1.5 rounded-xl transition-all text-left text-xs ${
                          isActive
                            ? 'bg-slate-800 text-white font-bold border border-slate-700'
                            : 'text-slate-400 hover:text-slate-300 hover:bg-slate-800/30'
                        }`}
                      >
                        <IconComponent className={`w-3.5 h-3.5 mr-2 ${item.iconColor}`} />
                        <span className="truncate">{item.label}</span>
                      </Link>
                    );
                  })}
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </nav>

        {/* Mascot Nihon Shiba Companion Card */}
        <div className="px-3 pb-2">
          <Link 
            to="/chat-ai"
            onClick={() => {
              setCurrentTab('japanese-chat');
              onClose();
            }}
            className="block group relative p-3 rounded-2xl bg-gradient-to-br from-[#1b223c] via-[#14192b] to-[#0f1424] border border-amber-500/30 hover:border-amber-500/70 transition-all cursor-pointer shadow-lg active:scale-[0.98]"
            title="Nhấn để trò chuyện cùng Nihon Shiba!"
          >
            <div className="flex items-center gap-2.5">
              <div className="w-11 h-11 rounded-xl bg-amber-500/10 border border-amber-500/40 flex items-center justify-center shrink-0 overflow-hidden group-hover:scale-105 transition-transform">
                <ShibaMascot pose="waving" size={38} animated={false} />
              </div>
              <div className="min-w-0 flex-1">
                <div className="flex items-center gap-1">
                  <span className="text-xs font-black text-white group-hover:text-amber-300 transition-colors">
                    Nihon Shiba
                  </span>
                  <span className="text-[9px] font-bold text-amber-400 bg-amber-500/15 border border-amber-500/30 px-1 py-0.2 rounded-full">
                    AI
                  </span>
                </div>
                <p className="text-[10px] text-slate-300 truncate mt-0.5">
                  "Hôm nay cùng học tiếng Nhật nhé! 🌸"
                </p>
              </div>
            </div>
          </Link>
        </div>

        {/* Windows App Install card */}
        <SidebarWindowsInstallCard />

        {/* Sidebar Footer with coin and level progress */}
        <div id="sidebar-footer" className="p-3 bg-[#13172E]/90 backdrop-blur-md border-t border-rose-500/20">
          <div className="flex items-center justify-between text-xs bg-[#0F172A] border border-amber-500/30 p-2 rounded-2xl">
            <div className="flex items-center gap-1.5">
              <Coins className="w-4 h-4 text-amber-400" />
              <span className="font-mono font-black text-amber-300">{userCoins.toLocaleString()}</span>
              <span className="text-slate-400 font-bold text-[11px]">Yên</span>
            </div>
            <div className="text-[10px] text-rose-300 bg-rose-500/20 px-2 py-0.5 rounded-xl border border-rose-400/40 font-mono font-black">
              JLPT {userProfile?.targetLevel || 'N4'}
            </div>
          </div>
        </div>
      </aside>
    </>
  );
}
