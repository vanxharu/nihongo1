import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import {
  ArrowRight,
  BookOpen,
  Flame,
  Target,
  Award,
  RefreshCw,
} from "lucide-react";
import type { UserProfile, JLPTLevel } from "../types";
import { KANJI_DATA, VOCABULARY_DATA, GRAMMAR_DATA } from "../data";
import { safeFetchJson } from "../utils/safeApi";
import {
  catalogProgress,
  practiceProjection,
  scorePrediction,
  studyCalendar,
  validPracticeResult,
} from "../utils/progressInsights";
import {
  calculateUnlockedAchievements,
} from "../data/achievementsData";
import ProgressRing from "./ui/ProgressRing";
import RadarChart from "./ui/RadarChart";
import "./progressDashboard.css";
import { readGuestRoadmap } from "../data/jlptRoadmap";

interface Props {
  userProfile: UserProfile;
  todayXp: number;
  updateProfile?: (updated: Partial<UserProfile>) => void;
  onTriggerCelebration?: () => void;
  onNavigateTab?: (tab: string) => void;
  embedded?: boolean;
}

const LEVELS: JLPTLevel[] = ["N5", "N4", "N3", "N2", "N1"];

const SKILL_COLORS = ["#87c9e3", "#b89bef", "#f0bc86"];

