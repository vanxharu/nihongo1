import type { JLPTLevel, UserProfile } from "../types";
export function validPracticeResult(result: any): boolean {
  return (
    !!result &&
    Number.isInteger(result.score) &&
    Number.isInteger(result.total) &&
    result.total > 0 &&
    result.score >= 0 &&
    result.score <= result.total
  );
}
export function statusPracticed(status: any): boolean {
  if (status === true || status === "mastered") return true;
  return (
    !!status &&
    typeof status === "object" &&
    (status.passed === true ||
      status.mastered === true ||
      status.state === "mastered" ||
      Number(status.repetitions) > 0 ||
      Number(status.srsStage) > 0 ||
      Number(status.correctCount) > 0)
  );
}
export function catalogProgress(
  items: any[],
  status: Record<string, any>,
  level: JLPTLevel,
  kind: string,
) {
  const unique = new Map<string, any>();
  for (const item of items) {
    if (String(item.level || "").toUpperCase() !== level) continue;
    const key = String(item.id ?? item.character ?? item.kanji ?? item.word);
    if (key && key !== "undefined") unique.set(key, item);
  }
  let practiced = 0;
  for (const [id, item] of unique) {
    const aliases =
      kind === "kanji"
        ? [
            id,
            `k_${id.replace(/^k_/, "")}`,
            id.replace(/^k_/, ""),
            item.character,
            item.kanji,
          ]
        : [
            id,
            String(item.grammarId ?? ""),
            String(item.sourceGrammarId ?? ""),
          ];
    if (aliases.some((key) => key && statusPracticed(status[key]))) practiced++;
  }
  return {
    total: unique.size,
    practiced,
    percent: unique.size ? Math.round((practiced / unique.size) * 100) : 0,
  };
}
function wilson(correct: number, total: number) {
  const z = 1.96,
    p = correct / total,
    d = 1 + (z * z) / total,
    c = (p + (z * z) / (2 * total)) / d,
    h =
      (z * Math.sqrt((p * (1 - p)) / total + (z * z) / (4 * total * total))) /
      d;
  return { low: Math.max(0, c - h), high: Math.min(1, c + h), rate: p };
}
export function practiceProjection(
  results: UserProfile["dailyTestResults"],
  level: JLPTLevel,
  now = new Date(),
) {
  const cutoff = now.getTime() - 90 * 86400000;
  const recent = results.filter(
    (t) =>
      validPracticeResult(t) &&
      t.level === level &&
      t.fullExam === true &&
      t.total >= 40 &&
      Number.isFinite(Date.parse(t.date)) &&
      Date.parse(t.date) >= cutoff &&
      Date.parse(t.date) <= now.getTime() &&
      t.sections &&
      ["knowledge", "reading", "listening"].every((key) => t.sections?.[key]) &&
      Object.keys(t.sections).length === 3 &&
      Object.values(t.sections).every(
        (s) =>
          Number.isInteger(s.correct) &&
          Number.isInteger(s.total) &&
          s.total > 0 &&
          s.correct >= 0 &&
          s.correct <= s.total,
      ) &&
      Object.values(t.sections).reduce((n, s) => n + s.total, 0) === t.total &&
      Object.values(t.sections).reduce((n, s) => n + s.correct, 0) === t.score,
  );
  const seen = new Set<string>();
  const exams = recent
    .slice()
    .reverse()
    .filter((t) => {
      if (!t.examId || seen.has(t.examId)) return false;
      seen.add(t.examId);
      return true;
    })
    .slice(0, 5);
  if (exams.length < 3)
    return {
      ready: false as const,
      examCount: exams.length,
      needed: 3 - exams.length,
    };
  const totals = {
    knowledge: { correct: 0, total: 0 },
    reading: { correct: 0, total: 0 },
    listening: { correct: 0, total: 0 },
  };
  for (const t of exams)
    for (const key of ["knowledge", "reading", "listening"] as const) {
      totals[key].correct += t.sections![key].correct;
      totals[key].total += t.sections![key].total;
    }
  const groups =
    level === "N4" || level === "N5"
      ? [
          {
            name: "Kiến thức ngôn ngữ & Đọc",
            correct: totals.knowledge.correct + totals.reading.correct,
            total: totals.knowledge.total + totals.reading.total,
            max: 120,
          },
          { name: "Nghe hiểu", ...totals.listening, max: 60 },
        ]
      : [
          { name: "Kiến thức ngôn ngữ", ...totals.knowledge, max: 60 },
          { name: "Đọc hiểu", ...totals.reading, max: 60 },
          { name: "Nghe hiểu", ...totals.listening, max: 60 },
        ];
  const sections = groups.map((g) => ({ ...g, ...wilson(g.correct, g.total) }));
  return {
    ready: true as const,
    examCount: exams.length,
    needed: 0,
    score: Math.round(sections.reduce((n, s) => n + s.rate * s.max, 0)),
    low: Math.floor(sections.reduce((n, s) => n + s.low * s.max, 0)),
    high: Math.ceil(sections.reduce((n, s) => n + s.high * s.max, 0)),
    sections,
  };
}
export function studyCalendar(days: string[], now = new Date(), length = 28) {
  const parts = new Intl.DateTimeFormat("en-CA", {
    timeZone: "Asia/Ho_Chi_Minh",
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  }).formatToParts(now);
  const get = (key: string) => parts.find((p) => p.type === key)!.value;
  const day = Date.UTC(+get("year"), +get("month") - 1, +get("day"));
  const set = new Set(days);
  return Array.from({ length }, (_, i) => {
    const date = new Date(day - (length - 1 - i) * 86400000)
      .toISOString()
      .slice(0, 10);
    return { date, active: set.has(date) };
  });
}
