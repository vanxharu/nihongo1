import type { AchievementCharacter } from "../components/achievements/AchievementMascotIcon";
import type { UserProfile } from "../types";
export type AchievementCategory =
  | "onboarding"
  | "streak"
  | "vocab"
  | "kanji"
  | "grammar"
  | "practice"
  | "milestone";
export interface AchievementItem {
  id: string;
  number: number;
  title: string;
  description: string;
  character: AchievementCharacter;
  category: AchievementCategory;
  categoryName: string;
  unlockedByDefault?: boolean;
  rewardXp?: number;
  metric: string;
  threshold: number;
  poseIndex: number;
  tier: number;
}
const tracks: {
  metric: string;
  name: string;
  category: AchievementCategory;
  categoryName: string;
  thresholds: number[];
  unit: string;
}[] = [
  {
    metric: "days",
    name: "Dấu chân Shiba",
    category: "onboarding",
    categoryName: "Hành trình",
    thresholds: [0, 1, 2, 3, 5, 7, 14, 30, 60, 100],
    unit: "ngày học được ghi nhận",
  },
  {
    metric: "streak",
    name: "Ngọn lửa bền bỉ",
    category: "streak",
    categoryName: "Thói quen",
    thresholds: [3, 5, 7, 10, 14, 21, 30, 60, 100, 365],
    unit: "ngày liên tiếp",
  },
  {
    metric: "vocab",
    name: "Kho từ kỳ diệu",
    category: "vocab",
    categoryName: "Từ vựng",
    thresholds: [1, 5, 10, 25, 50, 100, 250, 500, 1000, 2000],
    unit: "từ đã ôn",
  },
  {
    metric: "kanji",
    name: "Nét mực sakura",
    category: "kanji",
    categoryName: "Hán tự",
    thresholds: [1, 5, 10, 25, 50, 100, 200, 300, 500, 1000],
    unit: "kanji đã luyện",
  },
  {
    metric: "grammar",
    name: "Mảnh ghép ngôn ngữ",
    category: "grammar",
    categoryName: "Ngữ pháp",
    thresholds: [1, 3, 5, 10, 20, 40, 60, 100, 150, 200],
    unit: "mẫu ngữ pháp đã luyện",
  },
  {
    metric: "tests",
    name: "Nhà thám hiểm đề thi",
    category: "practice",
    categoryName: "Luyện tập",
    thresholds: [1, 2, 3, 5, 10, 20, 30, 50, 75, 100],
    unit: "bài kiểm tra hợp lệ đã lưu",
  },
  {
    metric: "perfect",
    name: "Ngôi sao chính xác",
    category: "practice",
    categoryName: "Luyện tập",
    thresholds: [1, 2, 3, 5, 7, 10, 15, 20, 30, 50],
    unit: "bài đạt toàn bộ câu đúng (ít nhất 5 câu)",
  },
  {
    metric: "roadmap",
    name: "Lá cờ chinh phục",
    category: "milestone",
    categoryName: "Lộ trình",
    thresholds: [1, 3, 5, 7, 10, 15, 30, 45, 60, 90],
    unit: "buổi lộ trình hoàn thành",
  },
  {
    metric: "notebook",
    name: "Người giữ ký ức",
    category: "vocab",
    categoryName: "Sổ tay",
    thresholds: [1, 3, 5, 10, 20, 30, 50, 100, 200, 500],
    unit: "từ khác nhau đã lưu",
  },
  {
    metric: "xp",
    name: "Vương miện trưởng thành",
    category: "milestone",
    categoryName: "Kinh nghiệm",
    thresholds: [100, 250, 500, 1000, 2500, 5000, 10000, 25000, 50000, 100000],
    unit: "XP tích lũy",
  },
];
const ranks = [
  "Mầm nhỏ",
  "Khởi hành",
  "Khám phá",
  "Vững bước",
  "Tỏa sáng",
  "Bứt phá",
  "Tiên phong",
  "Tinh hoa",
  "Huyền thoại",
  "Đỉnh cao",
];
export const TOTAL_ACHIEVEMENTS_COUNT = 100;
export const ACHIEVEMENTS_LIST: AchievementItem[] = tracks.flatMap(
  (track, index) =>
    track.thresholds.map((threshold, tier) => ({
      id: `shiba_v2_${track.metric}_${threshold}`,
      number: index * 10 + tier + 1,
      title:
        threshold === 0
          ? "Chào mừng, bạn đồng hành!"
          : `${track.name} · ${ranks[tier]}`,
      description:
        threshold === 0
          ? "Bắt đầu hành trình học tiếng Nhật cùng Nihon Shiba."
          : `Đạt ${threshold.toLocaleString("vi-VN")} ${track.unit}.`,
      character: "shiba-welcome" as AchievementCharacter,
      category: track.category,
      categoryName: track.categoryName,
      metric: track.metric,
      threshold,
      poseIndex: (index * 2 + Math.floor(tier / 5) + (tier % 5) * 4) % 20,
      tier: tier % 5,
      unlockedByDefault: threshold === 0,
    })),
);
export function practicedStatus(status: any): boolean {
  if (status === true || status === "mastered") return true;
  if (!status || typeof status !== "object") return false;
  return (
    status.passed === true ||
    status.mastered === true ||
    status.state === "mastered" ||
    Number(status.repetitions) > 0 ||
    Number(status.srsStage) > 0 ||
    Number(status.correctCount) > 0
  );
}
export function achievementMetrics(
  profile?: Partial<UserProfile>,
): Record<string, number> {
  const p = profile || {};
  const tests = (p.dailyTestResults || []).filter(
    (t) =>
      Number.isFinite(t.score) &&
      Number.isFinite(t.total) &&
      t.total > 0 &&
      t.score >= 0 &&
      t.score <= t.total,
  );
  const saved = new Set(
    [
      ...(p.savedVocab || []).map((w) => w.word),
      ...(p.savedWords || []).map((w) => w.kanji),
    ].filter(Boolean),
  );
  return {
    days: new Set(p.studyDays || []).size,
    streak: Math.max(0, p.streak || 0),
    vocab: Object.values(p.vocabStatus || {}).filter(practicedStatus).length,
    kanji: Object.values(p.kanjiStatus || {}).filter(practicedStatus).length,
    grammar: Object.values(p.grammarStatus || {}).filter(practicedStatus)
      .length,
    tests: tests.length,
    perfect: tests.filter((t) => t.total >= 5 && t.score === t.total).length,
    roadmap: new Set(p.studyRoadmap?.completedDays || []).size,
    notebook: saved.size,
    xp: Math.max(0, p.xp || 0),
  };
}
export function calculateUnlockedAchievements(
  profile?: Partial<UserProfile>,
): Set<string> {
  const metrics = achievementMetrics(profile);
  const validIds = new Set(ACHIEVEMENTS_LIST.map((a) => a.id));
  const earned = new Set(
    (profile?.unlockedBadges || []).filter((id) => validIds.has(id)),
  );
  for (const item of ACHIEVEMENTS_LIST)
    if ((metrics[item.metric] || 0) >= item.threshold) earned.add(item.id);
  return earned;
}
