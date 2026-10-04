import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import {
  ArrowRight,
  BookOpen,
  Check,
  Flame,
  Target,
  TrendingUp,
  Award,
  Calendar,
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
  ACHIEVEMENTS_LIST,
  calculateUnlockedAchievements,
} from "../data/achievementsData";
import { AchievementMascotIcon } from "./achievements/AchievementMascotIcon";
import ShibaMascot from "./mascot/ShibaMascot";
import "./progressDashboard.css";
import { readGuestRoadmap } from "../data/jlptRoadmap";
interface Props {
  userProfile: UserProfile;
  todayXp: number;
  updateProfile?: (updated: Partial<UserProfile>) => void;
  onTriggerCelebration?: () => void;
  onNavigateTab?: (tab: string) => void;
}
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
      color: "#87c9e3",
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
      color: "#b89bef",
    },
    {
      name: "Kanji",
      ...catalogProgress(catalog[2], profile.kanjiStatus || {}, level, "kanji"),
      href: `/jlpt/${level}/kanji`,
      color: "#f0bc86",
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
  const badges = ACHIEVEMENTS_LIST.filter((a) => earned.has(a.id)).slice(-5);
  const roadmap = profile.studyRoadmap;
  const roadmapCount = new Set(roadmap?.completedDays || []).size;
  return (
    <div className="progress-studio">
      <div className="progress-shell">
        <div className="progress-top">
          <span>NIHON SHIBA · HỒ SƠ HỌC TẬP</span>
          <select
            aria-label="Cấp độ xem tiến độ"
            value={level}
            onChange={(e) => setLevel(e.target.value as JLPTLevel)}
          >
            {["N5", "N4", "N3", "N2", "N1"].map((l) => (
              <option key={l}>{l}</option>
            ))}
          </select>
        </div>
        <section className="progress-hero">
          <div>
            <span className="progress-eyebrow">
              MỖI NGÀY MỘT CHÚT · MỖI CHÚT MỘT BƯỚC
            </span>
            <h1>
              Nhìn lại để
              <br />
              <em>đi xa hơn.</em>
            </h1>
            <p>
              Tiến bộ của bạn nằm ở những gì đã luyện, những lỗi đã sửa và nhịp
              học được giữ lại.
            </p>
            <nav aria-label="Nội dung tiến độ">
              <button
                aria-pressed={view === "overview"}
                onClick={() => setView("overview")}
              >
                <TrendingUp size={15} />
                Tiến độ học
              </button>
              <button
                aria-pressed={view === "prediction"}
                onClick={() => setView("prediction")}
              >
                <Target size={15} />
                Dự đoán JLPT
              </button>
            </nav>
          </div>
          <ShibaMascot
            pose={view === "prediction" ? "thinking" : "flag"}
            size={190}
            animated={false}
          />
        </section>
        <div className="progress-kpis">
          <div>
            <Flame />
            <span>CHUỖI NGÀY ĐÃ LƯU</span>
            <strong>
              {profile.streak || 0}
              <small>ngày</small>
            </strong>
          </div>
          <div>
            <Calendar />
            <span>HỌC TRONG {range} NGÀY QUA</span>
            <strong>
              {learnedDays}
              <small>ngày</small>
            </strong>
          </div>
          <div>
            <Award />
            <span>KINH NGHIỆM HÔM NAY</span>
            <strong>
              {Math.max(0, todayXp)}
              <small>XP</small>
            </strong>
          </div>
          <div>
            <Check />
            <span>BÀI KIỂM TRA {level}</span>
            <strong>
              {scoped.length}
              <small>bài đã lưu</small>
            </strong>
          </div>
        </div>
        {view === "overview" ? (
          <>
            <div className="progress-main-grid">
              <section className="progress-panel">
                <div className="progress-section-title">
                  <div>
                    <span>KIẾN THỨC ĐÃ LUYỆN</span>
                    <h2>Nền tảng {level} của bạn</h2>
                  </div>
                  <BookOpen size={20} />
                </div>
                {loading ? (
                  <p className="progress-muted">Đang đối chiếu nội dung học…</p>
                ) : (
                  skills.map((skill) => (
                    <div className="progress-skill" key={skill.name}>
                      <div>
                        <b>{skill.name}</b>
                        <span>
                          {skill.practiced} / {skill.total} mục trong thư viện
                        </span>
                      </div>
                      <div className="progress-track">
                        <i
                          style={{
                            width: `${skill.percent}%`,
                            background: skill.color,
                          }}
                        />
                      </div>
                      <div>
                        <span>{skill.percent}% đã luyện</span>
                        <Link to={skill.href}>
                          Tiếp tục học
                          <ArrowRight size={12} />
                        </Link>
                      </div>
                    </div>
                  ))
                )}
                <p className="progress-footnote">
                  Tỷ lệ theo nội dung hiện có của ứng dụng, không phải danh sách
                  kiến thức chính thức JLPT.
                  {fallback
                    ? " Một số nội dung đang dùng thư viện dự phòng."
                    : ""}{" "}
                  Lưu từ hoặc đánh dấu trang không được tính là đã luyện.
                </p>
              </section>
              <section className="progress-panel">
                <div className="progress-section-title">
                  <div>
                    <span>NHỊP HỌC CỦA BẠN</span>
                    <h2>Những ngày có mặt</h2>
                  </div>
                  <div className="progress-range">
                    {([7, 28] as const).map((n) => (
                      <button
                        key={n}
                        aria-pressed={range === n}
                        onClick={() => setRange(n)}
                      >
                        {n} ngày
                      </button>
                    ))}
                  </div>
                </div>
                <div className="progress-calendar">
                  {calendar.map((d) => (
                    <span
                      key={d.date}
                      className={d.active ? "day-active" : ""}
                      title={`${d.date}: ${d.active ? "Có hoạt động đã lưu" : "Chưa có hoạt động đã lưu"}`}
                      aria-label={`${d.date}: ${d.active ? "đã học" : "chưa ghi nhận"}`}
                    >
                      {Number(d.date.slice(-2))}
                    </span>
                  ))}
                </div>
                <div className="progress-calendar-legend">
                  <i />
                  Ngày có hoạt động đã lưu · theo giờ Việt Nam
                </div>
                <div className="progress-roadmap">
                  <ShibaMascot pose="walking" size={65} animated={false} />
                  <div>
                    <b>
                      {roadmap
                        ? `Lộ trình ${roadmap.targetLevel}`
                        : "Bắt đầu một hành trình"}
                    </b>
                    <p>
                      {roadmap
                        ? `${roadmapCount} / ${roadmap.durationDays} buổi đã hoàn thành`
                        : "Chọn cấp độ và nhịp học phù hợp với bạn."}
                    </p>
                    <Link to="/lo-trinh">
                      Xem lộ trình
                      <ArrowRight size={12} />
                    </Link>
                  </div>
                </div>
              </section>
            </div>
            <section className="progress-panel progress-practice">
              <div className="progress-section-title">
                <div>
                  <span>HIỆU QUẢ LUYỆN TẬP</span>
                  <h2>Không chỉ học nhiều, hãy học chắc.</h2>
                </div>
                <span className="progress-accuracy">
                  {accuracy === null ? "—" : `${accuracy}%`}
                  <small>đúng trong tối đa 10 bài gần nhất của {level}</small>
                </span>
              </div>
              <div className="progress-practice-actions">
                <Link to={`/jlpt/${level}`}>
                  <Target size={20} />
                  <b>Luyện đề {level}</b>
                  <span>Làm bài rồi xem lại lỗi</span>
                  <ArrowRight size={16} />
                </Link>
                <Link to="/shadowing">
                  <BookOpen size={20} />
                  <b>Nghe & Shadowing</b>
                  <span>Luyện với bản chép và câu thật</span>
                  <ArrowRight size={16} />
                </Link>
                <Link to="/so-tay">
                  <RefreshCw size={20} />
                  <b>Ôn sổ lỗi</b>
                  <span>Nhắc lại sau 1, 3 và 7 ngày</span>
                  <ArrowRight size={16} />
                </Link>
              </div>
            </section>
          </>
        ) : (
          <section className="progress-panel progress-prediction">
            <div className="progress-section-title">
              <div>
                <span>THAM KHẢO TỪ ĐỀ LUYỆN</span>
                <h2>Dự đoán điểm {level}</h2>
              </div>
              <Target size={24} />
            </div>
            {projection.ready ? (
              <>
                <div className="progress-score">
                  <strong>
                    {projection.score}
                    <small>/ 180</small>
                  </strong>
                  <div>
                    <b>
                      Khoảng tham khảo: {projection.low}–{projection.high}
                    </b>
                    <p>
                      Từ {projection.examCount} đề khác nhau gần nhất, trong 90
                      ngày.
                    </p>
                  </div>
                </div>
                <div className="progress-score-sections">
                  {projection.sections.map((s) => (
                    <div key={s.name}>
                      <span>{s.name}</span>
                      <strong>
                        {Math.round(s.rate * s.max)}
                        <small> / {s.max}</small>
                      </strong>
                      <div className="progress-track">
                        <i style={{ width: `${s.rate * 100}%` }} />
                      </div>
                      <p>
                        {s.correct} / {s.total} câu đúng · khoảng{" "}
                        {Math.floor(s.low * s.max)}–{Math.ceil(s.high * s.max)}
                      </p>
                    </div>
                  ))}
                </div>
              </>
            ) : (
              <div className="progress-not-enough">
                <ShibaMascot pose="thinking" size={100} animated={false} />
                <div>
                  <h3>Chưa đủ dữ liệu để dự đoán đáng tin cậy.</h3>
                  <p>
                    Đã có {projection.examCount}/3 đề đủ điều kiện. Cần 3 đề
                    khác nhau của {level} trong 90 ngày, làm đủ phần kiến thức,
                    đọc và nghe; ít nhất 40 câu mỗi đề.
                  </p>
                  <Link to={`/jlpt/${level}`}>
                    Làm thêm đề luyện {level}
                    <ArrowRight size={15} />
                  </Link>
                </div>
              </div>
            )}
            <div className="progress-model-note">
              <b>Hiểu đúng con số này</b>
              <p>
                Đây là quy đổi tuyến tính tỷ lệ đúng của đề luyện theo thang
                180, không phải mô hình đã hiệu chuẩn dự đoán điểm thi thật.
                Khoảng tham khảo dùng độ bất định của tỷ lệ đúng; không bao gồm
                khác biệt độ khó giữa đề và kỳ thi. Điểm JLPT chính thức được
                chuẩn hóa, không tính trực tiếp bằng số câu đúng. Ứng dụng không
                đưa ra xác suất đỗ từ XP hay số bài đã học.
              </p>
              <a
                href="https://www.jlpt.jp/e/guideline/results.html"
                target="_blank"
                rel="noreferrer"
              >
                Cách tính điểm chính thức của JLPT ↗
              </a>
            </div>
          </section>
        )}
        <div className="progress-bottom-grid">
          <section className="progress-panel">
            <div className="progress-section-title">
              <div>
                <span>KẾT QUẢ ĐÃ LƯU</span>
                <h2>Lịch sử luyện tập</h2>
              </div>
            </div>
            {history.length ? (
              history
                .slice(-6)
                .reverse()
                .map((t, i) => (
                  <div className="progress-history" key={`${t.date}-${i}`}>
                    <span>
                      {t.date}
                      <small>
                        {t.level || "Chưa ghi cấp độ"} ·{" "}
                        {t.fullExam ? "Đủ phần" : "Bài luyện"}
                      </small>
                    </span>
                    <div>
                      <strong>
                        {t.score}/{t.total}
                      </strong>
                      <small>
                        {Math.round((t.score / t.total) * 100)}% đúng
                      </small>
                    </div>
                  </div>
                ))
            ) : (
              <p className="progress-muted">
                Chưa có bài kiểm tra được lưu. Kết quả sẽ xuất hiện khi bạn hoàn
                thành và nộp bài.
              </p>
            )}
            <p className="progress-footnote">
              Kết quả cũ thiếu cấp độ hoặc thông tin từng phần vẫn được giữ
              trong lịch sử; không dùng để dự đoán điểm.
            </p>
          </section>
          <section className="progress-panel">
            <div className="progress-section-title">
              <div>
                <span>BỘ SƯU TẬP SHIBA</span>
                <h2>{earned.size} / 100 dấu ấn</h2>
              </div>
              <button onClick={() => onNavigateTab?.("achievements")}>
                Xem tất cả
                <ArrowRight size={13} />
              </button>
            </div>
            <div className="progress-badges">
              {badges.map((b) => (
                <button
                  key={b.id}
                  aria-label={b.title}
                  title={b.title}
                  onClick={() => onNavigateTab?.("achievements")}
                >
                  <AchievementMascotIcon
                    type={b.character}
                    badgeNumber={b.number}
                    poseIndex={b.poseIndex}
                    tier={b.tier}
                    isUnlocked={true}
                    size={64}
                  />
                </button>
              ))}
            </div>
            <p className="progress-muted">
              Mỗi huy hiệu là một mục tiêu cụ thể. Shiba có những tư thế và huy
              chương riêng cho từng chặng.
            </p>
            <Link className="progress-big-link" to="/thanh-tich">
              Khám phá bộ huy hiệu mới
              <ArrowRight size={14} />
            </Link>
          </section>
        </div>
      </div>
    </div>
  );
}
