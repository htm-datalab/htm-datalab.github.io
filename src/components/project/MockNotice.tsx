// 데이터 기밀 유지 고지 — 모든 프로젝트 페이지에 필수 표시 (CLAUDE.md 1장).
// 이 컴포넌트를 제거하지 않는다.
export function MockNotice() {
  return (
    <aside
      aria-label="데이터 안내"
      className="rounded-r-lg border-l-4 border-marker bg-marker/15 px-5 py-4"
    >
      <p className="font-mono text-xs font-semibold uppercase tracking-widest text-ink">
        notice
      </p>
      <p className="mt-1 text-sm leading-relaxed text-graphite">
        본 페이지의 데이터·수치는 <strong className="text-ink">예시(Mock)</strong>이며 실제
        의뢰 데이터가 아닙니다. 실제 분석 결과는 클라이언트와의 보안 유지 약정에 따라
        공개하지 않습니다.
      </p>
    </aside>
  );
}
