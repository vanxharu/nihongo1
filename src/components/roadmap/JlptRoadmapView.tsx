import React, { useEffect, useMemo, useRef, useState } from "react";
import RoadmapClassroom from "./RoadmapClassroom";
import { dailyExercises } from "../../data/roadmapExercises";
import {
  ArrowRight,
  BookOpen,
  Check,
  Clock3,
  Flag,
  Map,
  Settings2,
  X,
} from "lucide-react";
import type { JLPTLevel, StudyRoadmapConfig, UserProfile } from "../../types";
import { useAuth } from "../../contexts/AuthContext";
import ShibaMascot from "../mascot/ShibaMascot";
import {
  completeRoadmapDay,
  GUEST_ROADMAP_KEY,
  readGuestRoadmap,
  JLPT_JOURNEYS,
  normalizedRoadmap,
  ROADMAP_LEVELS,
  roadmapDay,
} from "../../data/jlptRoadmap";
import "./roadmap.css";
import JourneyTrail from "./JourneyTrail";
import { showLearningFeedback } from "../../utils/learningMotion";

interface JlptRoadmapViewProps {
  userProfile: UserProfile;
  updateProfile: (updated: Partial<UserProfile>) => void | Promise<void>;
  onEarnXp?: (amount: number, reason: string) => void;
}
const today = () =>
  new Intl.DateTimeFormat("en-CA", {
    timeZone: "Asia/Ho_Chi_Minh",
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  }).format(new Date());


