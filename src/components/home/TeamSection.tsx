import type { Member } from "@/lib/content";
import { Reveal } from "@/components/motion/Reveal";
import { StaggerGroup, StaggerItem } from "@/components/motion/Stagger";
import { Tag } from "@/components/ui/Tag";

// 팀원 사진: 원본은 컬러, CSS로만 흑백 처리 — hover/focus 시 컬러 (design.md 4장)
export function TeamSection({ members }: { members: Member[] }) {
  return (
    <section id="team" aria-labelledby="team-heading" className="scroll-mt-16">
      <div className="mx-auto max-w-6xl px-5 py-20 lg:px-8 lg:py-32">
        <Reveal className="text-center">
          <p className="font-mono text-xs uppercase tracking-[0.2em] text-silver">
            team 소개
          </p>
          <h2
            id="team-heading"
            className="mt-4 font-display text-[clamp(1.75rem,4.5vw,2.75rem)] font-extrabold leading-tight text-ink"
          >
            세 명의 이름이
            <br />
            하나의 팀명이 됐습니다
          </h2>
        </Reveal>

        <StaggerGroup className="mt-12 grid grid-cols-1 gap-x-6 gap-y-12 sm:grid-cols-2 lg:grid-cols-4">
          {members.map((m) => (
            <StaggerItem key={m.name}>
              <article className="group">
                <div className="overflow-hidden rounded-lg border border-line bg-paper-dim">
                  <img
                    src={m.photo}
                    alt={m.alt}
                    width={480}
                    height={640}
                    loading="lazy"
                    className="aspect-[3/4] w-full object-cover grayscale transition-[filter] duration-[450ms] group-hover:grayscale-0 group-focus-within:grayscale-0"
                  />
                </div>
                <div className="mt-4 flex items-baseline gap-2">
                  <h3 className="font-display text-xl font-semibold text-ink">{m.name}</h3>
                  <span
                    className={`font-mono text-xs ${
                      m.isMentor ? "bg-marker px-1.5 py-0.5 text-ink" : "text-silver"
                    }`}
                  >
                    {m.role}
                  </span>
                </div>
                <p className="mt-2 text-sm leading-relaxed text-graphite">{m.intro}</p>
                <ul className="mt-3 flex flex-wrap gap-1.5" aria-label={`${m.name}의 관심 분야`}>
                  {m.focus.map((f) => (
                    <li key={f}>
                      <Tag label={f} />
                    </li>
                  ))}
                </ul>
              </article>
            </StaggerItem>
          ))}
        </StaggerGroup>
      </div>
    </section>
  );
}
