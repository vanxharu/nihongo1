/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';
import { useDialogFocus } from '../hooks/useDialogFocus';
import { Link, useLocation } from 'react-router-dom';
import {
  BarChart3,
  MessagesSquare,
  BookOpen,
  ShieldCheck,
  X,
  Coins,
  Bookmark,
  Award,
  Route,
  Trophy,
  GraduationCap,
  Headphones,
  Flame,
} from 'lucide-react';
import JpStudyLogo from './JpStudyLogo';
import ThemeToggle from './ThemeToggle';
import ShibaMascot from './mascot/ShibaMascot';
import { motion } from 'motion/react';
import { UserProfile } from '../types';
import { SidebarWindowsInstallCard } from './PwaInstallPrompt';
import { calculateUnlockedAchievements, TOTAL_ACHIEVEMENTS_COUNT } from '../data/achievementsData';
import { readGuestRoadmap } from '../data/jlptRoadmap';

interface SidebarProps {
  currentTab: string;
  setCurrentTab: (tab: string) => void;
  userCoins: number;
  isOpen: boolean;
  onClose: () => void;
  userProfile?: UserProfile;
}

// ── Nav item definition ──────────────────────────────────────────────────────
interface NavItem {
  id: string;
  path: string;
  label: string;
  icon: React.ElementType;
  color: string;        // tailwind text color class
  dot: string;          // active dot hex
}

const PRIMARY_NAV: NavItem[] = [
  { id: 'shadowing',     path: '/shadowing',  label: 'Shadowing',          icon: Headphones,    color: 'text-amber-400',  dot: '#FBBF24' },
  { id: 'practice',      path: '/',           label: 'Luyện tập',          icon: GraduationCap, color: 'text-sky-400',    dot: '#38BDF8' },
  { id: 'exam',          path: '/jlpt',       label: 'Luyện thi JLPT',     icon: Award,         color: 'text-rose-400',   dot: '#FB7185' },
  { id: 'roadmap',       path: '/lo-trinh',   label: 'Lộ trình',           icon: Route,         color: 'text-violet-400', dot: '#A78BFA' },
  { id: 'grammar',       path: '/bunpo',      label: 'Lý thuyết',          icon: BookOpen,      color: 'text-teal-400',   dot: '#2DD4BF' },
  { id: 'reading',       path: '/doc-hieu',   label: 'Đọc hiểu & Tin tức', icon: BookOpen,      color: 'text-indigo-400', dot: '#818CF8' },
  { id: 'japanese-chat', path: '/chat-ai',    label: 'Kaiwa · Hội thoại',  icon: MessagesSquare,color: 'text-orange-400', dot: '#FB923C' },
];

const SECONDARY_NAV = (unlockedCount: number, isAdmin: boolean): NavItem[] => [
  { id: 'notebook',     path: '/so-tay',     label: 'Sổ tay từ vựng',                             icon: Bookmark,   color: 'text-amber-400',  dot: '#FBBF24' },
  { id: 'achievements', path: '/thanh-tich', label: `Thành tựu · ${unlockedCount}/${TOTAL_ACHIEVEMENTS_COUNT}`, icon: Trophy,     color: 'text-amber-400',  dot: '#FBBF24' },
  { id: 'progress',     path: '/xep-hang',   label: 'Tiến độ & Thống kê',                         icon: BarChart3,  color: 'text-teal-400',   dot: '#2DD4BF' },
  ...(isAdmin ? [{ id: 'admin', path: '/admin', label: 'Quản trị', icon: ShieldCheck, color: 'text-orange-400', dot: '#FB923C' }] : []),
];

// ── Single nav link ──────────────────────────────────────────────────────────
function NavLink({ item, isActive, onClick }: { item: NavItem; isActive: boolean; onClick: () => void }) {
  const Icon = item.icon;
  return (
    <Link
      to={item.path}
      onClick={onClick}
      className={`relative flex items-center gap-3 px-3 py-2.5 rounded-xl transition-all duration-150 group ${
        isActive
          ? 'bg-white/[0.07] text-white'
          : 'text-slate-500 hover:text-slate-200 hover:bg-white/[0.04]'
      }`}
    >
      {/* coloured dot indicator on active */}
      {isActive && (
        <motion.span
          layoutId="sidebar-dot"
          className="absolute left-0 top-1/2 -translate-y-1/2 w-[3px] h-5 rounded-r-full"
          style={{ background: item.dot }}
          transition={{ type: 'spring', stiffness: 400, damping: 35 }}
        />
      )}

      <Icon
        size={17}
        className={`shrink-0 transition-colors ${isActive ? item.color : 'text-slate-600 group-hover:text-slate-400'}`}
      />
      <span className={`text-[13px] leading-none font-semibold truncate flex-1 ${isActive ? 'text-white' : ''}`}>
        {item.label}
      </span>
    </Link>
  );
}