export default function JlptRoadmapView({
  userProfile,
  updateProfile,
}: JlptRoadmapViewProps) {
  const { user } = useAuth();
  const [guestPlan, setGuestPlan] = useState(readGuestRoadmap);
  const saved = user ? userProfile.studyRoadmap : guestPlan;
  const activeLevel = saved?.targetLevel || userProfile.targetLevel || "N5";
  const [level, setLevel] = useState<JLPTLevel>(activeLevel);
  const accountPlan = `${user?.uid || "guest"}:${activeLevel}`;
  useEffect(() => {
    setLevel(activeLevel);
    setSelectedDay(normalizedRoadmap(saved, activeLevel, today()).currentDay);
  }, [accountPlan]);
  const plan = normalizedRoadmap(saved, level, today());
  const preview = level !== activeLevel;
  const [selectedDay, setSelectedDay] = useState(plan.currentDay);
  const selected = roadmapDay(level, plan.durationDays, selectedDay);
  const exerciseCount = useMemo(() => dailyExercises(level, selected.day).length, [level, selected.day]);

  const [settings, setSettings] = useState(false);
  const [duration, setDuration] = useState<30 | 60 | 90>(plan.durationDays);
  const [resetAccepted, setResetAccepted] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [celebrate, setCelebrate] = useState(false);
  const dialogRef = useRef<HTMLDivElement>(null);

  const classroomRef = useRef<HTMLDivElement>(null);
  const [assessmentDay, setAssessmentDay] = useState("");
  const journey = JLPT_JOURNEYS[level];
  const complete = plan.completedDays.includes(selected.day);
  const checked = complete
    ? selected.tasks.map((t) => t.id)
    : plan.dailyTasks?.[String(selected.day)] || [];
  const assessmentKey = `${level}-${plan.durationDays}-${selected.day}`;
  const allChecked = assessmentDay === assessmentKey;
  const progress = Math.round(
    (plan.completedDays.length / plan.durationDays) * 100,
  );
  const needsReset =
    !!saved?.completedDays.length &&
    (level !== saved.targetLevel || duration !== saved.durationDays);

  useEffect(() => {
    if (!settings) return;
    const previous = document.activeElement as HTMLElement | null;
    dialogRef.current?.querySelector<HTMLButtonElement>("button")?.focus();
    return () => previous?.focus();
  }, [settings]);

  const persist = async (next: StudyRoadmapConfig, finish = false) => {
    setSaving(true);
    setError("");
    try {
      if (user) {
        const fields: Partial<UserProfile> = {
          studyRoadmap: next,
          targetLevel: next.targetLevel,
        };
        if (finish) {
          fields.completedLessons = [
            ...new Set([
              ...(userProfile.completedLessons || []),
              `roadmap_${next.targetLevel.toLowerCase()}_day_${selected.day}`,
            ]),
          ];
          fields.studyDays = [
            ...new Set([...(userProfile.studyDays || []), today()]),
          ];
          fields.lastActiveDate = today();
        }
        // Self-reported study completion is not a test score and does not award test XP.
        await updateProfile(fields);
      } else {
        localStorage.setItem(GUEST_ROADMAP_KEY, JSON.stringify(next));
        setGuestPlan(next);
      }
      return true;
    } catch {
      setError(
        "Chưa lưu được tiến độ. Hãy thử lại; các ngày đã lưu vẫn được giữ nguyên.",
      );
      return false;
    } finally {
      setSaving(false);
    }
  };
  const chooseLevel = (next: JLPTLevel) => {
    const nextPlan = normalizedRoadmap(saved, next, today());
    setLevel(next);
    setSelectedDay(nextPlan.currentDay);
    setCelebrate(false);
    setError("");
  };
  const inspectDay = (day: number) => {
    setSelectedDay(day);

    setCelebrate(false);
  };
  const openSettings = () => {
    setDuration(plan.durationDays);
    setResetAccepted(false);
    setSettings(true);
    setError("");
  };
  const saveSettings = async () => {
    const changed = preview || duration !== plan.durationDays;
    const next = changed
      ? ({
          targetLevel: level,
          durationDays: duration,
          startDate: today(),
          currentDay: 1,
          completedDays: [],
          dailyTasks: {},
          curriculumVersion: 2,
        } as StudyRoadmapConfig)
      : { ...plan, curriculumVersion: 2 };
    if (await persist(next)) {
      setSelectedDay(next.currentDay);

      setSettings(false);
      setCelebrate(false);
    }
  };
  const finishDay = async () => {
    if (complete || !allChecked || saving || preview) return;
    if (await persist(completeRoadmapDay(plan, selected.day), true)) {
      setCelebrate(true);
      showLearningFeedback("milestone");
    }
  };
  const inspectToday = () => {
    inspectDay(plan.currentDay);
    classroomRef.current?.scrollIntoView({
      behavior: window.matchMedia("(prefers-reduced-motion: reduce)").matches
        ? "auto"
        : "smooth",
      block: "start",
    });
  };

  return (
    <div className="jlpt-journey">
      <div className="journey-shell">
        <div className="journey-topline">
          <span>
            <Map size={16} /> NHẬT KÝ HÀNH TRÌNH
          </span>
          <button onClick={openSettings}>
            <Settings2 size={16} /> Điều chỉnh kế hoạch
          </button>
        </div>
        <section className="journey-hero">
          <div className="journey-hero-copy">
            <span className="journey-eyebrow">NIHON SHIBA · JLPT {level}</span>
            <h1>
              Mỗi bước nhỏ.
              <br />
              <em>Một thế giới mới.</em>
            </h1>
            <p>{journey.description}</p>
            <div className="journey-hero-actions">
              <button
                className="journey-primary"
                onClick={preview ? openSettings : inspectToday}
              >
                {preview
                  ? `Chọn lộ trình ${level}`
                  : progress === 100
                    ? "Xem lại hành trình"
                    : "Tiếp tục hành trình"}
                <ArrowRight size={18} />
              </button>
              <span>{plan.durationDays} ngày học · theo nhịp của bạn</span>
            </div>
          </div>
          <div className="journey-hero-art" aria-hidden="true">
            <span className="journey-orbit orbit-one" />
            <span className="journey-orbit orbit-two" />
            <span className="journey-petal petal-one">✿</span>
            <span className="journey-petal petal-two">✿</span>
            <span className="journey-mountain" />
            <ShibaMascot pose="welcome" size={210} animated={false} />
            <div className="journey-mascot-note">
              一緒に頑張ろう！<small>Cùng nhau cố gắng nhé!</small>
            </div>
          </div>
        </section>

        <nav className="journey-levels" aria-label="Chọn cấp độ lộ trình">
          {ROADMAP_LEVELS.map((item, index) => (
            <button
              key={item}
              aria-pressed={level === item}
              onClick={() => chooseLevel(item)}
            >
              <span>{item}</span>
              <small>
                {
                  ["Khởi đầu", "Đời sống", "Kết nối", "Mở rộng", "Chuyên sâu"][
                    index
                  ]
                }
              </small>
              {level === item && <span className="journey-level-dot" />}
            </button>
          ))}
        </nav>
        <div className="journey-level-heading">
          <div>
            <h2>{journey.title}</h2>
            <p>{journey.japanese}</p>
          </div>
          <span className="journey-status">
            {preview ? "Đang xem trước" : "Lộ trình của bạn"}
          </span>
        </div>
        <p className="journey-prerequisite">
          <BookOpen size={17} />
          <span>
            {journey.prerequisite} Kế hoạch 30／60／90 ngày là nhịp gợi ý, có
            thể lặp lại ngày khó.
          </span>
        </p>
        {error && (
          <p role="alert" className="journey-error">
            {error}
          </p>
        )}
        <JourneyTrail
          level={level}
          plan={plan}
          selectedDay={selected.day}
          celebrate={celebrate}
          onSelect={inspectDay}
          onPractice={(day) => {
            inspectDay(day);
            classroomRef.current?.scrollIntoView({
              behavior: window.matchMedia("(prefers-reduced-motion: reduce)")
                .matches
                ? "auto"
                : "smooth",
              block: "start",
            });
          }}
        />

        <div className="journey-metrics">
          <div>
            <span>HÀNH TRÌNH ĐÃ ĐI</span>
            <strong>
              {progress}
              <small>%</small>
            </strong>
            <div
              role="progressbar"
              aria-label="Tiến độ lộ trình"
              aria-valuenow={progress}
              aria-valuemin={0}
              aria-valuemax={100}
              className="journey-progress"
            >
              <i style={{ width: `${progress}%` }} />
            </div>
            <p>
              {plan.completedDays.length} / {plan.durationDays} ngày hoàn thành
            </p>
          </div>
          <div>
            <span>BỘ BÀI TẬP HÔM NAY</span>
            <strong>
              {exerciseCount}
              <small>câu</small>
            </strong>
            <p>Bài tập tổng hợp · chữa lỗi sau khi nộp</p>
            <Clock3 className="metric-watermark" />
          </div>
          <div>
            <span>ĐIỂM ĐẾN TIẾP THEO</span>
            <strong className="journey-next-stage">
              {progress === 100
                ? "Hành trình trọn vẹn"
                : JLPT_JOURNEYS[level].stages[
                    roadmapDay(level, plan.durationDays, plan.currentDay).index
                  ].name}
            </strong>
            <p>
              {progress === 100
                ? "Ôn lại các phần còn chưa chắc"
                : `Ngày ${plan.currentDay} · tiếp tục từ nơi bạn đã dừng`}
            </p>
            <Flag className="metric-watermark" />
          </div>
        </div>

        <div ref={classroomRef} style={{ scrollMarginTop: 90 }}>
          <RoadmapClassroom key={assessmentKey} level={level} day={selected.day} storageKey={`${accountPlan}:${plan.durationDays}`} onComplete={() => {
            setAssessmentDay(assessmentKey);
            if (!preview && !complete && !saving && !checked.includes("review")) void persist({ ...plan, dailyTasks: { ...plan.dailyTasks, [String(selected.day)]: ["review"] } });
          }} />
          <div className="exercise-day-actions">
            <button className="journey-primary" disabled={saving || complete || !allChecked || preview} onClick={finishDay}>
              {complete ? "Đã hoàn thành ngày này" : saving ? "Đang lưu…" : "Hoàn thành ngày luyện tập"}
            </button>
            {celebrate && <p role="status">Tiến độ đã được lưu. <button onClick={inspectToday}>Đến ngày tiếp theo <ArrowRight size={14}/></button></p>}
            <p>{preview ? "Chọn lộ trình này để lưu tiến độ." : "Nộp bài để xem kết quả và mở nút hoàn thành ngày."}</p>
          </div>
        </div>
        <footer className="journey-footer">
          Bài tập luyện theo cấu trúc JLPT, không gắn nhãn đề thi chính thức.{" "}
          <a
            href="https://www.jlpt.jp/e/guideline/testsections.html"
            target="_blank"
            rel="noreferrer"
          >
            Tham khảo các dạng bài chính thức JLPT ↗
          </a>
        </footer>
      </div>

      {settings && (
        <div
          className="journey-modal-backdrop"
          onClick={(e) => {
            if (e.target === e.currentTarget && !saving) setSettings(false);
          }}
        >
          <div
            className="journey-modal"
            role="dialog"
            aria-modal="true"
            aria-labelledby="journey-settings-title"
            ref={dialogRef}
            onKeyDown={(e) => {
              if (e.key === "Escape" && !saving) setSettings(false);
              if (e.key === "Tab") {
                const items = Array.from(
                  dialogRef.current?.querySelectorAll<HTMLElement>(
                    "button:not(:disabled), input:not(:disabled), a[href]",
                  ) || [],
                );
                const first = items[0],
                  last = items[items.length - 1];
                if (e.shiftKey && document.activeElement === first) {
                  e.preventDefault();
                  last?.focus();
                }
                if (!e.shiftKey && document.activeElement === last) {
                  e.preventDefault();
                  first?.focus();
                }
              }
            }}
          >
            <button
              className="journey-modal-close"
              aria-label="Đóng điều chỉnh kế hoạch"
              disabled={saving}
              onClick={() => setSettings(false)}
            >
              <X size={20} />
            </button>
            <span className="journey-eyebrow">HỌC THEO NHỊP CỦA BẠN</span>
            <h2 id="journey-settings-title">Kế hoạch {level}</h2>
            <p>
              Cùng nội dung, ba nhịp học. Mỗi ngày có thể kéo dài hơn nếu bạn
              cần ôn thêm.
            </p>
            <div className="journey-duration-options">
              {([30, 60, 90] as const).map((value) => (
                <button
                  key={value}
                  aria-pressed={duration === value}
                  onClick={() => setDuration(value)}
                >
                  <strong>
                    {value}
                    <small>ngày</small>
                  </strong>
                  <span>
                    {value === 30
                      ? "Tập trung · ~75 phút"
                      : value === 60
                        ? "Cân bằng · ~50 phút"
                        : "Nhẹ nhàng · ~35 phút"}
                  </span>
                  {duration === value && <Check size={16} />}
                </button>
              ))}
            </div>
            <p className="journey-settings-info">
              Đang chọn cấp {level}. Đổi cấp hoặc nhịp học sẽ bắt đầu kế hoạch
              mới; giữ nguyên hai lựa chọn sẽ giữ tiến độ hiện tại.
            </p>
            {needsReset && (
              <label className="journey-reset-warning">
                <input
                  type="checkbox"
                  checked={resetAccepted}
                  onChange={(e) => setResetAccepted(e.target.checked)}
                />{" "}
                Tôi muốn bắt đầu kế hoạch mới và thay thế tiến độ lộ trình cũ.
              </label>
            )}
            {error && (
              <p role="alert" className="journey-error">
                {error}
              </p>
            )}
            <button
              className="journey-primary"
              disabled={saving || (needsReset && !resetAccepted)}
              onClick={saveSettings}
            >
              {saving ? "Đang lưu…" : "Áp dụng kế hoạch"}
              <ArrowRight size={16} />
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
