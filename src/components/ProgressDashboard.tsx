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
  studyCalendar,
  validPracticeResult,
} from "../utils/progressInsights";
import {
  calculateUnlockedAchievements,
} from "../data/achievementsData";
import "./progressDashboard.css";
import { readGuestRoadmap } from "../data/jlptRoadmap";

interface Props {
  userProfile: UserProfile;
  todayXp: number;
  updateProfile?: (updated: Partial<UserProfile>) => void;
  onTriggerCelebration?: () => void;
  onNavigateTab?: (tab: string) => void;
}

const LEVELS: JLPTLevel[] = ["N5", "N4", "N3", "N2", "N1"];

const SKILL_COLORS = ["#87c9e3", "#b89bef", "#f0bc86"];

export default function ProgressDashboard({
  userProfile,
  todayXp,
  onNavigateTab,
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
  const [range, setRange] = useState<7 | 28>(28);
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
  const calendar = studyCalendar(profile.studyDays || [], new Date(), range);
  const learnedDays = calendar.filter((d) => d.active).length;
  const earned = calculateUnlockedAchievements(profile);
  const roadmap = profile.studyRoadmap;
  const roadmapCount = new Set(roadmap?.completedDays || []).size;

  return (
    <div className="pd-root">
      <div className="pd-shell">

        {/* ── Top bar ── */}
        <div className="pd-topbar">
          <span className="pd-brand">にほんご</span>
          <div className="pd-level-pills">
            {LEVELS.map((l) => (
              <button
                key={l}
                className={`pd-level-pill${level === l ? " active" : ""}`}
                onClick={() => setLevel(l)}
                aria-pressed={level === l}
              >
                {l}
              </button>
            ))}
          </div>
        </div>

        {/* ── View tabs ── */}
        <div className="pd-tabs">
          <button
            className={`pd-tab${view === "overview" ? " active" : ""}`}
            onClick={() => setView("overview")}
            aria-pressed={view === "overview"}
          >
            Tiến độ
          </button>
          <button
            className={`pd-tab${view === "prediction" ? " active" : ""}`}
            onClick={() => setView("prediction")}
            aria-pressed={view === "prediction"}
          >
            Dự đoán
          </button>
        </div>

        {/* ── KPI row ── */}
        <div className="pd-kpi-grid">
          <div className="pd-kpi">
            <div className="pd-kpi-icon"><Flame size={16} /></div>
            <div className="pd-kpi-num">{profile.streak || 0}</div>
            <div className="pd-kpi-label">Chuỗi ngày</div>
          </div>
          <div className="pd-kpi">
            <div className="pd-kpi-icon pd-kpi-icon--blue">📅</div>
            <div className="pd-kpi-num">{learnedDays}</div>
            <div className="pd-kpi-label">Ngày đã học</div>
          </div>
          <div className="pd-kpi">
            <div className="pd-kpi-icon pd-kpi-icon--purple"><Award size={16} /></div>
            <div className="pd-kpi-num">{Math.max(0, todayXp)}</div>
            <div className="pd-kpi-label">XP hôm nay</div>
          </div>
          <div className="pd-kpi">
            <div className="pd-kpi-icon pd-kpi-icon--green"><Target size={16} /></div>
            <div className="pd-kpi-num">{scoped.length}</div>
            <div className="pd-kpi-label">Đề {level}</div>
          </div>
        </div>

        {view === "overview" ? (
          <>
            {/* ── Skill progress ── */}
            <section className="pd-card">
              <h2 className="pd-card-title">Kiến thức {level}</h2>
              {loading ? (
                <p className="pd-muted">Đang tải…</p>
              ) : (
                <div className="pd-skills">
                  {skills.map((skill) => (
                    <div className="pd-skill-row" key={skill.name}>
                      <div className="pd-skill-header">
                        <span
                          className="pd-skill-pill"
                          style={{ background: skill.color + "22", color: skill.color }}
                        >
                          {skill.name}
                        </span>
                        <span className="pd-skill-pct">{skill.percent}% <small className="pd-skill-sub">· {skill.practiced}/{skill.total}</small></span>
                        <Link to={skill.href} className="pd-skill-link">
                          Tiếp tục <ArrowRight size={11} />
                        </Link>
                      </div>
                      <div className="pd-track">
                        <div
                          className="pd-track-fill"
                          style={{ width: `${skill.percent}%`, background: skill.color }}
                        />
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
                  {([7, 28] as const).map((n) => (
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
                {calendar.map((d) => (
                  <span
                    key={d.date}
                    className={`pd-day${d.active ? " pd-day--active" : ""}`}
                    title={`${d.date}: ${d.active ? "Đã học" : "Chưa học"}`}
                    aria-label={`${d.date}: ${d.active ? "đã học" : "chưa ghi nhận"}`}
                  >
                    {Number(d.date.slice(-2))}
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

            {/* ── Quick actions ── */}
            <section className="pd-card">
              <h2 className="pd-card-title">Luyện tập nhanh</h2>
              {accuracy !== null && (
                <div className="pd-accuracy-badge">
                  <span className="pd-accuracy-num">{accuracy}%</span>
                  <span className="pd-muted">đúng · 10 bài {level} gần nhất</span>
                </div>
              )}
              <div className="pd-actions">
                <Link to={`/jlpt/${level}`} className="pd-action-card">
                  <Target size={20} className="pd-action-icon" />
                  <strong>Luyện đề {level}</strong>
                  <span>Làm bài rồi xem lại lỗi</span>
                </Link>
                <Link to="/shadowing" className="pd-action-card">
                  <BookOpen size={20} className="pd-action-icon" />
                  <strong>Nghe &amp; Shadowing</strong>
                  <span>Luyện với bản chép và câu thật</span>
                </Link>
                <Link to="/so-tay" className="pd-action-card">
                  <RefreshCw size={20} className="pd-action-icon" />
                  <strong>Ôn sổ lỗi</strong>
                  <span>Nhắc lại sau 1, 3, 7 ngày</span>
                </Link>
              </div>
            </section>

            {/* ── History ── */}
            <section className="pd-card">
              <div className="pd-card-header">
                <h2 className="pd-card-title">Lịch sử luyện tập</h2>
                <button
                  className="pd-accent-link"
                  onClick={() => onNavigateTab?.("achievements")}
                >
                  {earned.size} dấu ấn <ArrowRight size={11} />
                </button>
              </div>
              {history.length ? (
                <div className="pd-history-list">
                  {history
                    .slice(-6)
                    .reverse()
                    .map((t, i) => (
                      <div className="pd-history-row" key={`${t.date}-${i}`}>
                        <div>
                          <div className="pd-history-date">{t.date}</div>
                          <div className="pd-muted" style={{ fontSize: "10px" }}>
                            {t.level || "—"} · {t.fullExam ? "Đủ phần" : "Bài luyện"}
                          </div>
                        </div>
                        <div className="pd-history-score">
                          <strong>{t.score}/{t.total}</strong>
                          <span className="pd-muted">{Math.round((t.score / t.total) * 100)}%</span>
                        </div>
                      </div>
                    ))}
                </div>
              ) : (
                <p className="pd-muted">
                  Chưa có bài kiểm tra. Hoàn thành và nộp bài để kết quả xuất hiện ở đây.
                </p>
              )}
            </section>
          </>
        ) : (
          /* ── Prediction view ── */
          <section className="pd-card">
            <h2 className="pd-card-title">Dự đoán điểm {level}</h2>
            {projection.ready ? (
              <>
                <div className="pd-score-hero">
                  <div className="pd-score-num">
                    {projection.score}
                    <span className="pd-score-denom">/ 180</span>
                  </div>
                  <div>
                    <div className="pd-score-range">
                      {projection.low}–{projection.high} điểm tham khảo
                    </div>
                    <div className="pd-muted" style={{ fontSize: "11px", marginTop: "4px" }}>
                      Từ {projection.examCount} đề gần nhất trong 90 ngày
                    </div>
                  </div>
                </div>
                <div className="pd-sections-grid">
                  {projection.sections.map((s) => (
                    <div className="pd-section-card" key={s.name}>
                      <div className="pd-muted" style={{ fontSize: "11px" }}>{s.name}</div>
                      <div className="pd-section-score">
                        {Math.round(s.rate * s.max)}
                        <span className="pd-muted" style={{ fontSize: "13px" }}> / {s.max}</span>
                      </div>
                      <div className="pd-track" style={{ marginTop: "8px" }}>
                        <div
                          className="pd-track-fill"
                          style={{ width: `${s.rate * 100}%` }}
                        />
                      </div>
                      <div className="pd-muted" style={{ fontSize: "9px", marginTop: "5px" }}>
                        {s.correct}/{s.total} câu · {Math.floor(s.low * s.max)}–{Math.ceil(s.high * s.max)}
                      </div>
                    </div>
                  ))}
                </div>
              </>
            ) : (
              <div className="pd-not-enough">
                <div className="pd-not-enough-icon">📊</div>
                <div>
                  <div className="pd-not-enough-title">Chưa đủ dữ liệu</div>
                  <p className="pd-muted" style={{ marginTop: "6px", lineHeight: 1.7 }}>
                    Đã có {projection.examCount}/3 đề đủ điều kiện. Cần 3 đề {level} khác nhau trong 90 ngày, đủ phần và ít nhất 40 câu mỗi đề.
                  </p>
                  <Link to={`/jlpt/${level}`} className="pd-cta-link">
                    Làm thêm đề {level} <ArrowRight size={13} />
                  </Link>
                </div>
              </div>
            )}
            <div className="pd-model-note">
              <strong>Hiểu đúng con số này</strong>
              <p className="pd-muted">
                Quy đổi tuyến tính tỷ lệ đúng theo thang 180 — không phải mô hình hiệu chuẩn. Điểm JLPT chính thức được chuẩn hóa, không tính trực tiếp bằng số câu đúng.{" "}
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
