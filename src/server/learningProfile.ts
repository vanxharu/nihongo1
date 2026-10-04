import { shadowingDatabase } from "./shadowingStore";
import type { StudyRoadmapConfig } from "../types";
export function validateRoadmap(value: any): StudyRoadmapConfig {
  if (
    !value ||
    !["N5", "N4", "N3", "N2", "N1"].includes(value.targetLevel) ||
    ![30, 60, 90].includes(value.durationDays) ||
    typeof value.startDate !== "string" ||
    !/^\d{4}-\d{2}-\d{2}$/.test(value.startDate) ||
    !Array.isArray(value.completedDays) ||
    value.completedDays.some(
      (d: any) => !Number.isInteger(d) || d < 1 || d > value.durationDays,
    ) ||
    !Number.isInteger(value.currentDay) ||
    value.currentDay < 1 ||
    value.currentDay > value.durationDays
  )
    throw new Error("INVALID_ROADMAP");
  const dailyTasks: Record<string, string[]> = {};
  for (const [day, tasks] of Object.entries(value.dailyTasks || {})) {
    if (
      !/^\d+$/.test(day) ||
      +day < 1 ||
      +day > value.durationDays ||
      !Array.isArray(tasks) ||
      tasks.length > 5 ||
      tasks.some(
        (t) =>
          !["words", "grammar", "reading", "listening", "review"].includes(t),
      )
    )
      throw new Error("INVALID_ROADMAP");
    dailyTasks[day] = [...new Set(tasks)];
  }
  return {
    targetLevel: value.targetLevel,
    durationDays: value.durationDays,
    startDate: value.startDate,
    currentDay: value.currentDay,
    completedDays: [...new Set<number>(value.completedDays)],
    dailyTasks,
    curriculumVersion: 2,
  };
}
export async function readLearningProfile(uid: string) {
  if (!process.env.SHADOWING_FIREBASE_SERVICE_ACCOUNT) return {};
  const snapshot = await shadowingDatabase()
    .collection("learning_profiles")
    .doc(uid)
    .get();
  const data = snapshot.data();
  return data?.studyRoadmap
    ? { studyRoadmap: validateRoadmap(data.studyRoadmap) }
    : {};
}
export async function saveLearningProfile(uid: string, roadmap: unknown) {
  const studyRoadmap = validateRoadmap(roadmap);
  await shadowingDatabase()
    .collection("learning_profiles")
    .doc(uid)
    .set({ studyRoadmap }, { merge: true });
  return { studyRoadmap };
}
