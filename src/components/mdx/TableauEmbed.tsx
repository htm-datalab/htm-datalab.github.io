// Tableau Public 공개 대시보드 임베드 (키 불필요 — CLAUDE.md 4장).
// url이 없으면 교체 지점 플레이스홀더를 표시한다.
export function TableauEmbed({
  url,
  title,
  aspect = "4/3",
}: {
  /** Tableau Public 공유 URL. 공개 가능한 대시보드만 연결할 것 */
  url?: string;
  title: string;
  aspect?: string;
}) {
  if (!url) {
    return (
      <div
        className="flex flex-col items-center justify-center gap-2 rounded-lg border border-dashed border-silver bg-paper-dim px-6 py-16 text-center"
        role="img"
        aria-label={`${title} — Tableau 대시보드 자리`}
      >
        <span className="font-mono text-xs uppercase tracking-widest text-silver">
          [MOCK] Tableau Public 대시보드 자리
        </span>
        <span className="text-sm text-graphite">{title}</span>
        <span className="text-xs text-silver">
          공개 가능한 대시보드 발행 후 url을 채우면 임베드됩니다
        </span>
      </div>
    );
  }

  const sep = url.includes("?") ? "&" : "?";
  const embedUrl = `${url}${sep}:showVizHome=no&:embed=true`;

  return (
    <div className="overflow-hidden rounded-lg border border-line" style={{ aspectRatio: aspect }}>
      <iframe
        src={embedUrl}
        title={title}
        loading="lazy"
        className="h-full w-full"
        allowFullScreen
      />
    </div>
  );
}
