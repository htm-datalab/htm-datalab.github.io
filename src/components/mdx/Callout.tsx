import type { ReactNode } from "react";

// MDX 본문용 콜아웃. insight = 형광펜 마커 라인(발견 강조), note = 중립 안내.
export function Callout({
  type = "note",
  title,
  children,
}: {
  type?: "note" | "insight";
  title?: string;
  children: ReactNode;
}) {
  const isInsight = type === "insight";

  return (
    <aside
      className={`rounded-r-lg border-l-4 py-4 pl-5 pr-5 ${
        isInsight ? "border-marker bg-marker/15" : "border-ink bg-paper-dim"
      }`}
    >
      {title && (
        <p className="mb-1 font-mono text-xs font-semibold uppercase tracking-widest text-ink">
          {isInsight ? "✦ " : ""}
          {title}
        </p>
      )}
      <div className="text-[0.9375rem] leading-relaxed text-graphite">{children}</div>
    </aside>
  );
}
