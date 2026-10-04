import React, { useMemo, useState, useEffect, useRef } from "react";
import { ArrowLeft, Search, X, Lock, Check, ArrowRight } from "lucide-react";
import type { UserProfile } from "../../types";
import {
  ACHIEVEMENTS_LIST,
  achievementMetrics,
  calculateUnlockedAchievements,
  AchievementItem,
} from "../../data/achievementsData";
import { AchievementMascotIcon } from "./AchievementMascotIcon";
import ShibaMascot from "../mascot/ShibaMascot";
import "./achievements.css";
import { readGuestRoadmap } from "../../data/jlptRoadmap";
interface Props {
  userProfile: UserProfile;
  onBack: () => void;
}
export const AchievementsView: React.FC<Props> = ({ userProfile, onBack }) => {
  const [category, setCategory] = useState("all");
  const [status, setStatus] = useState("all");
  const [search, setSearch] = useState("");
  const [selected, setSelected] = useState<AchievementItem | null>(null);
  const dialog = useRef<HTMLDivElement>(null);
  const guestPlan = !userProfile.uid ? readGuestRoadmap() : undefined;
  const profile = guestPlan
    ? { ...userProfile, studyRoadmap: guestPlan }
    : userProfile;
  const earned = calculateUnlockedAchievements(profile);
  const metrics = achievementMetrics(profile);
  const categories = [
    ["all", "Tất cả"],
    ["onboarding", "Hành trình"],
    ["streak", "Thói quen"],
    ["vocab", "Từ & Sổ tay"],
    ["kanji", "Kanji"],
    ["grammar", "Ngữ pháp"],
    ["practice", "Luyện tập"],
    ["milestone", "Cột mốc"],
  ];
  const items = ACHIEVEMENTS_LIST.filter(
    (a) =>
      (category === "all" || a.category === category) &&
      (status === "all" ||
        (status === "unlocked" ? earned.has(a.id) : !earned.has(a.id))) &&
      `${a.title} ${a.description} ${a.number}`
        .toLocaleLowerCase("vi")
        .includes(search.toLocaleLowerCase("vi").trim()),
  );
  const next = ACHIEVEMENTS_LIST.filter((a) => !earned.has(a.id)).sort(
    (a, b) => metrics[b.metric] / b.threshold - metrics[a.metric] / a.threshold,
  )[0];
  useEffect(() => {
    if (!selected) return;
    const previous = document.activeElement as HTMLElement;
    dialog.current?.querySelector<HTMLButtonElement>("button")?.focus();
    return () => previous?.focus();
  }, [selected]);
  const icon = (item: AchievementItem, size: number) => (
    <AchievementMascotIcon
      type={item.character}
      poseIndex={item.poseIndex}
      badgeNumber={item.number}
      tier={item.tier}
      isUnlocked={earned.has(item.id)}
      size={size}
    />
  );
  return (
    <div className="shiba-collection">
      <div className="collection-shell">
        <div className="collection-top">
          <button onClick={onBack}>
            <ArrowLeft size={16} /> Về tiến độ
          </button>
          <span>BỘ SƯU TẬP NIHON SHIBA</span>
        </div>
        <section className="collection-hero">
          <div>
            <span className="collection-eyebrow">MỖI NỖ LỰC · MỘT DẤU ẤN</span>
            <h1>
              100 khoảnh khắc.
              <br />
              <em>Một hành trình của bạn.</em>
            </h1>
            <p>
              Shiba học, nghe, khám phá và ăn mừng cùng bạn. Mỗi huy hiệu có một
              mục tiêu rõ ràng.
            </p>
            <div className="collection-total">
              <strong>
                {earned.size}
                <small>/ 100 huy hiệu</small>
              </strong>
              <div className="collection-meter">
                <i style={{ width: `${earned.size}%` }} />
              </div>
            </div>
          </div>
          <ShibaMascot pose="trophy" size={180} animated={false} />
        </section>
        {next && (
          <button className="collection-next" onClick={() => setSelected(next)}>
            {icon(next, 60)}
            <div>
              <small>MỤC TIÊU GẦN NHẤT</small>
              <b>{next.title}</b>
              <p>
                {Math.min(next.threshold, metrics[next.metric])} /{" "}
                {next.threshold} · {next.description}
              </p>
            </div>
            <ArrowRight size={18} />
          </button>
        )}
        <div className="collection-tools">
          <label>
            <Search size={16} />
            <input
              aria-label="Tìm huy hiệu"
              placeholder="Tìm tên, mục tiêu hoặc số huy hiệu…"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </label>
          <div aria-label="Trạng thái huy hiệu">
            {[
              ["all", "Tất cả"],
              ["unlocked", "Đã nhận"],
              ["locked", "Chưa nhận"],
            ].map(([key, label]) => (
              <button
                key={key}
                aria-pressed={status === key}
                onClick={() => setStatus(key)}
              >
                {label}
              </button>
            ))}
          </div>
        </div>
        <nav className="collection-categories" aria-label="Nhóm thành tựu">
          {categories.map(([key, label]) => (
            <button
              key={key}
              aria-pressed={category === key}
              onClick={() => setCategory(key)}
            >
              {label}
              <small>
                {key === "all"
                  ? 100
                  : ACHIEVEMENTS_LIST.filter((a) => a.category === key).length}
              </small>
            </button>
          ))}
        </nav>
        <div className="collection-results">
          <span>{items.length} huy hiệu</span>
          <span>20 tư thế Shiba · 5 kiểu huy chương</span>
        </div>
        <div className="collection-grid">
          {items.map((item) => (
            <button
              className={`mascot-achievement-card ${earned.has(item.id) ? "badge-earned" : ""}`}
              key={item.id}
              onClick={() => setSelected(item)}
              aria-label={`${item.title}, ${earned.has(item.id) ? "đã nhận" : "chưa nhận"}`}
            >
              <span className="badge-category">{item.categoryName}</span>
              {icon(item, 80)}
              <h2>{item.title}</h2>
              <span className="badge-status">
                {earned.has(item.id) ? (
                  <>
                    <Check size={11} /> Đã nhận
                  </>
                ) : (
                  <>
                    <Lock size={10} /> {item.threshold.toLocaleString("vi-VN")}
                  </>
                )}
              </span>
            </button>
          ))}
        </div>
        {!items.length && (
          <div className="collection-empty">
            <ShibaMascot pose="curious" size={80} animated={false} />
            <p>Không có huy hiệu phù hợp. Hãy đổi bộ lọc hoặc từ tìm kiếm.</p>
          </div>
        )}
        <p className="collection-note">
          Huy hiệu được xác định từ hoạt động đã lưu; không suy đoán thời gian
          học, thứ hạng hoặc điểm thi. Bộ sưu tập mới không xóa lịch sử học của
          bạn.
        </p>
      </div>
      {selected && (
        <div
          className="badge-modal-backdrop"
          onClick={(e) => {
            if (e.target === e.currentTarget) setSelected(null);
          }}
        >
          <div
            ref={dialog}
            className="badge-modal"
            role="dialog"
            aria-modal="true"
            aria-labelledby="badge-title"
            onKeyDown={(e) => {
              if (e.key === "Escape") setSelected(null);
              if (e.key === "Tab") {
                const buttons = Array.from(
                  dialog.current?.querySelectorAll<HTMLButtonElement>(
                    "button",
                  ) || [],
                );
                if (e.shiftKey && document.activeElement === buttons[0]) {
                  e.preventDefault();
                  buttons.at(-1)?.focus();
                }
                if (!e.shiftKey && document.activeElement === buttons.at(-1)) {
                  e.preventDefault();
                  buttons[0]?.focus();
                }
              }
            }}
          >
            <button
              aria-label="Đóng huy hiệu"
              className="badge-close"
              onClick={() => setSelected(null)}
            >
              <X size={20} />
            </button>
            <span className="collection-eyebrow">
              HUY HIỆU {String(selected.number).padStart(3, "0")} ·{" "}
              {selected.categoryName}
            </span>
            {icon(selected, 155)}
            <h2 id="badge-title">{selected.title}</h2>
            <p>{selected.description}</p>
            <div className="collection-meter">
              <i
                style={{
                  width: `${selected.threshold === 0 ? 100 : Math.min(100, (metrics[selected.metric] / selected.threshold) * 100)}%`,
                }}
              />
            </div>
            <p>
              {earned.has(selected.id)
                ? "Đã mở khóa từ tiến độ của bạn."
                : `${metrics[selected.metric].toLocaleString("vi-VN")} / ${selected.threshold.toLocaleString("vi-VN")} · Tiếp tục học để đến cột mốc này.`}
            </p>
            <button
              className="badge-dialog-done"
              onClick={() => setSelected(null)}
            >
              Cùng Shiba tiếp tục hành trình
            </button>
          </div>
        </div>
      )}
    </div>
  );
};
export default AchievementsView;
