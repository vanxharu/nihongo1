import React, { useEffect, useRef, useState } from "react";
import { Link } from "react-router-dom";
import {
  ArrowRight,
  BookOpen,
  Check,
  ChevronDown,
  ChevronLeft,
  ChevronRight,
  Clock3,
  Flag,
  Headphones,
  Map,
  Settings2,
  Sparkles,
  Target,
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
  stageRange,
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
const taskIcons = [BookOpen, Sparkles, BookOpen, Headphones, Target];

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
  const [openStage, setOpenStage] = useState(selected.index);
  const [settings, setSettings] = useState(false);
  const [duration, setDuration] = useState<30 | 60 | 90>(plan.durationDays);
  const [resetAccepted, setResetAccepted] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [celebrate, setCelebrate] = useState(false);
  const dialogRef = useRef<HTMLDivElement>(null);
  const dailyRef = useRef<HTMLElement>(null);
  const journey = JLPT_JOURNEYS[level];
  const complete = plan.completedDays.includes(selected.day);
  const checked = complete
    ? selected.tasks.map((t) => t.id)
    : plan.dailyTasks?.[String(selected.day)] || [];
  const allChecked = selected.tasks.every((t) => checked.includes(t.id));
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
    setOpenStage(
      roadmapDay(next, nextPlan.durationDays, nextPlan.currentDay).index,
    );
    setCelebrate(false);
    setError("");
  };
  const inspectDay = (day: number) => {
    setSelectedDay(day);
    setOpenStage(roadmapDay(level, plan.durationDays, day).index);
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
      setOpenStage(roadmapDay(level, duration, next.currentDay).index);
      setSettings(false);
      setCelebrate(false);
    }
  };
  const toggleTask = async (id: string) => {
    const next = checked.includes(id)
      ? checked.filter((t) => t !== id)
      : [...checked, id];
    await persist({
      ...plan,
      dailyTasks: { ...plan.dailyTasks, [String(selected.day)]: next },
      curriculumVersion: 2,
    });
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
    dailyRef.current?.scrollIntoView({
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
            dailyRef.current?.scrollIntoView({
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
            <span>NHỊP HỌC MỖI NGÀY</span>
            <strong>
              {selected.minutes}
              <small>phút</small>
            </strong>
            <p>5 hoạt động · học, luyện, ôn</p>
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

        <div className="journey-workspace">
          <aside
            className="journey-daily"
            ref={dailyRef}
            aria-label="Kế hoạch ngày học"
          >
            <div className="journey-daily-mascot">
              <ShibaMascot
                pose={celebrate ? "celebration" : "studying"}
                size={76}
                animated={false}
              />
              <div>
                <span>SHIBA ĐỒNG HÀNH</span>
                <p>
                  {celebrate
                    ? "Bạn đã tiến thêm một bước!"
                    : complete
                      ? "Ôn lại để nhớ lâu hơn nhé."
                      : "Học chắc từng chút một nhé!"}
                </p>
              </div>
            </div>
            <div className="journey-day-heading">
              <div>
                <span>
                  {selected.checkpoint ? "MỐC KIỂM TRA" : "KẾ HOẠCH NGÀY HỌC"}
                </span>
                <h3>Ngày {selected.day.toString().padStart(2, "0")}</h3>
              </div>
              <div className="journey-day-navigation">
                <button
                  aria-label="Ngày trước"
                  disabled={selected.day === 1}
                  onClick={() => inspectDay(selected.day - 1)}
                >
                  <ChevronLeft size={18} />
                </button>
                <button
                  aria-label="Ngày sau"
                  disabled={selected.day === plan.durationDays}
                  onClick={() => inspectDay(selected.day + 1)}
                >
                  <ChevronRight size={18} />
                </button>
              </div>
            </div>
            <p className="journey-daily-topic">
              Chặng {selected.index + 1} · {selected.chapter.name}
            </p>
            <div className="journey-task-list">
              {selected.tasks.map((task, index) => {
                const Icon = taskIcons[index];
                const done = checked.includes(task.id);
                return (
                  <details
                    className={`journey-task ${done ? "task-done" : ""}`}
                    key={`${selected.day}-${task.id}`}
                    open={index === 0 ? true : undefined}
                  >
                    <summary>
                      <Icon size={17} />
                      <span>
                        <small>
                          {task.label} · {task.minutes} phút
                        </small>
                        <b>{task.text}</b>
                      </span>
                      <ChevronDown size={14} />
                    </summary>
                    <div className="journey-task-body">
                      <p>{task.method}</p>
                      <div>
                        <Link to={task.route}>
                          {task.action}
                          <ArrowRight size={13} />
                        </Link>
                        {task.id === "words" && (
                          <Link to={`/jlpt/${level}/kanji`}>
                            Kanji
                            <ArrowRight size={13} />
                          </Link>
                        )}
                      </div>
                      <label>
                        <input
                          type="checkbox"
                          checked={done}
                          disabled={saving || preview || complete}
                          onChange={() => toggleTask(task.id)}
                        />{" "}
                        Tôi đã học và ôn phần này
                      </label>
                    </div>
                  </details>
                );
              })}
            </div>
            <button
              className="journey-primary journey-finish"
              disabled={saving || complete || !allChecked || preview}
              onClick={finishDay}
            >
              {complete ? (
                <>
                  <Check size={18} /> Đã hoàn thành ngày {selected.day}
                </>
              ) : saving ? (
                "Đang lưu…"
              ) : (
                <>
                  <Flag size={18} /> Hoàn thành ngày học
                </>
              )}
            </button>
            {celebrate && (
              <div role="status" className="journey-celebration">
                よくできました！ Tiến độ của bạn đã được lưu.
                <button onClick={() => inspectDay(plan.currentDay)}>
                  Đến ngày tiếp theo <ArrowRight size={14} />
                </button>
              </div>
            )}
            <p className="journey-save-note">
              {preview
                ? "Chọn lộ trình này để bắt đầu lưu tiến độ."
                : user
                  ? "Checklist được lưu cùng tài khoản của bạn."
                  : "Tiến độ lưu trên trình duyệt này. Đăng nhập để dùng lộ trình đồng bộ tài khoản."}{" "}
              Đánh dấu phản ánh việc bạn tự hoàn thành, không phải điểm kiểm
              tra.
            </p>
          </aside>

          <section
            className="journey-map"
            aria-label="Nội dung toàn bộ lộ trình"
          >
            <div className="journey-section-heading">
              <div>
                <span>6 CHẶNG · MỘT HÀNH TRÌNH</span>
                <h2>Nội dung từng chặng {level}</h2>
              </div>
              <button onClick={inspectToday}>
                Về ngày đang học
                <ArrowRight size={14} />
              </button>
            </div>
            <div className="journey-stages">
              {journey.stages.map((chapter, index) => {
                const range = stageRange(index, plan.durationDays);
                const doneCount = plan.completedDays.filter(
                  (d) => d >= range.start && d <= range.end,
                ).length;
                const finished = doneCount === range.end - range.start + 1;
                const expanded = index === openStage;
                return (
                  <article
                    key={chapter.name}
                    className={`journey-stage ${expanded ? "stage-expanded" : ""} ${finished ? "stage-finished" : ""}`}
                  >
                    <span className="journey-stage-node">
                      {finished ? (
                        <Check size={20} />
                      ) : (
                        String(index + 1).padStart(2, "0")
                      )}
                    </span>
                    <button
                      className="journey-stage-toggle"
                      aria-expanded={expanded}
                      aria-controls={`stage-content-${index}`}
                      onClick={() => setOpenStage(expanded ? -1 : index)}
                    >
                      <div>
                        <span>
                          NGÀY {range.start}–{range.end}{" "}
                          <i>
                            {finished
                              ? "Đã hoàn thành"
                              : `${doneCount}/${range.end - range.start + 1} ngày`}
                          </i>
                        </span>
                        <h3>{chapter.name}</h3>
                        <p>{chapter.subtitle}</p>
                      </div>
                      <ChevronDown size={20} />
                    </button>
                    {expanded && (
                      <div
                        id={`stage-content-${index}`}
                        className="journey-stage-body"
                      >
                        <div className="journey-outcome">
                          <Target size={18} />
                          <p>
                            <b>Sau chặng này</b>
                            {chapter.outcome}
                          </p>
                        </div>
                        <div className="journey-curriculum">
                          {[
                            { name: "Từ vựng & Kanji", items: chapter.words },
                            {
                              name: "Ngữ pháp trọng tâm",
                              items: chapter.grammar,
                            },
                            { name: "Đọc hiểu", items: chapter.reading },
                            { name: "Nghe hiểu", items: chapter.listening },
                          ].map((group) => (
                            <div key={group.name}>
                              <h4>{group.name}</h4>
                              <ul>
                                {group.items.map((text) => (
                                  <li key={text}>{text}</li>
                                ))}
                              </ul>
                            </div>
                          ))}
                        </div>
                        <div className="journey-checkpoint">
                          <Flag size={17} />
                          <p>
                            <b>Kiểm tra cuối chặng</b>
                            {chapter.checkpoint}
                          </p>
                        </div>
                        <div
                          className="journey-day-chips"
                          aria-label={`Ngày học chặng ${index + 1}`}
                        >
                          {Array.from(
                            { length: range.end - range.start + 1 },
                            (_, j) => range.start + j,
                          ).map((day) => (
                            <button
                              key={day}
                              aria-label={`Xem ngày ${day}${plan.completedDays.includes(day) ? ", đã hoàn thành" : ""}`}
                              aria-pressed={selected.day === day}
                              className={
                                plan.completedDays.includes(day)
                                  ? "chip-complete"
                                  : ""
                              }
                              onClick={() => {
                                inspectDay(day);
                                dailyRef.current?.scrollIntoView({
                                  behavior: "smooth",
                                  block: "start",
                                });
                              }}
                            >
                              {plan.completedDays.includes(day) && (
                                <Check size={11} />
                              )}
                              {day}
                            </button>
                          ))}
                        </div>
                      </div>
                    )}
                  </article>
                );
              })}
            </div>
            <div className="journey-destination">
              <ShibaMascot pose="flag" size={100} animated={false} />
              <div>
                <span>ĐÍCH ĐẾN KHÔNG CHỈ LÀ MỘT TẤM BẰNG</span>
                <h3>Tiếng Nhật trở thành một phần của bạn.</h3>
                <p>
                  Hoàn thành, nhìn lại, rồi tiếp tục. Shiba luôn đi cùng bạn.
                </p>
              </div>
            </div>
          </section>
        </div>
        <section className="journey-routine">
          <div>
            <span>HỌC ĐỀU · NHỚ SÂU</span>
            <h2>Một nhịp học dễ duy trì</h2>
          </div>
          <div>
            <b>01 · Gợi nhớ</b>
            <p>Ôn lỗi cũ trước. Nhắc lại sau 1, 3 và 7 ngày.</p>
          </div>
          <div>
            <b>02 · Đưa vào ngữ cảnh</b>
            <p>Đặt câu, đọc đoạn và nghe câu thật chứa kiến thức mới.</p>
          </div>
          <div>
            <b>03 · Nhìn lại</b>
            <p>Cuối mỗi chặng, kiểm tra rồi dành thời gian chữa lỗi.</p>
          </div>
        </section>
        <footer className="journey-footer">
          Nội dung do NihonGo! biên soạn theo mục tiêu năng lực từng cấp.{" "}
          <a
            href="https://www.jlpt.jp/e/about/levelsummary.html"
            target="_blank"
            rel="noreferrer"
          >
            Tham khảo mô tả chính thức JLPT ↗
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