// ── Sidebar ──────────────────────────────────────────────────────────────────
export default function Sidebar({ currentTab, setCurrentTab, userCoins, isOpen, onClose, userProfile }: SidebarProps) {
  const location = useLocation();
  const drawerRef = useDialogFocus<HTMLElement>(isOpen, onClose);

  const unlockedCount = calculateUnlockedAchievements(
    userProfile?.uid ? userProfile : { ...userProfile, studyRoadmap: readGuestRoadmap() || undefined }
  ).size;

  const secondaryNav = SECONDARY_NAV(unlockedCount, userProfile?.role === 'admin');

  const isItemActive = (item: NavItem) =>
    currentTab === item.id ||
    (item.path === '/' ? location.pathname === '/' : location.pathname.startsWith(item.path));

  const streak = userProfile?.streak || 0;

  return (
    <>
      {/* Backdrop */}
      {isOpen && (
        <div
          className="fixed inset-0 bg-black/60 backdrop-blur-[2px] z-50 xl:hidden"
          onClick={onClose}
        />
      )}

      <aside
        ref={drawerRef}
        role={isOpen ? 'dialog' : 'complementary'}
        aria-modal={isOpen || undefined}
        aria-label="Menu điều hướng"
        id="app-sidebar"
        className={`fixed inset-y-0 left-0 z-50 xl:static xl:flex flex-col w-64 max-w-[85vw] h-screen shrink-0 select-none transition-transform duration-300 ${
          isOpen ? 'translate-x-0' : '-translate-x-full xl:translate-x-0'
        }`}
        style={{ background: '#0C0E14', borderRight: '1px solid rgba(255,255,255,0.06)' }}
      >

        {/* ── Brand header ── */}
        <div className="flex items-center justify-between px-4 h-14 shrink-0"
          style={{ borderBottom: '1px solid rgba(255,255,255,0.06)' }}>
          <Link to="/" onClick={onClose} className="outline-none">
            <JpStudyLogo size="md" dark={true} showSubtitle={true} />
          </Link>
          <span className="xl:hidden ml-auto mr-2"><ThemeToggle /></span>
          <button
            onClick={onClose}
            aria-label="Đóng menu"
            className="xl:hidden p-1.5 rounded-lg text-slate-500 hover:text-white hover:bg-white/08 transition-colors cursor-pointer"
          >
            <X size={16} />
          </button>
        </div>

        {/* ── Nav ── */}
        <nav className="flex-1 overflow-y-auto px-2.5 py-3 space-y-0.5">

          {PRIMARY_NAV.map(item => (
            <NavLink
              key={item.id}
              item={item}
              isActive={isItemActive(item)}
              onClick={() => { setCurrentTab(item.id); onClose(); }}
            />
          ))}

          {/* Divider */}
          <div className="my-2 mx-1" style={{ height: 1, background: 'rgba(255,255,255,0.06)' }} />

          {secondaryNav.map(item => (
            <NavLink
              key={item.id}
              item={item}
              isActive={isItemActive(item)}
              onClick={() => { setCurrentTab(item.id); onClose(); }}
            />
          ))}
        </nav>

        {/* ── Shiba chat card ── */}
        <div className="px-2.5 pb-2">
          <Link
            to="/chat-ai"
            onClick={() => { setCurrentTab('japanese-chat'); onClose(); }}
            className="flex items-center gap-3 p-3 rounded-xl transition-all cursor-pointer group"
            style={{ background: 'rgba(251,191,36,0.07)', border: '1px solid rgba(251,191,36,0.15)' }}
          >
            <div className="w-9 h-9 rounded-lg overflow-hidden shrink-0 flex items-center justify-center"
              style={{ background: 'rgba(251,191,36,0.12)' }}>
              <ShibaMascot pose="waving" size={32} animated={false} />
            </div>
            <div className="min-w-0 flex-1">
              <div className="flex items-center gap-1.5">
                <span className="text-[12px] font-bold text-white">Nihon Shiba</span>
                <span className="text-[9px] font-bold text-amber-400 px-1 py-px rounded"
                  style={{ background: 'rgba(251,191,36,0.15)' }}>AI</span>
              </div>
              <p className="text-[11px] text-slate-400 truncate mt-px group-hover:text-slate-300">
                Hôm nay cùng học tiếng Nhật nhé!
              </p>
            </div>
          </Link>
        </div>

        {/* Windows install card */}
        <SidebarWindowsInstallCard />

        {/* ── Footer ── */}
        <div className="px-2.5 pb-3 pt-2 shrink-0"
          style={{ borderTop: '1px solid rgba(255,255,255,0.06)' }}>
          <div className="flex items-center justify-between px-3 py-2 rounded-xl"
            style={{ background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.07)' }}>

            {/* Coin */}
            <div className="flex items-center gap-1.5">
              <Coins size={14} className="text-amber-400" />
              <span className="text-[13px] font-bold text-amber-300">{userCoins.toLocaleString()}</span>
              <span className="text-[11px] text-slate-500">Yên</span>
            </div>

            <div className="flex items-center gap-2">
              {/* Streak */}
              {streak > 0 && (
                <div className="flex items-center gap-1 px-2 py-0.5 rounded-full text-[11px] font-bold text-amber-300"
                  style={{ background: 'rgba(251,191,36,0.12)' }}>
                  <Flame size={11} className="text-amber-400" />
                  {streak}
                </div>
              )}

              {/* Level */}
              <div className="px-2 py-0.5 rounded-full text-[11px] font-bold text-violet-300"
                style={{ background: 'rgba(139,92,246,0.15)', border: '1px solid rgba(139,92,246,0.25)' }}>
                {userProfile?.targetLevel || 'N4'}
              </div>
            </div>
          </div>
        </div>

      </aside>
    </>
  );
}
