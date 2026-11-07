// Small, dependency-free part of the roadmap module: reading/normalising the guest roadmap from
// localStorage. Kept separate so the Sidebar (startup bundle) does not pull the full curriculum data.
import type { JLPTLevel, StudyRoadmapConfig } from '../types';

export const ROADMAP_LEVELS: JLPTLevel[] = ["N5", "N4", "N3", "N2", "N1"];
export const GUEST_ROADMAP_KEY = "nihongo_guest_roadmap_v2";
export function readGuestRoadmap(): StudyRoadmapConfig | undefined {
  try {
    const value = JSON.parse(localStorage.getItem(GUEST_ROADMAP_KEY) || "null");
    if (
      value &&
      ROADMAP_LEVELS.includes(value.targetLevel) &&
      [30, 60, 90].includes(value.durationDays) &&
      Array.isArray(value.completedDays)
    )
      return normalizedRoadmap(value, value.targetLevel, value.startDate);
  } catch {
    /* Guest storage can be unavailable. */
  }
  return undefined;
}

export function normalizedRoadmap(
  saved: StudyRoadmapConfig | undefined,
  level: JLPTLevel,
  today: string,
): StudyRoadmapConfig {
  if (!saved || saved.targetLevel !== level)
    return {
      targetLevel: level,
      durationDays: 60,
      startDate: today,
      currentDay: 1,
      completedDays: [],
      dailyTasks: {},
      curriculumVersion: 2,
    };
  const durationDays = [30, 60, 90].includes(saved.durationDays)
    ? saved.durationDays
    : 60;
  const completedDays = [...new Set(saved.completedDays || [])].filter(
    (d) => Number.isInteger(d) && d >= 1 && d <= durationDays,
  );
  const currentDay =
    Array.from({ length: durationDays }, (_, i) => i + 1).find(
      (d) => !completedDays.includes(d),
    ) || durationDays;
  const dailyTasks: Record<string, string[]> = {};
  for (const [day, tasks] of Object.entries(saved.dailyTasks || {})) {
    if (+day > 0 && +day <= durationDays && Array.isArray(tasks))
      dailyTasks[day] = tasks.filter((t) =>
        ["words", "grammar", "reading", "listening", "review"].includes(t),
      );
  }
  return { ...saved, durationDays, completedDays, currentDay, dailyTasks };
}
