import Link from "next/link";
import type { Meeting } from "@/lib/content";
import { Reveal } from "@/components/motion/Reveal";
import { MeetingsCalendar } from "@/components/home/MeetingsCalendar";

// 미팅/회의 기록 — 월 전환 캘린더(모눈종이 기록지). 날짜 선택 시 장부식 상세 카드. design.md 6장.
export function MeetingsSection({ meetings }: { meetings: Meeting[] }) {
  return (
    <section
      id="meetings"
      aria-labelledby="meetings-heading"
      className="dark-section scroll-mt-16 bg-carbon"
    >
      <div className="mx-auto max-w-6xl px-5 py-20 lg:px-8 lg:py-32">
        <Reveal className="text-center">
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

        <Reveal className="mt-12">
          <MeetingsCalendar meetings={meetings} />
        </Reveal>

        <Reveal className="mt-10">
          <p className="text-center text-sm text-silver">
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
