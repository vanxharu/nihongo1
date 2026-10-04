export type LearningFeedback = "correct" | "incorrect" | "milestone";
export function showLearningFeedback(kind: LearningFeedback): void {
  if (typeof window !== "undefined")
    window.dispatchEvent(
      new CustomEvent("nihongo:learning-feedback", { detail: { kind } }),
    );
}
