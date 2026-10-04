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
} from "lucide-react";
import ShibaMascot from "../mascot/ShibaMascot";
import { JLPT_JOURNEYS, stageRange, roadmapDay } from "../../data/jlptRoadmap";
import type { JLPTLevel, StudyRoadmapConfig } from "../../types";
import "./journeyTrail.css";

const stops = [
  [25, 12],
  [70, 27],
  [32, 42],
  [72, 57],
  [28, 72],
  [65, 87],
];
const icons = [BookOpen, Compass, Headphones, Sparkles, Flag, Trophy];
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
  selectedStage,
  celebrate,
  onSelect,
  onPractice,
}: {
  level: JLPTLevel;
  plan: StudyRoadmapConfig;
  selectedStage: number;
  celebrate: boolean;
  onSelect: (day: number) => void;
  onPractice: (day: number) => void;
}) {
  const journey = JLPT_JOURNEYS[level];
  const current = roadmapDay(level, plan.durationDays, plan.currentDay).index;
  const selected = journey.stages[selectedStage];
  const range = stageRange(selectedStage, plan.durationDays);
  const next =
    Array.from(
      { length: range.end - range.start + 1 },
      (_, i) => range.start + i,
    ).find((day) => !plan.completedDays.includes(day)) || range.start;
  return (
    <section
      className={`journey-trail ${celebrate ? "trail-celebrating" : ""}`}
      aria-label={`Bản đồ hành trình ${level}`}
    >
      <header className="trail-heading">
        <div>
          <span>KHÁM PHÁ · LUYỆN TẬP · CHINH PHỤC</span>
          <h2>Đi cùng Shiba đến {level}</h2>
          <p>Mỗi chặng là một miền kiến thức mới.</p>
        </div>
        <span className="trail-passport">
          <Compass size={18} /> {plan.completedDays.length}/{plan.durationDays}{" "}
          buổi
        </span>
      </header>
      <div className="trail-layout">
        <div className="trail-landscape">
          <div className="trail-cloud cloud-one" aria-hidden="true" />
          <div className="trail-cloud cloud-two" aria-hidden="true" />
          <div className="trail-mountain mountain-one" aria-hidden="true" />
          <div className="trail-mountain mountain-two" aria-hidden="true" />
          <svg
            className="trail-road"
            viewBox="0 0 700 900"
            preserveAspectRatio="none"
            aria-hidden="true"
          >
            {stops.slice(0, -1).map(([x, y], i) => {
              const [nx, ny] = stops[i + 1];
              const mid = (y + ny) * 4.5;
              const path = `M ${x * 7} ${y * 9} C ${x * 7} ${mid}, ${nx * 7} ${mid}, ${nx * 7} ${ny * 9}`;
              return (
                <g key={i}>
                  <path className="trail-road-shadow" d={path} />
                  <path className="trail-road-base" d={path} />
                  <path
                    className={`trail-road-dots ${i < current ? "road-traveled" : ""}`}
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
          {journey.stages.map((stage, i) => {
            const stageDays = stageRange(i, plan.durationDays);
            const count = plan.completedDays.filter(
              (day) => day >= stageDays.start && day <= stageDays.end,
            ).length;
            const done = count === stageDays.end - stageDays.start + 1;
            const Icon = icons[i];
            return (
              <button
                key={`${level}-${i}`}
                className={`trail-stop ${done ? "stop-complete" : ""} ${i === current ? "stop-current" : ""} ${i === selectedStage ? "stop-selected" : ""}`}
                style={
                  {
                    left: `${stops[i][0]}%`,
                    top: `${stops[i][1]}%`,
                    "--stop-delay": `${i * 70}ms`,
                  } as React.CSSProperties
                }
                aria-label={`Chặng ${i + 1}: ${stage.name}, ${count}/${stageDays.end - stageDays.start + 1} buổi hoàn thành`}
                aria-pressed={i === selectedStage}
                onClick={() =>
                  onSelect(
                    Array.from(
                      { length: stageDays.end - stageDays.start + 1 },
                      (_, j) => stageDays.start + j,
                    ).find((day) => !plan.completedDays.includes(day)) ||
                      stageDays.start,
                  )
                }
              >
                <span className="trail-stop-orbit" />
                <span className="trail-stop-medal">
                  {done ? <Check size={30} /> : <Icon size={30} />}
                  <small>{i + 1}</small>
                </span>
                <span className="trail-stop-label">
                  <b>{stage.name}</b>
                  <small>
                    Buổi {stageDays.start}–{stageDays.end}
                  </small>
                  <span>
                    {done
                      ? "Đã chinh phục"
                      : i === current
                        ? "Bạn đang ở đây"
                        : `${count}/${stageDays.end - stageDays.start + 1} buổi`}
                  </span>
                </span>
              </button>
            );
          })}
          <div
            className="trail-traveler"
            aria-hidden="true"
            style={{
              left: `${stops[selectedStage][0] + (selectedStage % 2 === 0 ? 19 : -20)}%`,
              top: `${stops[selectedStage][1] - 4}%`,
            }}
          >
            <ShibaMascot
              pose={celebrate ? "celebration" : poses[selectedStage]}
              size={78}
              animated={false}
            />
            <span>いっしょに！</span>
          </div>
          <div className="trail-finish" aria-hidden="true">
            ✿ <b>{level}</b> ✿
          </div>
        </div>
        <aside
          className="trail-preview"
          aria-label="Chặng đang khám phá"
          key={`${level}-${selectedStage}`}
        >
          <div className="trail-preview-mascot">
            <ShibaMascot
              pose={poses[selectedStage]}
              size={110}
              animated={true}
            />
          </div>
          <span className="trail-kicker">CHẶNG {selectedStage + 1} / 6</span>
          <h3>{selected.name}</h3>
          <p>{selected.subtitle}</p>
          <div className="trail-preview-goal">
            <Flag size={18} />
            <p>{selected.outcome}</p>
          </div>
          <div className="trail-preview-topics">
            {selected.grammar.map((topic) => (
              <span key={topic}>{topic}</span>
            ))}
          </div>
          <button className="journey-primary" onClick={() => onPractice(next)}>
            Đến buổi {next}
            <ArrowRight size={16} />
          </button>
          <small>
            Bạn có thể khám phá mọi chặng và quay lại ôn bất cứ lúc nào.
          </small>
        </aside>
      </div>
    </section>
  );
}
