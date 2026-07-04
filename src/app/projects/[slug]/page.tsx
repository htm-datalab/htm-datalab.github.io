import type { Metadata } from "next";
import { getProject, getProjectSlugs } from "@/lib/content";
import { MdxContent } from "@/components/mdx/MdxContent";
import { MockNotice } from "@/components/project/MockNotice";
import { SectionNav } from "@/components/project/SectionNav";
import { Reveal } from "@/components/motion/Reveal";
import { Tag } from "@/components/ui/Tag";

// 정적 export: 모든 프로젝트 페이지를 빌드 타임에 사전 생성 (CLAUDE.md 6장)
export const dynamicParams = false;

export function generateStaticParams() {
  return getProjectSlugs().map((slug) => ({ slug }));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const { meta } = getProject(slug);
  return {
    title: `${meta.client} — ${meta.title}`,
    description: meta.summary,
    openGraph: {
      title: `${meta.client} — ${meta.title}`,
      description: meta.summary,
    },
  };
}

export default async function ProjectPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const { meta, sections } = getProject(slug);

  return (
    <article className="pt-16">
      {/* 프로젝트 헤더 */}
      <header className="mx-auto max-w-6xl px-5 pt-16 pb-10 lg:px-8 lg:pt-24">
        <Reveal>
          <p className="font-mono text-xs tracking-[0.15em] text-silver">
            의뢰 {String(meta.order).padStart(2, "0")} — {meta.clientType}
          </p>
          <p className="mt-4 text-lg font-semibold text-ink">{meta.client}</p>
          <h1 className="mt-2 max-w-4xl font-display text-[clamp(2rem,5.5vw,3.5rem)] font-extrabold leading-[1.15] text-ink">
            {meta.title}
          </h1>
          <p className="mt-5 max-w-2xl leading-relaxed text-graphite">{meta.summary}</p>

          <div className="mt-6 flex flex-wrap items-center gap-x-6 gap-y-3">
            <div className="flex flex-wrap gap-1.5">
              {meta.tags.map((t) => (
                <Tag key={t} label={t} />
              ))}
            </div>
            <span className="font-mono text-xs text-silver">
              {meta.period} · {meta.status}
            </span>
          </div>
        </Reveal>

        <div className="mt-10">
          <MockNotice />
        </div>
      </header>

      <div className="mx-auto max-w-6xl px-5 lg:px-8">
        <SectionNav sections={sections} />

        {/* 본문 섹션: 분석 개요 → 데이터 분석 → 인사이트·결과 */}
        <div className="mx-auto max-w-3xl">
          {sections.map((s, i) => (
            <section
              key={s.id}
              id={s.id}
              aria-labelledby={`${s.id}-heading`}
              className="scroll-mt-32 border-b border-line py-14 last:border-b-0 lg:py-20"
            >
              <Reveal>
                <p className="font-mono text-xs uppercase tracking-[0.2em] text-silver">
                  {String(i + 1).padStart(2, "0")}
                </p>
                <h2
                  id={`${s.id}-heading`}
                  className="mt-3 font-display text-[clamp(1.5rem,3.5vw,2.25rem)] font-extrabold text-ink"
                >
                  {s.title}
                </h2>
              </Reveal>
              <div className="mt-8">
                <MdxContent source={s.body} />
              </div>
            </section>
          ))}
        </div>
      </div>
    </article>
  );
}
