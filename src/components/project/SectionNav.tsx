import type { ProjectSection } from "@/lib/content";

// 프로젝트 본문 앵커 네비 — 고정 헤더(4rem) 아래에 붙는다.
export function SectionNav({ sections }: { sections: ProjectSection[] }) {
  return (
    <nav
      aria-label="프로젝트 목차"
      className="sticky top-16 z-30 -mx-5 border-y border-line bg-paper/90 backdrop-blur-md lg:-mx-8"
    >
      <ul className="mx-auto flex max-w-6xl gap-1 overflow-x-auto px-5 lg:px-8">
        {sections.map((s, i) => (
          <li key={s.id}>
            <a
              href={`#${s.id}`}
              className="block whitespace-nowrap px-3 py-3 text-sm text-graphite transition-colors hover:bg-marker hover:text-ink"
            >
              <span className="mr-1.5 font-mono text-xs text-silver">
                {String(i + 1).padStart(2, "0")}
              </span>
              {s.title}
            </a>
          </li>
        ))}
      </ul>
    </nav>
  );
}
