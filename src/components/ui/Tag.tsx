// 태그 필 — design.md 6장: 모노 소문자, 색은 형광펜 하나뿐.
export function Tag({ label, active = false }: { label: string; active?: boolean }) {
  return (
    <span
      className={`inline-block rounded-full border px-2.5 py-0.5 font-mono text-xs lowercase ${
        active
          ? "border-ink bg-marker text-ink"
          : "border-line bg-transparent text-graphite"
      }`}
    >
      {label}
    </span>
  );
}
