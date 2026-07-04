import Link from "next/link";
import type { Meeting } from "@/lib/content";
import { Reveal } from "@/components/motion/Reveal";
import { StaggerGroup, StaggerItem } from "@/components/motion/Stagger";

// 미팅/회의 기록 — JSON 기반 장부(ledger) 타임라인. 캘린더 UI 금지 (요구사항).
export function MeetingsSection({ meetings }: { meetings: Meeting[] }) {
  return (
    <section
      id="meetings"
      aria-labelledby="meetings-heading"
      className="dark-section scroll-mt-16 bg-carbon"
    >
      <div className="mx-auto max-w-6xl px-5 py-20 lg:px-8 lg:py-32">
        <Reveal>
          <p className="font-mono text-xs uppercase tracking-[0.2em] text-silver">
            log — 미팅 & 회의
          </p>
          <h2
            id="meetings-heading"
            className="mt-4 font-display text-[clamp(1.75rem,4.5vw,2.75rem)] font-extrabold leading-tight text-paper"
          >
            기록이 곧 진행률입니다
          </h2>
        </Reveal>

        <StaggerGroup className="mt-12">
          <ol className="border-l border-graphite">
            {meetings.map((m) => (
              <StaggerItem key={`${m.date}-${m.title}`}>
                <li className="relative py-5 pl-8">
                  {/* 타임라인 도트 — 완료 항목은 형광펜 색 (design.md 6장) */}
                  <span
                    aria-hidden
                    className={`absolute top-7 -left-[5px] size-2.5 rounded-full ${
                      m.done ? "bg-marker" : "border border-silver bg-carbon"
                    }`}
                  />
                  <div className="flex flex-wrap items-center gap-x-4 gap-y-1">
                    <time dateTime={m.date} className="font-mono text-xs text-silver">
                      {m.date}
                    </time>
                    <span className="rounded-full border border-graphite px-2 py-0.5 font-mono text-[0.6875rem] text-silver">
                      {m.type}
                    </span>
                  </div>
                  <h3 className="mt-1.5 text-base font-semibold text-paper">{m.title}</h3>
                  <p className="mt-1 max-w-2xl text-sm leading-relaxed text-[#a3a3a0]">
                    {m.memo}
                  </p>
                </li>
              </StaggerItem>
            ))}
          </ol>
        </StaggerGroup>

        <Reveal className="mt-10">
          <p className="text-sm text-silver">
            미팅 뒷이야기와 체험기는{" "}
            <Link
              href="/blog/"
              className="text-paper underline decoration-silver underline-offset-4 hover:decoration-marker"
            >
              블로그
            </Link>
            에 씁니다.
          </p>
        </Reveal>
      </div>
    </section>
  );
}
