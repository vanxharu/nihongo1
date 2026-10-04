import React, { useEffect, useState } from "react";
import type { LearningFeedback } from "../utils/learningMotion";
import "./learningMotion.css";

export default function LearningMotion() {
  const [feedback, setFeedback] = useState<{
    kind: LearningFeedback;
    id: number;
  } | null>(null);
  useEffect(() => {
    let timer: ReturnType<typeof setTimeout>;
    const handle = (event: Event) => {
      const kind = (event as CustomEvent).detail?.kind;
      if (!["correct", "incorrect", "milestone"].includes(kind)) return;
      clearTimeout(timer);
      setFeedback({ kind, id: Date.now() });
      timer = setTimeout(() => setFeedback(null), 1000);
    };
    window.addEventListener("nihongo:learning-feedback", handle);
    return () => {
      clearTimeout(timer);
      window.removeEventListener("nihongo:learning-feedback", handle);
    };
  }, []);
  return feedback ? (
    <div
      key={feedback.id}
      aria-hidden="true"
      className={`learning-feedback learning-feedback-${feedback.kind}`}
    >
      {feedback.kind !== "incorrect" &&
        Array.from(
          { length: feedback.kind === "milestone" ? 12 : 5 },
          (_, i) => (
            <i
              key={i}
              style={
                {
                  "--angle": `${(i * 360) / (feedback.kind === "milestone" ? 12 : 5)}deg`,
                } as React.CSSProperties
              }
            >
              ✦
            </i>
          ),
        )}
    </div>
  ) : null;
}
