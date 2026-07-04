import { site } from "@/lib/site";

export function Footer() {
  return (
    <footer className="dark-section bg-carbon text-paper">
      <div className="mx-auto max-w-6xl px-5 py-16 lg:px-8 lg:py-20">
        <p className="font-mono text-xs uppercase tracking-widest text-silver">
          university data analysis team
        </p>
        <p className="mt-3 font-display text-[clamp(1.75rem,5vw,3.25rem)] font-extrabold leading-tight text-paper">
          혜빈이택한민정
        </p>

        <div className="mt-10 flex flex-col gap-6 sm:flex-row sm:items-end sm:justify-between">
          <ul className="space-y-2 text-sm">
            <li>
              <span className="mr-3 font-mono text-xs text-silver">contact</span>
              {/* [MOCK] TODO: replace — 팀 대표 이메일 (src/lib/site.ts) */}
              <a
                href={`mailto:${site.email}`}
                className="text-paper underline decoration-silver underline-offset-4 hover:decoration-marker"
              >
                {site.email}
              </a>
            </li>
            <li>
              <span className="mr-3 font-mono text-xs text-silver">github</span>
              <a
                href={site.github}
                target="_blank"
                rel="noopener noreferrer"
                className="text-paper underline decoration-silver underline-offset-4 hover:decoration-marker"
              >
                {site.github.replace("https://", "")}
              </a>
            </li>
          </ul>

          <p className="text-xs leading-relaxed text-silver">
            © 2026 Team. 혜빈이택한민정
            <br />
            본 사이트의 프로젝트 데이터·수치는 전부 예시(Mock)입니다.
          </p>
        </div>
      </div>
    </footer>
  );
}
