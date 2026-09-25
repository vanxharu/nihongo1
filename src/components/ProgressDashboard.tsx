/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect, useMemo } from 'react';
import { 
  TrendingUp, 
  Calendar, 
  CheckCircle, 
  Layers, 
  BookOpen, 
  Award, 
  Flame, 
  Info,
  ChevronRight,
  Shield,
  Star,
  Activity,
  BarChart3,
  FileText,
  Clock,
  Target,
  Trophy
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { UserProfile, JLPTLevel, VocabularyItem, GrammarItem } from '../types';
import { KANJI_DATA, VOCABULARY_DATA, GRAMMAR_DATA } from '../data';
import { safeFetchJson } from '../utils/safeApi';
import { getPlayerLevelInfo } from '../utils/xpSystem';
import { calculateUnlockedAchievements, TOTAL_ACHIEVEMENTS_COUNT } from '../data/achievementsData';

interface ProgressDashboardProps {
  userProfile: UserProfile;
  todayXp: number;
  updateProfile?: (updated: Partial<UserProfile>) => void;
  onTriggerCelebration?: () => void;
  onNavigateTab?: (tab: string) => void;
}

export default function ProgressDashboard({ 
  userProfile, 
  todayXp, 
  updateProfile, 
  onTriggerCelebration,
  onNavigateTab
}: ProgressDashboardProps) {
  const [vocabData, setVocabData] = useState<VocabularyItem[]>([]);
  const [grammarData, setGrammarData] = useState<GrammarItem[]>([]);
  const [kanjiData, setKanjiData] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [showDetailedStats, setShowDetailedStats] = useState(false);

  const targetLevel = userProfile.targetLevel || 'N4';
  const levelDigit = targetLevel.replace('N', '');

  // Official JLPT baseline quantities per level for accurate percentages
  const JLPT_BENCHMARKS: Record<string, { kanji: number; vocab: number; grammar: number }> = {
    N5: { kanji: 103, vocab: 800, grammar: 40 },
    N4: { kanji: 181, vocab: 1500, grammar: 80 },
    N3: { kanji: 367, vocab: 3750, grammar: 140 },
    N2: { kanji: 367, vocab: 6000, grammar: 150 },
    N1: { kanji: 1130, vocab: 10000, grammar: 180 }
  };

  useEffect(() => {
    let isMounted = true;
    Promise.all([
      safeFetchJson<VocabularyItem[]>('/api/vocabularies'),
      safeFetchJson<GrammarItem[]>('/api/grammars'),
      safeFetchJson<any[]>('/api/kanjis')
    ]).then(([vRes, gRes, kRes]) => {
      if (!isMounted) return;
      const v = (vRes.ok && Array.isArray(vRes.data) && vRes.data.length > 0) ? vRes.data : VOCABULARY_DATA;
      const g = (gRes.ok && Array.isArray(gRes.data) && gRes.data.length > 0) ? gRes.data : GRAMMAR_DATA;
      const k = (kRes.ok && Array.isArray(kRes.data) && kRes.data.length > 0) ? kRes.data : KANJI_DATA;
      setVocabData(v);
      setGrammarData(g);
      setKanjiData(k);
      setLoading(false);
    }).catch(() => {
      if (isMounted) {
        setVocabData(VOCABULARY_DATA);
        setGrammarData(GRAMMAR_DATA);
        setKanjiData(KANJI_DATA);
        setLoading(false);
      }
    });

    return () => {
      isMounted = false;
    };
  }, []);

  // Stats for target level - Vocabulary
  const totalVocabForLevel = useMemo(() => {
    const fromApi = vocabData.filter(v => v.level === targetLevel).length;
    return Math.max(fromApi, JLPT_BENCHMARKS[targetLevel]?.vocab || 300);
  }, [vocabData, targetLevel]);

  const masteredVocabCount = useMemo(() => {
    const levelVocabIds = new Set(vocabData.filter(v => v.level === targetLevel).map(v => v.id));
    return Object.entries(userProfile.vocabStatus || {}).filter(([id, st]) => {
      if (levelVocabIds.size > 0 && !levelVocabIds.has(id)) return false;
      if (st === 'mastered') return true;
      if (typeof st === 'object' && st && ((st as any).repetitions >= 2 || (st as any).state === 'mastered')) return true;
      return Boolean(st);
    }).length;
  }, [vocabData, targetLevel, userProfile.vocabStatus]);

  // Stats for target level - Grammar
  const totalGrammarForLevel = useMemo(() => {
    const fromApi = grammarData.filter(g => g.level === targetLevel).length;
    return Math.max(fromApi, JLPT_BENCHMARKS[targetLevel]?.grammar || 50);
  }, [grammarData, targetLevel]);

  const completedGrammarCount = useMemo(() => {
    const levelGrammars = grammarData.filter(g => g.level === targetLevel);
    const levelGrammarIds = new Set(levelGrammars.map(g => g.id));
    return Object.entries(userProfile.grammarStatus || {}).filter(([id, st]) => {
      if (levelGrammarIds.size > 0 && !levelGrammarIds.has(id)) return false;
      if (!st) return false;
      if (typeof st === 'object' && st !== null) {
        return Boolean((st as any).repetitions >= 1 || (st as any).passed || (st as any).mastered || (st as any).srsStage >= 1);
      }
      return Boolean(st);
    }).length;
  }, [grammarData, targetLevel, userProfile.grammarStatus]);

  // Stats for target level - Kanji (Fix 100% calculation bug)
  const totalKanjiForLevel = useMemo(() => {
    const fromApi = kanjiData.filter(k => k.level === targetLevel).length;
    const benchmark = JLPT_BENCHMARKS[targetLevel]?.kanji || 181;
    return Math.max(fromApi, benchmark);
  }, [kanjiData, targetLevel]);

  const completedKanjiCount = useMemo(() => {
    const levelKanjis = kanjiData.filter(k => k.level === targetLevel);
    if (levelKanjis.length === 0) {
      // Fallback if data not yet loaded: only count keys explicitly matching target level
      return Object.entries(userProfile.kanjiStatus || {}).filter(([id, st]) => {
        const isTarget = id.toLowerCase().includes(targetLevel.toLowerCase());
        if (!isTarget) return false;
        if (typeof st === 'object' && st !== null) {
          return Boolean((st as any).repetitions >= 1 || (st as any).passed || (st as any).state === 'mastered');
        }
        return Boolean(st);
      }).length;
    }

    // Match against actual kanjis of target level
    return levelKanjis.filter(k => {
      const char = k.character || k.kanji;
      const rawId = k.id ? String(k.id) : '';
      const prefixedId = rawId.startsWith('k_') ? rawId : `k_${rawId}`;
      const unPrefixedId = rawId.replace(/^k_/, '');

      const st = 
        userProfile.kanjiStatus?.[prefixedId] ??
        userProfile.kanjiStatus?.[unPrefixedId] ??
        (char ? userProfile.kanjiStatus?.[char] : undefined);

      if (!st) return false;
      if (typeof st === 'object' && st !== null) {
        return Boolean((st as any).repetitions >= 1 || (st as any).passed || (st as any).state === 'mastered');
      }
      return Boolean(st);
    }).length;
  }, [kanjiData, targetLevel, userProfile.kanjiStatus]);

  // Reading & Listening progress based on actual user activity
  const completedReadingCount = useMemo(() => {
    return (userProfile.completedLessons || []).filter(id => 
      String(id).includes('read') || String(id).includes('reading') || String(id).includes('doc')
    ).length;
  }, [userProfile.completedLessons]);

  const completedListeningCount = useMemo(() => {
    const fromShadowing = userProfile.shadowingStats?.completedLines || 0;
    const fromLessons = (userProfile.completedLessons || []).filter(id => 
      String(id).includes('listen') || String(id).includes('nghe') || String(id).includes('choukai')
    ).length;
    return fromShadowing + fromLessons;
  }, [userProfile.shadowingStats, userProfile.completedLessons]);

  const readingPercent = Math.min(100, Math.round((completedReadingCount / 20) * 100));
  const listeningPercent = Math.min(100, Math.round((completedListeningCount / 20) * 100));

  // Percentage calculations
  const vocabPercent = Math.min(100, Math.round((masteredVocabCount / Math.max(1, totalVocabForLevel)) * 100));
  const grammarPercent = Math.min(100, Math.round((completedGrammarCount / Math.max(1, totalGrammarForLevel)) * 100));
  const kanjiPercent = Math.min(100, Math.round((completedKanjiCount / Math.max(1, totalKanjiForLevel)) * 100));

  // JLPT Score Prediction (Out of 180) - Truly based on accumulated knowledge and test results
  // JLPT N4 structure: 
  // - Language Knowledge (Vocab/Kanji/Grammar): ~60-70 points
  // - Reading Comprehension: ~50-60 points
  // - Listening Comprehension: 60 points
  const predictedScore = useMemo(() => {
    const vocabScore = (vocabPercent / 100) * 35;
    const kanjiScore = (kanjiPercent / 100) * 25;
    const grammarScore = (grammarPercent / 100) * 35;
    const readingScore = (readingPercent / 100) * 35;
    const listeningScore = (listeningPercent / 100) * 50;

    // Check recent test performance if available
    const testResults = userProfile.dailyTestResults || [];
    let testBonus = 0;
    if (testResults.length > 0) {
      const avgTestAccuracy = testResults.reduce((acc, t) => acc + (t.score / Math.max(1, t.total)), 0) / testResults.length;
      testBonus = Math.round(avgTestAccuracy * 20);
    }

    const calculated = Math.round(vocabScore + kanjiScore + grammarScore + readingScore + listeningScore + testBonus);
    return Math.max(0, Math.min(180, calculated));
  }, [vocabPercent, kanjiPercent, grammarPercent, readingPercent, listeningPercent, userProfile.dailyTestResults]);

  // Player military / RPG rank title (as seen in Screenshot: "JLPT N4 · Hạ sĩ")
  const playerRankTitle = useMemo(() => {
    const safeXp = userProfile.xp || 0;
    if (safeXp < 50) return 'Hạ sĩ';
    if (safeXp < 150) return 'Trung sĩ';
    if (safeXp < 300) return 'Thượng sĩ';
    if (safeXp < 600) return 'Chuẩn úy';
    if (safeXp < 1000) return 'Thiếu úy';
    if (safeXp < 1800) return 'Trung úy';
    if (safeXp < 3000) return 'Đại úy';
    return 'Thiếu tá';
  }, [userProfile.xp]);

  // Overall readiness
  const testReadinessPercent = Math.min(100, Math.round((vocabPercent * 0.35 + grammarPercent * 0.35 + kanjiPercent * 0.3)));

  // Total completed lessons
  const totalCompletedLessons = (userProfile.completedLessons || []).length;

  // Calendar for current month (September 2026 as in Screenshot_20260914_130423.png)
  const currentMonthDate = new Date();
  const currentMonthName = currentMonthDate.toLocaleDateString('en-US', { month: 'long', year: 'numeric' });
  const currentDayOfMonth = currentMonthDate.getDate(); // e.g. 14

  // Level completeness counts (N5: 47, N4: 80, N3: 169, N2: 147, N1: 202)
  const levelProgressList = [
    {
      level: 'N5',
      title: 'Người mới bắt đầu',
      totalLessons: 47,
      completed: (userProfile.completedLessons || []).filter(id => String(id).includes('n5') || String(id).includes('1_')).length,
      badgeColor: 'bg-sky-500/20 text-sky-300 border-sky-500/40',
      barColor: 'bg-sky-400'
    },
    {
      level: 'N4',
      title: 'Sơ cấp',
      totalLessons: 80,
      completed: (userProfile.completedLessons || []).filter(id => String(id).includes('n4') || String(id).includes('2_')).length,
      badgeColor: 'bg-purple-500/20 text-purple-300 border-purple-500/40',
      barColor: 'bg-purple-500'
    },
    {
      level: 'N3',
      title: 'Trung cấp',
      totalLessons: 169,
      completed: (userProfile.completedLessons || []).filter(id => String(id).includes('n3')).length,
      badgeColor: 'bg-amber-500/20 text-amber-300 border-amber-500/40',
      barColor: 'bg-amber-400'
    },
    {
      level: 'N2',
      title: 'Trung cao cấp',
      totalLessons: 147,
      completed: (userProfile.completedLessons || []).filter(id => String(id).includes('n2')).length,
      badgeColor: 'bg-orange-500/20 text-orange-300 border-orange-500/40',
      barColor: 'bg-orange-400'
    },
    {
      level: 'N1',
      title: 'Cao cấp',
      totalLessons: 202,
      completed: (userProfile.completedLessons || []).filter(id => String(id).includes('n1')).length,
      badgeColor: 'bg-rose-500/20 text-rose-300 border-rose-500/40',
      barColor: 'bg-rose-400'
    }
  ];

  const unlockedAchievementsCount = useMemo(() => {
    return calculateUnlockedAchievements(userProfile).size;
  }, [userProfile]);

  return (
    <div className="flex-1 w-full min-h-screen bg-[#0A0F1D] text-slate-100 flex flex-col items-center pb-24 select-none">
      {/* Max-width container matching mobile & desktop view */}
      <div className="w-full max-w-md flex flex-col flex-1 px-4 space-y-4 pt-3">
        {/* Header (Screenshot_20260914_130428.png) */}
        <div className="flex items-center justify-between pb-1">
          <h1 className="text-2xl font-black text-white tracking-tight">Tiến độ</h1>
          <div className="flex items-center gap-2">
            <button
              type="button"
              id="progress-open-achievements-header-btn"
              onClick={() => onNavigateTab?.('achievements')}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-amber-500/15 hover:bg-amber-500/25 border border-amber-500/30 text-amber-300 hover:text-amber-200 transition-colors cursor-pointer text-xs font-bold"
              title="Danh hiệu & Thành tựu"
            >
              <Trophy className="w-4 h-4 text-amber-400" />
              <span>Thành tựu</span>
            </button>
            <button
              type="button"
              onClick={() => setShowDetailedStats(prev => !prev)}
              className="p-2 rounded-xl bg-slate-800/80 hover:bg-slate-700 text-slate-300 hover:text-white transition-colors cursor-pointer"
              title="Thống kê mở rộng"
            >
              <BarChart3 className="w-5 h-5 text-sky-400" />
            </button>
          </div>
        </div>

        {/* Purple Rank / Level Card (Top banner in Screenshot_20260914_130428.png) */}
        <div className="rounded-3xl p-4 sm:p-5 bg-gradient-to-r from-[#7B5CF8] via-[#6E44E8] to-[#5B2BD4] text-white shadow-xl shadow-purple-950/40 space-y-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              {/* Level circle badge (e.g. 4 for N4) */}
              <div className="w-9 h-9 rounded-full bg-white/20 backdrop-blur-md flex items-center justify-center font-black text-base text-white border border-white/30">
                {levelDigit}
              </div>
              <span className="text-base font-black tracking-tight">
                JLPT {targetLevel} · {playerRankTitle}
              </span>
            </div>
            <span className="text-sm font-black text-white/90">
              {userProfile.xp || 0} XP
            </span>
          </div>

          {/* Smooth bottom progress bar */}
          <div className="w-full h-2 bg-black/20 rounded-full overflow-hidden p-0.5">
            <div 
              className="h-full bg-white rounded-full transition-all duration-500"
              style={{ width: `${Math.max(8, testReadinessPercent)}%` }}
            />
          </div>
        </div>

        {/* Card: Dự đoán điểm · N4 (Screenshot_20260914_130428.png) */}
        <div className="bg-[#121927] border border-slate-800 rounded-3xl p-5 space-y-4 shadow-md">
          {/* Title */}
          <div className="flex items-center gap-2 text-slate-300">
            <TrendingUp className="w-4 h-4 text-sky-400" />
            <h3 className="text-sm font-black text-slate-200">
              Dự đoán điểm · {targetLevel}
            </h3>
          </div>

          {/* Big Score: 60 / 180 */}
          <div className="flex items-baseline gap-1.5">
            <span className="text-4xl sm:text-5xl font-black text-[#38BDF8] tracking-tight">
              {predictedScore}
            </span>
            <span className="text-lg font-bold text-slate-500">
              / 180
            </span>
          </div>

          {/* 4 Skill bars */}
          <div className="space-y-2.5 pt-1">
            {/* Chữ - Từ vựng */}
            <div className="space-y-1">
              <div className="flex justify-between text-xs font-semibold">
                <span className="text-slate-300">Chữ – Từ vựng</span>
                <span className="text-slate-400">{vocabPercent > 0 ? `${vocabPercent}%` : '–'}</span>
              </div>
              <div className="w-full h-2 bg-slate-800 rounded-full overflow-hidden">
                <div 
                  className="h-full bg-sky-400 rounded-full transition-all duration-500"
                  style={{ width: `${vocabPercent}%` }}
                />
              </div>
            </div>

            {/* Ngữ pháp */}
            <div className="space-y-1">
              <div className="flex justify-between text-xs font-semibold">
                <span className="text-slate-300">Ngữ pháp</span>
                <span className="text-purple-300 font-bold">{grammarPercent > 0 ? `${grammarPercent}%` : '–'}</span>
              </div>
              <div className="w-full h-2 bg-slate-800 rounded-full overflow-hidden">
                <div 
                  className="h-full bg-[#8B5CF6] rounded-full transition-all duration-500"
                  style={{ width: `${grammarPercent}%` }}
                />
              </div>
            </div>

            {/* Đọc hiểu */}
            <div className="space-y-1">
              <div className="flex justify-between text-xs font-semibold">
                <span className="text-slate-300">Đọc hiểu</span>
                <span className="text-slate-400">{readingPercent > 0 ? `${readingPercent}%` : '–'}</span>
              </div>
              <div className="w-full h-2 bg-slate-800 rounded-full overflow-hidden">
                <div 
                  className="h-full bg-indigo-400 rounded-full transition-all duration-500"
                  style={{ width: `${readingPercent}%` }}
                />
              </div>
            </div>

            {/* Nghe hiểu */}
            <div className="space-y-1">
              <div className="flex justify-between text-xs font-semibold">
                <span className="text-slate-300">Nghe hiểu</span>
                <span className="text-slate-400">{listeningPercent > 0 ? `${listeningPercent}%` : '–'}</span>
              </div>
              <div className="w-full h-2 bg-slate-800 rounded-full overflow-hidden">
                <div 
                  className="h-full bg-emerald-400 rounded-full transition-all duration-500"
                  style={{ width: `${listeningPercent}%` }}
                />
              </div>
            </div>
          </div>
        </div>

        {/* 3 Summary Stats (Screenshot_20260914_130428.png) */}
        <div className="grid grid-cols-3 gap-2.5">
          {/* Card 1: Bài học */}
          <div className="bg-[#121927] border border-slate-800 rounded-2xl p-3 flex flex-col items-center justify-center text-center space-y-0.5">
            <BookOpen className="w-4 h-4 text-sky-400 mb-0.5" />
            <span className="text-lg font-black text-white">{totalCompletedLessons}</span>
            <span className="text-[11px] font-bold text-slate-400">Bài học</span>
          </div>

          {/* Card 2: Tuần này */}
          <div className="bg-[#121927] border border-slate-800 rounded-2xl p-3 flex flex-col items-center justify-center text-center space-y-0.5">
            <Calendar className="w-4 h-4 text-amber-400 mb-0.5" />
            <span className="text-lg font-black text-white">{userProfile.streak || 0}</span>
            <span className="text-[11px] font-bold text-slate-400">Tuần này</span>
          </div>

          {/* Card 3: Tổng tiến độ */}
          <div className="bg-[#121927] border border-slate-800 rounded-2xl p-3 flex flex-col items-center justify-center text-center space-y-0.5">
            <Activity className="w-4 h-4 text-emerald-400 mb-0.5" />
            <span className="text-lg font-black text-white">{testReadinessPercent}%</span>
            <span className="text-[11px] font-bold text-slate-400">Tổng tiến độ</span>
          </div>
        </div>

        {/* Card: Lịch học (Screenshot_20260914_130423.png) */}
        <div className="bg-[#121927] border border-slate-800 rounded-3xl p-5 space-y-4 shadow-md">
          {/* Header */}
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Calendar className="w-4 h-4 text-sky-400" />
              <h3 className="text-sm font-black text-slate-200">Lịch học</h3>
            </div>
            <span className="text-xs font-bold text-slate-400">
              {currentMonthName}
            </span>
          </div>

          {/* Weekday labels T2, T3, T4, T5, T6, T7, CN */}
          <div className="grid grid-cols-7 gap-1 text-center text-[11px] font-bold text-slate-500 pb-1">
            <span>T2</span>
            <span>T3</span>
            <span>T4</span>
            <span>T5</span>
            <span>T6</span>
            <span>T7</span>
            <span>CN</span>
          </div>

          {/* Day Grid 1..30 */}
          <div className="grid grid-cols-7 gap-1 text-center text-xs">
            {Array.from({ length: 30 }, (_, i) => {
              const day = i + 1;
              const isToday = day === currentDayOfMonth;
              const isStudied = (userProfile.studyDays || []).some(d => d.endsWith(`-${String(day).padStart(2, '0')}`));

              let dayStyles = 'text-slate-400 hover:text-white hover:bg-slate-800/50';

              if (isToday) {
                dayStyles = 'border-2 border-sky-400 bg-sky-500/20 text-sky-300 font-black rounded-xl shadow-[0_0_10px_rgba(56,189,248,0.3)]';
              } else if (isStudied) {
                dayStyles = 'bg-emerald-500/20 text-emerald-300 font-bold rounded-xl border border-emerald-500/40';
              }

              return (
                <div
                  key={day}
                  className={`h-9 flex items-center justify-center transition-all ${dayStyles}`}
                >
                  {day}
                </div>
              );
            })}
          </div>
        </div>

        {/* Card: Sẵn sàng thi · N4 (Screenshot_20260914_130423.png) */}
        <div className="bg-[#121927] border border-slate-800 rounded-3xl p-5 space-y-4 shadow-md">
          <div className="flex items-start justify-between gap-3">
            {/* Donut Circle 0% */}
            <div className="relative w-14 h-14 rounded-full border-4 border-slate-800 flex items-center justify-center shrink-0">
              <span className="text-sm font-black text-slate-300">
                {testReadinessPercent}%
              </span>
            </div>

            {/* Title & Desc */}
            <div className="flex-1">
              <h3 className="text-sm font-black text-slate-100">
                Sẵn sàng thi · {targetLevel}
              </h3>
              <p className="text-[11px] text-slate-400 leading-snug mt-0.5">
                Ước tính từ bài học, ôn tập và từ yếu của bạn
              </p>
            </div>

            {/* Cute Daruma Mascot (Screenshot_20260914_130423.png) */}
            <div className="text-3xl shrink-0 filter drop-shadow-md">
              🎎
            </div>
          </div>

          {/* 3 Component progress bars */}
          <div className="space-y-2 pt-1">
            {/* Từ vựng */}
            <div className="space-y-1">
              <div className="flex justify-between text-xs font-semibold">
                <span className="text-slate-400">Từ vựng</span>
                <span className="text-slate-400">{vocabPercent}%</span>
              </div>
              <div className="w-full h-1.5 bg-slate-800 rounded-full overflow-hidden">
                <div 
                  className="h-full bg-sky-400 rounded-full transition-all duration-500"
                  style={{ width: `${vocabPercent}%` }}
                />
              </div>
            </div>

            {/* Ngữ pháp */}
            <div className="space-y-1">
              <div className="flex justify-between text-xs font-semibold">
                <span className="text-slate-400">Ngữ pháp</span>
                <span className="text-slate-400">{grammarPercent}%</span>
              </div>
              <div className="w-full h-1.5 bg-slate-800 rounded-full overflow-hidden">
                <div 
                  className="h-full bg-purple-500 rounded-full transition-all duration-500"
                  style={{ width: `${grammarPercent}%` }}
                />
              </div>
            </div>

            {/* Kanji */}
            <div className="space-y-1">
              <div className="flex justify-between text-xs font-semibold">
                <span className="text-slate-400">Kanji</span>
                <span className="text-slate-400">{kanjiPercent}%</span>
              </div>
              <div className="w-full h-1.5 bg-slate-800 rounded-full overflow-hidden">
                <div 
                  className="h-full bg-emerald-400 rounded-full transition-all duration-500"
                  style={{ width: `${kanjiPercent}%` }}
                />
              </div>
            </div>
          </div>
        </div>

        {/* Achievements Quick Banner */}
        <div 
          onClick={() => onNavigateTab?.('achievements')}
          className="bg-gradient-to-r from-amber-500/15 via-orange-500/10 to-transparent border border-amber-500/30 hover:border-amber-400/50 rounded-2xl p-3.5 flex items-center justify-between cursor-pointer transition-all hover:bg-amber-500/20"
        >
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-amber-500/20 flex items-center justify-center text-amber-400">
              <Trophy className="w-5 h-5" />
            </div>
            <div>
              <div className="text-sm font-black text-white flex items-center gap-1.5">
                <span>Huy hiệu & Thành tựu</span>
                <span className="px-1.5 py-0.5 rounded-md bg-amber-400 text-slate-950 text-[10px] font-black">
                  {unlockedAchievementsCount}/{TOTAL_ACHIEVEMENTS_COUNT}
                </span>
              </div>
              <div className="text-[11px] font-semibold text-slate-400">Khám phá bộ sưu tập mascot Shiba & Daruma</div>
            </div>
          </div>
          <ChevronRight className="w-5 h-5 text-amber-400" />
        </div>

        {/* Section: Hoàn thành theo cấp độ (Screenshot_20260914_130416.png) */}
        <div className="space-y-3 pt-2">
          <h3 className="text-base font-black text-white px-1">
            Hoàn thành theo cấp độ
          </h3>

          <div className="space-y-2.5">
            {levelProgressList.map(item => {
              const percent = Math.min(100, Math.round((item.completed / item.totalLessons) * 100));

              return (
                <div
                  key={item.level}
                  className="bg-[#121927] border border-slate-800 rounded-2xl p-3.5 space-y-2 transition-all hover:border-slate-700"
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2.5">
                      {/* Badge N5..N1 */}
                      <span className={`px-2.5 py-0.5 rounded-lg text-xs font-black border ${item.badgeColor}`}>
                        {item.level}
                      </span>
                      <span className="text-xs font-bold text-slate-300">
                        {item.title}
                      </span>
                    </div>

                    <span className="text-xs font-bold text-slate-400">
                      {item.completed} / {item.totalLessons}
                    </span>
                  </div>

                  {/* Progress bar */}
                  <div className="w-full h-1.5 bg-slate-800 rounded-full overflow-hidden">
                    <div
                      className={`h-full rounded-full transition-all duration-500 ${item.barColor}`}
                      style={{ width: `${Math.max(percent > 0 ? percent : 2, 2)}%` }}
                    />
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Extended Stats Toggle (Badges & Heatmap) */}
        {showDetailedStats && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            className="pt-4 space-y-4"
          >
            <div className="p-4 rounded-2xl bg-[#121927] border border-slate-800 text-xs space-y-2">
              <span className="font-bold text-sky-300 block">Thống kê chi tiết tài khoản:</span>
              <p className="text-slate-400">Chuỗi ngày học liên tục: <b className="text-amber-400">{userProfile.streak || 0} ngày 🔥</b></p>
              <p className="text-slate-400">Từ vựng đã lưu trong sổ tay: <b className="text-white">{(userProfile.savedVocab || []).length} từ</b></p>
              <p className="text-slate-400">Kỳ thi mục tiêu: <b className="text-purple-400">JLPT {targetLevel}</b></p>
            </div>
          </motion.div>
        )}
      </div>
    </div>
  );
}
