import Link from "next/link";
import type { BlogPostMeta } from "@/lib/content";
import { Tag } from "@/components/ui/Tag";

// 블로그 카드 — 썸네일 없이 텍스트 카드 (design.md 6장)
export function PostCard({ post }: { post: BlogPostMeta }) {
  return (
    <article>
      <Link
        href={`/blog/${post.slug}/`}
        className="group flex h-full flex-col rounded-lg border border-line bg-paper p-6 transition-all duration-200 hover:-translate-y-1 hover:border-ink"
      >
        <div className="flex items-center gap-3 font-mono text-xs text-silver">
          <time dateTime={post.date}>{post.date}</time>
          <span aria-hidden>·</span>
          <span>{post.author}</span>
        </div>
        <h2 className="mt-3 font-display text-lg font-semibold leading-snug text-ink group-hover:underline group-hover:decoration-marker group-hover:decoration-4 group-hover:underline-offset-4">
          {post.title}
        </h2>
        <p className="mt-2 flex-1 text-sm leading-relaxed text-graphite">{post.summary}</p>
        <div className="mt-4 flex flex-wrap gap-1.5">
          {post.tags.map((t) => (
            <Tag key={t} label={t} />
          ))}
        </div>
      </Link>
    </article>
  );
}
