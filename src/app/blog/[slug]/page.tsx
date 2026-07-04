import type { Metadata } from "next";
import Link from "next/link";
import { getBlogPost, getBlogSlugs } from "@/lib/content";
import { MdxContent } from "@/components/mdx/MdxContent";
import { Tag } from "@/components/ui/Tag";

// 정적 export: 모든 글을 빌드 타임에 사전 생성 (CLAUDE.md 6장)
export const dynamicParams = false;

export function generateStaticParams() {
  return getBlogSlugs().map((slug) => ({ slug }));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const { meta } = getBlogPost(slug);
  return {
    title: meta.title,
    description: meta.summary,
    openGraph: {
      type: "article",
      title: meta.title,
      description: meta.summary,
      publishedTime: meta.date,
      authors: [meta.author],
    },
  };
}

export default async function BlogPostPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const { meta, body } = getBlogPost(slug);

  return (
    <div className="pt-16">
      <article className="mx-auto max-w-3xl px-5 py-16 lg:px-8 lg:py-24">
        <header>
          <div className="flex items-center gap-3 font-mono text-xs text-silver">
            <time dateTime={meta.date}>{meta.date}</time>
            <span aria-hidden>·</span>
            <span>{meta.author}</span>
          </div>
          <h1 className="mt-4 font-display text-[clamp(1.75rem,4.5vw,2.75rem)] font-extrabold leading-[1.2] text-ink">
            {meta.title}
          </h1>
          <div className="mt-5 flex flex-wrap gap-1.5">
            {meta.tags.map((t) => (
              <Tag key={t} label={t} />
            ))}
          </div>
        </header>

        <div className="mt-10 border-t border-line pt-10">
          <MdxContent source={body} />
        </div>

        <footer className="mt-14 border-t border-line pt-8">
          <Link
            href="/blog/"
            className="font-mono text-sm text-graphite transition-colors hover:bg-marker hover:text-ink"
          >
            ← 블로그 목록으로
          </Link>
        </footer>
      </article>
    </div>
  );
}
