import Link from "next/link";
import type { ProjectMeta } from "@/lib/content";
import { Reveal } from "@/components/motion/Reveal";
import { StaggerGroup, StaggerItem } from "@/components/motion/Stagger";
import { Tag } from "@/components/ui/Tag";

// "의뢰 01/02" 번호는 실제 의뢰 순번 (frontmatter order) — design.md 6장
export function ProjectsSection({ projects }: { projects: ProjectMeta[] }) {
  return (
    <section id="projects" aria-labelledby="projects-heading" className="scroll-mt-16">
      <div className="mx-auto max-w-6xl px-5 py-20 lg:px-8 lg:py-32">
        <Reveal className="text-center">
          <p className="font-mono text-xs uppercase tracking-[0.2em] text-silver">
            projects — 의뢰 작업
          </p>
          <h2
            id="projects-heading"
            className="mt-4 font-display text-[clamp(1.75rem,4.5vw,2.75rem)] font-extrabold leading-tight text-ink"
          >
            두 건의 의뢰,
            <br />두 개의 분석
          </h2>
        </Reveal>

        <StaggerGroup className="mt-12 grid grid-cols-1 gap-6 md:grid-cols-2">
          {projects.map((p) => (
            <StaggerItem key={p.slug}>
              <Link
                href={`/projects/${p.slug}/`}
                className="group flex h-full flex-col rounded-lg border border-line bg-paper p-7 transition-all duration-200 hover:-translate-y-1 hover:border-ink lg:p-9"
              >
                <div className="flex items-center justify-between">
                  <span className="font-mono text-xs tracking-[0.15em] text-silver">
                    의뢰 {String(p.order).padStart(2, "0")}
                  </span>
                  <span className="font-mono text-xs text-silver">{p.status}</span>
                </div>

                <p className="mt-6 text-sm text-graphite">
                  <span className="font-semibold text-ink">{p.client}</span>
                  <span className="mx-2 text-line">|</span>
                  {p.clientType}
                </p>

                <h3 className="mt-2 font-display text-[1.375rem] font-semibold leading-snug text-ink lg:text-2xl">
                  {p.title}
                </h3>

                <p className="mt-3 flex-1 text-sm leading-relaxed text-graphite">{p.summary}</p>

                <div className="mt-6 flex flex-wrap gap-1.5">
                  {p.tags.map((t) => (
                    <Tag key={t} label={t} />
                  ))}
                </div>

                <div className="mt-6 flex items-center justify-between border-t border-line pt-4">
                  <span className="font-mono text-xs text-silver">{p.period}</span>
                  <span
                    aria-hidden
                    className="text-lg text-ink transition-transform duration-200 group-hover:translate-x-1.5"
                  >
                    →
                  </span>
                </div>
              </Link>
            </StaggerItem>
          ))}
        </StaggerGroup>
      </div>
    </section>
  );
}