export default function ProgressDashboard({
  userProfile,
  todayXp,
  onNavigateTab,
  embedded,
}: Props) {
  const guestPlan = !userProfile.uid ? readGuestRoadmap() : undefined;
  const profile = guestPlan
    ? { ...userProfile, studyRoadmap: guestPlan }
    : userProfile;

  const [level, setLevel] = useState<JLPTLevel>(profile.targetLevel || "N5");
  const [catalog, setCatalog] = useState<any[][]>([
    VOCABULARY_DATA,
    GRAMMAR_DATA,
    KANJI_DATA,
  ]);
  const [loading, setLoading] = useState(true);
  const [fallback, setFallback] = useState(false);
  const [range, setRange] = useState<28 | 91>(91);
  const [view, setView] = useState<"overview" | "prediction">("overview");

  useEffect(() => {
    let active = true;
    Promise.all(
      ["/api/vocabularies", "/api/grammars", "/api/kanjis"].map((url) =>
        safeFetchJson<any[]>(url),
      ),
    )
      .then((result) => {
        if (!active) return;
        setFallback(
          result.some((r) => !r.ok || !Array.isArray(r.data) || !r.data.length),
        );
        setCatalog(
          result.map((r, i) =>
            r.ok && Array.isArray(r.data) && r.data.length
              ? r.data
              : [VOCABULARY_DATA, GRAMMAR_DATA, KANJI_DATA][i],
          ),
        );
        setLoading(false);
      })
      .catch(() => {
        if (active) {
          setFallback(true);
          setLoading(false);
        }
      });
    return () => {
      active = false;
    };
  }, []);

  const skills = [
    {
      name: "Từ vựng",
      ...catalogProgress(catalog[0], profile.vocabStatus || {}, level, "vocab"),
      href: `/jlpt/${level}/vocabulary`,
      color: SKILL_COLORS[0],
    },
    {
      name: "Ngữ pháp",
      ...catalogProgress(
        catalog[1],
        profile.grammarStatus || {},
        level,
        "grammar",
      ),
      href: `/jlpt/${level}/grammar`,
      color: SKILL_COLORS[1],
    },
    {
      name: "Kanji",
      ...catalogProgress(catalog[2], profile.kanjiStatus || {}, level, "kanji"),
      href: `/jlpt/${level}/kanji`,
      color: SKILL_COLORS[2],
    },
  ];

  const history = (profile.dailyTestResults || []).filter(validPracticeResult);
  const scoped = history.filter((t) => t.level === level);
  const recent = scoped.slice(-10);
  const total = recent.reduce((n, t) => n + t.total, 0),
    correct = recent.reduce((n, t) => n + t.score, 0);
  const accuracy = total ? Math.round((correct / total) * 100) : null;
  const projection = practiceProjection(history, level);
  const mastery = skills.reduce((n, k) => n + k.percent, 0) / (skills.length * 100);
  const pred = scorePrediction(history, level, mastery);
  const calendar = studyCalendar(profile.studyDays || [], new Date(), range);
  const learnedDays = calendar.filter((d) => d.active).length;
  const earned = calculateUnlockedAchievements(profile);
  const roadmap = profile.studyRoadmap;
  const roadmapCount = new Set(roadmap?.completedDays || []).size;

  return (
    <div className={`pd-root${embedded ? " pd-embedded" : ""}`}>
      <div className="pd-shell">

        {view === "overview" ? (
          <>
            {/* ── Skill progress ── */}
            <section className="pd-card">
              {loading ? (
                <p className="pd-muted">Đang tải…</p>
              ) : (
                <div className="pd-skills">
                  {skills.map((skill) => (
                    <div className="pd-skill-row" key={skill.name}>
                      <div className="pd-skill-header" style={{ alignItems: "center", gap: 12 }}>
                        <ProgressRing percent={skill.percent} color={skill.color} />
                        <div style={{ flex: 1 }}>
                          <span
                            className="pd-skill-pill"
                            style={{ background: skill.color + "22", color: skill.color }}
                          >
                            {skill.name}
                          </span>
                          <small className="pd-skill-sub" style={{ display: "block", marginTop: 4 }}>{skill.practiced}/{skill.total}</small>
                        </div>
                        <Link to={skill.href} className="pd-skill-link">
                          Tiếp tục <ArrowRight size={11} />
                        </Link>
                      </div>
                    </div>
                  ))}
                </div>
              )}
              {fallback && (
                <p className="pd-footnote">Một số nội dung đang dùng thư viện dự phòng.</p>
              )}
            </section>

            {/* ── Calendar ── */}
            <section className="pd-card">
              <div className="pd-card-header">
                <h2 className="pd-card-title">Nhịp học</h2>
                <div className="pd-range-pills">
                  {([28, 91] as const).map((n) => (
                    <button
                      key={n}
                      className={`pd-range-pill${range === n ? " active" : ""}`}
                      onClick={() => setRange(n)}
                      aria-pressed={range === n}
                    >
                      {n} ngày
                    </button>
                  ))}
                </div>
              </div>
              <div className="pd-calendar">
                {Array.from({ length: (new Date(calendar[0].date + "T00:00:00Z").getUTCDay() + 6) % 7 }, (_, i) => (
                  <span key={`pad${i}`} aria-hidden="true" />
                ))}
                {calendar.map((d) => (
                  <span
                    key={d.date}
                    className={`pd-day${d.active ? " pd-day--active" : ""}`}
                    title={`${d.date}: ${d.active ? "Đã học" : "Chưa học"}`}
                    aria-label={`${d.date}: ${d.active ? "đã học" : "chưa ghi nhận"}`}
                  >
                  </span>
                ))}
              </div>
              <div className="pd-cal-legend">
                <span className="pd-cal-dot" />
                Ngày có hoạt động đã lưu · giờ Việt Nam
              </div>
              {roadmap && (
                <div className="pd-roadmap-strip">
                  <span>Lộ trình {roadmap.targetLevel}</span>
                  <span className="pd-muted">{roadmapCount} / {roadmap.durationDays} buổi</span>
                  <Link to="/lo-trinh" className="pd-accent-link">
                    Xem <ArrowRight size={11} />
                  </Link>
                </div>
              )}
            </section>

          </>
        ) : (
          /* ── Prediction view ── */
          <section className="pd-card">
            <h2 className="pd-card-title">Dự đoán điểm {level}</h2>
            <div className="pd-score-hero">
              <div className="pd-score-num">{pred.score}<span className="pd-score-denom">/ 180</span></div>
              <div>
                <div className="pd-score-range">{pred.low}–{pred.high} điểm (khoảng tin cậy ~80%)</div>
                <div className="pd-muted" style={{ fontSize: "11px", marginTop: "4px" }}>
                  Xác suất đạt (≥{pred.passTotal} điểm, mỗi phần đủ điểm liệt): <strong>{pred.passProbability}%</strong>
                </div>
                <div className="pd-muted" style={{ fontSize: "11px", marginTop: "4px" }}>
                  Độ tin cậy: {pred.confidence} · {pred.examCount} đề đầy đủ · phủ nội dung {Math.round(pred.mastery * 100)}%
                  {pred.trendPerWeek !== null && <> · xu hướng {pred.trendPerWeek >= 0 ? "+" : ""}{pred.trendPerWeek} điểm/tuần</>}
                </div>
              </div>
            </div>
            <div style={{ display: "flex", justifyContent: "center", margin: "8px 0" }}>
              <RadarChart labels={pred.sections.map((x) => x.name)} values={pred.sections.map((x) => x.rate)} />
            </div>
            <div className="pd-sections-grid">
              {pred.sections.map((s) => (
                <div className="pd-section-card" key={s.name}>
                  <div className="pd-muted" style={{ fontSize: "11px" }}>{s.name}</div>
                  <div className="pd-section-score">{Math.round(s.score)}<span className="pd-muted" style={{ fontSize: "13px" }}> / {s.max}</span></div>
                  <div className="pd-track" style={{ marginTop: "8px" }}><div className="pd-track-fill" style={{ width: `${s.rate * 100}%` }} /></div>
                  <div className="pd-muted" style={{ fontSize: "9px", marginTop: "5px" }}>{Math.round(s.low)}–{Math.round(s.high)} điểm</div>
                </div>
              ))}
            </div>
            {pred.examCount < 3 && (
              <div className="pd-not-enough">
                <div className="pd-not-enough-icon">📊</div>
                <div>
                  <div className="pd-not-enough-title">Dự đoán còn dựa nhiều vào mức độ đã học</div>
                  <p className="pd-muted" style={{ marginTop: "6px", lineHeight: 1.7 }}>
                    Làm thêm đề {level} đầy đủ (đủ 3 phần) để tăng độ chính xác. {pred.weakest ? `Phần yếu nhất hiện tại: ${pred.weakest}.` : ""}
                  </p>
                  <Link to={`/jlpt/${level}`} className="pd-cta-link">Làm thêm đề {level} <ArrowRight size={13} /></Link>
                </div>
              </div>
            )}
            <div className="pd-model-note">
              <strong>Hiểu đúng con số này</strong>
              <p className="pd-muted">
                Ước lượng thống kê từ đề bạn đã làm (đề mới được tính nặng hơn), kết hợp mức độ nội dung đã luyện; không phải điểm chính thức. Điểm JLPT chính thức được chuẩn hóa, không tính trực tiếp bằng số câu đúng.{" "}
                <a
                  href="https://www.jlpt.jp/e/guideline/results.html"
                  target="_blank"
                  rel="noreferrer"
                  className="pd-accent-link"
                >
                  Cách tính điểm chính thức ↗
                </a>
              </p>
            </div>
          </section>
        )}
      </div>
    </div>
  );
}
