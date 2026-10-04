import assert from "node:assert/strict";
import test from "node:test";
import { readFileSync } from "node:fs";
import ts from "typescript";
import vm from "node:vm";
function load(path, imports = {}) {
  const exports = {};
  vm.runInNewContext(
    ts.transpileModule(readFileSync(new URL(path, import.meta.url), "utf8"), {
      compilerOptions: {
        module: ts.ModuleKind.CommonJS,
        target: ts.ScriptTarget.ES2022,
      },
    }).outputText,
    { exports, require: (id) => imports[id], Intl, Date },
  );
  return exports;
}
const roadmap = load("../src/data/jlptRoadmap.ts");
const progress = load("../src/utils/progressInsights.ts");
const badges = load("../src/data/achievementsData.ts");
const storage = load("../src/server/learningProfile.ts", {
  "./shadowingStore": {},
});
const now = new Date("2026-10-05T04:00:00Z");
const result = (examId, score = 30) => ({
  examId,
  date: "2026-10-05",
  level: "N4",
  fullExam: true,
  score,
  total: 60,
  sections: {
    knowledge: { correct: score / 3, total: 20 },
    reading: { correct: score / 3, total: 20 },
    listening: { correct: score / 3, total: 20 },
  },
});
test("all five levels cover every day with six contiguous stages and actionable tasks", () => {
  for (const level of roadmap.ROADMAP_LEVELS)
    for (const duration of [30, 60, 90]) {
      assert.equal(roadmap.JLPT_JOURNEYS[level].stages.length, 6);
      let previous = 0;
      for (let i = 0; i < 6; i++) {
        const range = roadmap.stageRange(i, duration);
        assert.equal(range.start, previous + 1);
        previous = range.end;
        for (let d = range.start; d <= range.end; d++) {
          const plan = roadmap.roadmapDay(level, duration, d);
          assert.equal(plan.index, i);
          assert.equal(plan.tasks.length, 5);
          assert.equal(plan.checkpoint, d === range.end);
          assert.ok(plan.tasks.every((t) => t.text && t.route.startsWith("/")));
        }
      }
      assert.equal(previous, duration);
    }
});
test("legacy completed days survive and first unfinished day is resumed", () => {
  const value = roadmap.normalizedRoadmap(
    {
      targetLevel: "N4",
      durationDays: 60,
      startDate: "2026-10-01",
      completedDays: [1, 1, 3, 99],
      currentDay: 4,
    },
    "N4",
    "2026-10-05",
  );
  assert.equal(value.currentDay, 2);
  assert.equal(JSON.stringify(value.completedDays), "[1,3]");
  assert.equal(roadmap.completeRoadmapDay(value, 2).currentDay, 4);
  assert.equal(
    roadmap.completeRoadmapDay(roadmap.completeRoadmapDay(value, 2), 2)
      .completedDays.length,
    3,
  );
});
test("switching level does not carry another level completion", () => {
  const p = roadmap.normalizedRoadmap(
    { targetLevel: "N4", durationDays: 60, completedDays: [1, 2] },
    "N1",
    "2026-10-05",
  );
  assert.equal(p.completedDays.length, 0);
  assert.equal(p.targetLevel, "N1");
});
test("server plan validator rejects out of range days and arbitrary fields", () => {
  const plan = {
    targetLevel: "N4",
    durationDays: 60,
    startDate: "2026-10-05",
    currentDay: 1,
    completedDays: [],
    dailyTasks: { 1: ["words"] },
    role: "admin",
  };
  assert.equal(storage.validateRoadmap(plan).role, undefined);
  assert.throws(() =>
    storage.validateRoadmap({ ...plan, completedDays: [61] }),
  );
  assert.throws(() =>
    storage.validateRoadmap({ ...plan, dailyTasks: { 1: ["admin"] } }),
  );
});
test("catalog progress does not count new or bookmarked items and excludes other levels", () => {
  const p = progress.catalogProgress(
    [
      { id: "1", level: "N4" },
      { id: "2", level: "N4" },
      { id: "3", level: "N5" },
    ],
    { 1: "new", 2: { state: "new", isBookmarked: true }, 3: "mastered" },
    "N4",
    "vocab",
  );
  assert.equal(p.practiced, 0);
  assert.equal(p.total, 2);
  assert.equal(
    progress.catalogProgress(
      [{ id: "1", level: "N4" }],
      { 1: { repetitions: 1 } },
      "N4",
      "vocab",
    ).percent,
    100,
  );
});
test("projection needs three distinct complete exams of the selected level", () => {
  assert.equal(
    progress.practiceProjection(
      [{ date: "2026-10-05", score: 10, total: 10 }],
      "N4",
      now,
    ).ready,
    false,
  );
  assert.equal(
    progress.practiceProjection(
      [result("a"), result("a"), result("a")],
      "N4",
      now,
    ).ready,
    false,
  );
  assert.equal(
    progress.practiceProjection(
      [result("a"), result("b"), { ...result("c"), level: "N5" }],
      "N4",
      now,
    ).ready,
    false,
  );
});
test("projection uses official section grouping but labels raw ratio surrogate and stays within 180", () => {
  for (const level of ["N4", "N3"]) {
    const p = progress.practiceProjection(
      ["a", "b", "c"].map((id) => ({ ...result(id, 60), level })),
      level,
      now,
    );
    assert.equal(p.ready, true);
    assert.equal(p.score, 180);
    assert.equal(p.high, 180);
    assert.ok(p.low < p.score);
    assert.equal(p.sections.length, level === "N4" ? 2 : 3);
  }
});
test("malformed section data and future or old results are excluded", () => {
  for (const bad of [
    { ...result("c"), sections: { knowledge: { correct: 10, total: 20 } } },
    { ...result("c"), date: "2027-01-01" },
    { ...result("c"), date: "2025-01-01" },
    { ...result("c"), score: 61 },
  ])
    assert.equal(
      progress.practiceProjection([result("a"), result("b"), bad], "N4", now)
        .ready,
      false,
    );
});
test("100 badges have unique identifiers and unique pose plus tier designs", () => {
  assert.equal(badges.ACHIEVEMENTS_LIST.length, 100);
  assert.equal(new Set(badges.ACHIEVEMENTS_LIST.map((b) => b.id)).size, 100);
  assert.equal(
    new Set(badges.ACHIEVEMENTS_LIST.map((b) => `${b.poseIndex}-${b.tier}`))
      .size,
    100,
  );
  assert.equal(badges.calculateUnlockedAchievements().size, 1);
});
test("opening page or adding new/bookmarked items cannot unlock practice badges", () => {
  const p = {
    vocabStatus: { one: "new" },
    grammarStatus: { one: { isBookmarked: true, state: "new" } },
    kanjiStatus: { one: false },
    dailyTestResults: [],
    studyDays: [],
    unlockedBadges: ["shiba_v2_fake"],
  };
  assert.equal(badges.calculateUnlockedAchievements(p).size, 1);
  assert.equal(badges.achievementMetrics(p).vocab, 0);
});
test("study calendar rolls over at Vietnamese midnight and deduplicates study dates", () => {
  const before = progress.studyCalendar(
    ["2026-10-05", "2026-10-05"],
    new Date("2026-10-05T16:59:59Z"),
    7,
  );
  const after = progress.studyCalendar([], new Date("2026-10-05T17:00:00Z"), 7);
  assert.equal(before.at(-1).date, "2026-10-05");
  assert.equal(after.at(-1).date, "2026-10-06");
  assert.equal(before.filter((d) => d.active).length, 1);
});
