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

// ── Dự đoán điểm theo năng lực học ──────────────────────────────────────────
// Kết hợp: (1) kết quả đề gần đây, trọng số giảm dần theo thời gian (nửa đời 21 ngày);
// (2) độ phủ học tập (từ vựng/ngữ pháp/kanji đã luyện) làm "ước lượng nền" khi ít đề;
// (3) xu hướng điểm; (4) xác suất đạt theo điểm đậu + điểm liệt từng phần của JLPT.
const PASS: Record<JLPTLevel, { total: number; sectional: number }> = {
  N5: { total: 80, sectional: 38 }, N4: { total: 90, sectional: 38 },
  N3: { total: 95, sectional: 19 }, N2: { total: 90, sectional: 19 }, N1: { total: 100, sectional: 19 },
};
const normCdf = (z: number) => {
  const t = 1 / (1 + 0.2316419 * Math.abs(z));
  const d = 0.3989423 * Math.exp((-z * z) / 2);
  const p = d * t * (0.3193815 + t * (-0.3565638 + t * (1.781478 + t * (-1.821256 + t * 1.330274))));
  return z > 0 ? 1 - p : p;
};
const SECTION_KEYS = ["knowledge", "reading", "listening"] as const;

export function scorePrediction(
  results: UserProfile["dailyTestResults"],
  level: JLPTLevel,
  mastery: number, // 0..1: tỉ lệ nội dung đã luyện (trung bình từ vựng/ngữ pháp/kanji)
  now = new Date(),
) {
  const HALF_LIFE = 21 * 86400000;
  const exams = (results || [])
    .filter((t) => validPracticeResult(t) && t.level === level && t.fullExam === true && t.total >= 30 &&
      Number.isFinite(Date.parse(t.date)) && Date.parse(t.date) <= now.getTime() &&
      t.sections && SECTION_KEYS.every((k) => t.sections?.[k] && t.sections[k].total > 0))
    .sort((a, b) => Date.parse(a.date) - Date.parse(b.date))
    .slice(-8);
  const m = Math.min(1, Math.max(0, mastery));
  // Nền: 25% (đoán mò 4 đáp án) → ~75% khi đã luyện hết nội dung.
  const prior = 0.25 + 0.5 * m;
  const PRIOR_N = 24; // số câu "ảo" của ước lượng nền cho mỗi phần
  const secs = SECTION_KEYS.map((key) => {
    let c = 0, n = 0;
    for (const t of exams) {
      const w = Math.pow(0.5, (now.getTime() - Date.parse(t.date)) / HALF_LIFE);
      c += w * t.sections![key].correct; n += w * t.sections![key].total;
    }
    const rate = (c + prior * PRIOR_N) / (n + PRIOR_N);
    return { key, rate, n: n + PRIOR_N, realN: n };
  });
  const groups = level === "N4" || level === "N5"
    ? [
        { name: "Kiến thức ngôn ngữ & Đọc", parts: [secs[0], secs[1]], max: 120 },
        { name: "Nghe hiểu", parts: [secs[2]], max: 60 },
      ]
    : [
        { name: "Kiến thức ngôn ngữ", parts: [secs[0]], max: 60 },
        { name: "Đọc hiểu", parts: [secs[1]], max: 60 },
        { name: "Nghe hiểu", parts: [secs[2]], max: 60 },
      ];
  const sections = groups.map((g) => {
    const n = g.parts.reduce((s, p) => s + p.n, 0);
    const rate = g.parts.reduce((s, p) => s + p.rate * p.n, 0) / n;
    const sd = Math.sqrt((rate * (1 - rate)) / n);
    return { name: g.name, max: g.max, rate, sd, score: rate * g.max, low: Math.max(0, rate - 1.28 * sd) * g.max, high: Math.min(1, rate + 1.28 * sd) * g.max, realN: g.parts.reduce((s, p) => s + p.realN, 0) };
  });
  const score = sections.reduce((s, x) => s + x.score, 0);
  const sdTotal = Math.sqrt(sections.reduce((s, x) => s + (x.sd * x.max) ** 2, 0));
  const { total: passTotal, sectional } = PASS[level];
  // Xác suất đạt = P(tổng ≥ điểm đậu) × Π P(từng phần ≥ điểm liệt) (xấp xỉ chuẩn, bảo thủ).
  let pass = normCdf((score - passTotal) / Math.max(sdTotal, 1));
  for (const x of sections) pass *= normCdf((x.score - sectional) / Math.max(x.sd * x.max, 1));
  // Xu hướng: độ dốc hồi quy % đúng theo tuần (cần ≥3 đề).
  let trendPerWeek: number | null = null;
  if (exams.length >= 3) {
    const xs = exams.map((t) => Date.parse(t.date) / (7 * 86400000));
    const ys = exams.map((t) => (t.score / t.total) * 180);
    const mx = xs.reduce((a, b) => a + b, 0) / xs.length, my = ys.reduce((a, b) => a + b, 0) / ys.length;
    const den = xs.reduce((s, x) => s + (x - mx) ** 2, 0);
    if (den > 0) trendPerWeek = xs.reduce((s, x, i) => s + (x - mx) * (ys[i] - my), 0) / den;
  }
  const confidence = exams.length >= 5 ? "cao" : exams.length >= 3 ? "khá" : exams.length >= 1 ? "thấp" : "rất thấp";
  return {
    score: Math.round(score),
    low: Math.floor(sections.reduce((s, x) => s + x.low, 0)),
    high: Math.ceil(sections.reduce((s, x) => s + x.high, 0)),
    sections, passTotal, sectional,
    passProbability: Math.round(Math.min(0.99, Math.max(0.01, pass)) * 100),
    trendPerWeek: trendPerWeek === null ? null : Math.round(trendPerWeek * 10) / 10,
    examCount: exams.length, confidence, mastery: m,
    weakest: sections.slice().sort((a, b) => a.rate - b.rate)[0]?.name,
  };
}
