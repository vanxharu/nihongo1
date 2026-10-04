import React from "react";
import {
  BookOpen,
  Compass,
  Flag,
  Headphones,
  Sparkles,
  Trophy,
  ArrowRight,
  Check,
  ChevronLeft,
  ChevronRight,
} from "lucide-react";
import ShibaMascot from "../mascot/ShibaMascot";
import { roadmapDay } from "../../data/jlptRoadmap";
import type { JLPTLevel, StudyRoadmapConfig } from "../../types";
import "./journeyTrail.css";

const positions = [25, 70, 32, 72, 28, 65, 40];
const icons = [BookOpen, Compass, Headphones, Sparkles, Flag];
const poses = [
  "study",
  "adventure",
  "listening",
  "thinking",
  "encourage",
  "trophy",
] as const;
export default function JourneyTrail({
  level,
  plan,
  selectedDay,
  celebrate,
  onSelect,
  onPractice,
}: {
  level: JLPTLevel;
  plan: StudyRoadmapConfig;
  selectedDay: number;
  celebrate: boolean;
  onSelect: (day: number) => void;
  onPractice: (day: number) => void;
}) {
  const week = Math.floor((selectedDay - 1) / 7);
  const first = week * 7 + 1;
  const last = Math.min(first + 6, plan.durationDays);
  const days = Array.from({ length: last - first + 1 }, (_, i) =>
    roadmapDay(level, plan.durationDays, first + i),
  );
  const selected = roadmapDay(level, plan.durationDays, selectedDay);
  const height = days.length * 145 + 120;
  const points = days.map((_, i) => [positions[i], 110 + i * 145]);
  const index = selectedDay - first;
  return (
    <section
      className={`journey-trail trail-daily-map ${celebrate ? "trail-celebrating" : ""}`}
      aria-label={`Bản đồ từng ngày ${level}`}
    >
      <header className="trail-heading">
        <div>
          <span>MỖI NGÀY · MỘT BƯỚC TIẾN</span>
          <h2>
            Hành trình {plan.durationDays} ngày đến {level}
          </h2>
          <p>Mỗi điểm dừng là một ngày học cùng Shiba.</p>
        </div>
        <span className="trail-passport">
          <Compass size={18} />
          {plan.completedDays.length}/{plan.durationDays} ngày
        </span>
      </header>
      <nav className="trail-week-nav" aria-label="Chọn tuần học">
        <button
          aria-label="Tuần trước"
          disabled={first === 1}
          onClick={() => onSelect(Math.max(1, first - 7))}
        >
          <ChevronLeft size={18} />
        </button>
        <label>
          Tuần{" "}
          <select
            aria-label="Tuần trên bản đồ"
            value={week}
            onChange={(event) => onSelect(Number(event.target.value) * 7 + 1)}
          >
            {Array.from(
              { length: Math.ceil(plan.durationDays / 7) },
              (_, i) => (
                <option key={i} value={i}>
                  {i + 1} · Ngày {i * 7 + 1}–
                  {Math.min(i * 7 + 7, plan.durationDays)}
                </option>
              ),
            )}
          </select>
        </label>
        <button
          aria-label="Tuần sau"
          disabled={last === plan.durationDays}
          onClick={() => onSelect(last + 1)}
        >
          <ChevronRight size={18} />
        </button>
        <button
          className="trail-today"
          onClick={() => onSelect(plan.currentDay)}
        >
          Ngày đang học <Flag size={13} />
        </button>
      </nav>
      <div className="trail-layout">
        <div className="trail-landscape" style={{ height }}>
          <div className="trail-cloud cloud-one" aria-hidden="true" />
          <div className="trail-cloud cloud-two" aria-hidden="true" />
          <div className="trail-mountain mountain-one" aria-hidden="true" />
          <div className="trail-mountain mountain-two" aria-hidden="true" />
          <svg
            className="trail-road"
            viewBox={`0 0 700 ${height}`}
            preserveAspectRatio="none"
            aria-hidden="true"
          >
            {points.slice(0, -1).map(([x, y], i) => {
              const [nx, ny] = points[i + 1];
              const mid = (y + ny) / 2;
              const path = `M ${x * 7} ${y} C ${x * 7} ${mid}, ${nx * 7} ${mid}, ${nx * 7} ${ny}`;
              return (
                <g key={i}>
                  <path className="trail-road-shadow" d={path} />
                  <path className="trail-road-base" d={path} />
                  <path
                    className={`trail-road-dots ${plan.completedDays.includes(days[i].day) ? "road-traveled" : ""}`}
                    d={path}
                  />
                </g>
              );
            })}
          </svg>
          {[0, 1, 2, 3, 4, 5, 6, 7].map((i) => (
            <span
              key={i}
              className={`trail-scenery scenery-${i}`}
              aria-hidden="true"
            >
              {i % 3 === 0 ? "✿" : i % 3 === 1 ? "✦" : "♧"}
            </span>
          ))}
          {days.map((day, i) => {
            const done = plan.completedDays.includes(day.day);
            const Icon = day.checkpoint
              ? Trophy
              : icons[(day.day - 1) % icons.length];
            return (
              <button
                key={`${level}-${day.day}`}
                className={`trail-stop ${done ? "stop-complete" : ""} ${day.day === plan.currentDay ? "stop-current" : ""} ${day.day === selectedDay ? "stop-selected" : ""}`}
                style={
                  {
                    left: `${points[i][0]}%`,
                    top: points[i][1],
                    "--stop-delay": `${i * 60}ms`,
                  } as React.CSSProperties
                }
                aria-label={`Ngày ${day.day}: ${day.chapter.name}, ${done ? "đã hoàn thành" : day.checkpoint ? "kiểm tra cuối chặng" : "chưa hoàn thành"}`}
                aria-pressed={day.day === selectedDay}
                onClick={() => onSelect(day.day)}
              >
                <span className="trail-stop-orbit" />
                <span className="trail-stop-medal">
                  {done ? <Check size={30} /> : <Icon size={30} />}
                  <small>{day.day}</small>
                </span>
                <span className="trail-stop-label">
                  <b>Ngày {day.day}</b>
                  <small>
                    {day.checkpoint
                      ? "Mốc kiểm tra"
                      : `${day.minutes} phút · 5 hoạt động`}
                  </small>
                  <span>
                    {done
                      ? "Đã hoàn thành"
                      : day.day === plan.currentDay
                        ? "Bạn đang ở đây"
                        : `Chặng ${day.index + 1}`}
                  </span>
                </span>
              </button>
            );
          })}
          <div
            className="trail-traveler"
            aria-hidden="true"
            style={{
              left: `${points[index][0] + (index % 2 === 0 ? 19 : -20)}%`,
              top: points[index][1] - 35,
            }}
          >
            <ShibaMascot
              pose={celebrate ? "celebration" : poses[selected.index]}
              size={78}
              animated={false}
            />
            <span>いっしょに！</span>
          </div>
          <div className="trail-finish" aria-hidden="true">
            ✿{" "}
            <b>
              Ngày {first}–{last}
            </b>{" "}
            ✿
          </div>
        </div>
        <aside
          className="trail-preview"
          aria-label="Ngày đang khám phá"
          key={`${level}-${selectedDay}`}
        >
          <div className="trail-preview-mascot">
            <ShibaMascot pose={poses[selected.index]} size={110} animated />
          </div>
          <span className="trail-kicker">
            CHẶNG {selected.index + 1} · {selected.minutes} PHÚT
          </span>
          <h3>Ngày {selectedDay}</h3>
          <p>{selected.chapter.name}</p>
          <div className="trail-preview-goal">
            <Flag size={18} />
            <p>
              {selected.checkpoint
                ? selected.chapter.checkpoint
                : selected.chapter.outcome}
            </p>
          </div>
          <ol className="trail-day-tasks">
            {selected.tasks.map((task) => (
              <li key={task.id}>
                <b>{task.label}</b>
                <span>{task.text}</span>
                <small>{task.minutes} phút</small>
              </li>
            ))}
          </ol>
          <button
            className="journey-primary"
            onClick={() => onPractice(selectedDay)}
          >
            {plan.completedDays.includes(selectedDay) ? "Ôn lại" : "Học"} ngày{" "}
            {selectedDay}
            <ArrowRight size={16} />
          </button>
          <small>
            Ngày đã học được giữ lại. Bạn có thể chọn bất kỳ ngày nào để học
            hoặc ôn.
          </small>
        </aside>
      </div>
    </section>
  );
}
