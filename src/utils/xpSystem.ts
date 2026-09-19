/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { UserProfile, JLPTLevel } from '../types';

export interface PlayerLevelInfo {
  level: number;
  title: string;
  badge: string;
  currentXp: number;
  levelStartXp: number;
  nextLevelXp: number;
  xpInLevel: number;
  xpRequiredInLevel: number;
  progressPercent: number;
}

export interface StreakBonusInfo {
  multiplier: number;
  bonusPercent: number;
  badge: string;
  label: string;
}

export interface JlptLevelMastery {
  level: JLPTLevel;
  overallPercent: number;
  vocabPercent: number;
  grammarPercent: number;
  kanjiPercent: number;
  examPercent: number;
  masteredVocabCount: number;
  totalVocabCount: number;
  completedGrammarCount: number;
  totalGrammarCount: number;
  completedKanjiCount: number;
  totalKanjiCount: number;
  examCount: number;
}

/**
 * Calculate required cumulative XP to reach a given level L.
 * L = 1 -> 0 XP
 * L = 2 -> 100 XP
 * L = 3 -> 250 XP
 * L = 4 -> 450 XP
 * L = 5 -> 700 XP
 */
export function getRequiredXpForLevel(level: number): number {
  if (level <= 1) return 0;
  const k = level - 1;
  return 50 * k * k + 50 * k;
}

/**
 * Calculate player level from cumulative total XP.
 */
export function getPlayerLevelInfo(totalXp: number): PlayerLevelInfo {
  const safeXp = Math.max(0, totalXp || 0);

  // Solve 50*k^2 + 50*k <= safeXp
  const k = Math.floor((Math.sqrt(1 + safeXp / 12.5) - 1) / 2);
  const level = Math.max(1, k + 1);

  const levelStartXp = getRequiredXpForLevel(level);
  const nextLevelXp = getRequiredXpForLevel(level + 1);

  const xpInLevel = safeXp - levelStartXp;
  const xpRequiredInLevel = Math.max(1, nextLevelXp - levelStartXp);
  const progressPercent = Math.min(100, Math.round((xpInLevel / xpRequiredInLevel) * 100));

  let title = '🌱 Tập Sự Tiếng Nhật';
  let badge = '🌱';

  if (level >= 36) {
    title = '🌌 Huyền Thoại JLPT';
    badge = '🌌';
  } else if (level >= 26) {
    title = '👑 Bậc Thầy N1';
    badge = '👑';
  } else if (level >= 19) {
    title = '⚡ Chinh Phục N2';
    badge = '⚡';
  } else if (level >= 13) {
    title = '🚀 Bứt Phá N3';
    badge = '🚀';
  } else if (level >= 8) {
    title = '🎯 Cao Thủ N5-N4';
    badge = '🎯';
  } else if (level >= 4) {
    title = '📘 Học Viên Chuyên Cần';
    badge = '📘';
  }

  return {
    level,
    title,
    badge,
    currentXp: safeXp,
    levelStartXp,
    nextLevelXp,
    xpInLevel,
    xpRequiredInLevel,
    progressPercent,
  };
}

/**
 * Calculate streak XP multiplier.
 */
export function getStreakBonusInfo(streakDays: number): StreakBonusInfo {
  const safeStreak = Math.max(0, streakDays || 0);

  if (safeStreak >= 30) {
    return {
      multiplier: 1.5,
      bonusPercent: 50,
      badge: '👑',
      label: 'Siêu Chuỗi 30+ Ngày (+50% XP)',
    };
  } else if (safeStreak >= 14) {
    return {
      multiplier: 1.4,
      bonusPercent: 40,
      badge: '⚡',
      label: 'Chuỗi Rực Rỡ 14+ Ngày (+40% XP)',
    };
  } else if (safeStreak >= 7) {
    return {
      multiplier: 1.25,
      bonusPercent: 25,
      badge: '🔥',
      label: 'Chuỗi Chuyên Cần 7+ Ngày (+25% XP)',
    };
  } else if (safeStreak >= 3) {
    return {
      multiplier: 1.1,
      bonusPercent: 10,
      badge: '✨',
      label: 'Chuỗi Khởi Động 3+ Ngày (+10% XP)',
    };
  }

  return {
    multiplier: 1.0,
    bonusPercent: 0,
    badge: '🌱',
    label: 'Duy trì chuỗi từ 3 ngày để nhận thưởng +10% XP',
  };
}

/**
 * Compute total earned XP considering streak multiplier.
 */
export function calculateEarnedXp(baseAmount: number, streakDays: number): {
  baseXp: number;
  bonusXp: number;
  totalXp: number;
  bonusInfo: StreakBonusInfo;
} {
  const safeBase = Math.max(1, Math.round(baseAmount));
  const bonusInfo = getStreakBonusInfo(streakDays);
  const totalXp = Math.round(safeBase * bonusInfo.multiplier);
  const bonusXp = totalXp - safeBase;

  return {
    baseXp: safeBase,
    bonusXp,
    totalXp,
    bonusInfo,
  };
}
