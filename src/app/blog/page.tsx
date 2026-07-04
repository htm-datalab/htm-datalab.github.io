import type { Metadata } from "next";
import { getBlogPosts } from "@/lib/content";
import { PostCard } from "@/components/blog/PostCard";
import { Reveal } from "@/components/motion/Reveal";
import { StaggerGroup, StaggerItem } from "@/components/motion/Stagger";

export const metadata: Metadata = {
  title: "블로그",
  description: "미팅 후기, 체험기, 분석 과정의 기록 — Team. 혜빈이택한민정의 블로그.",
};

export default function BlogPage() {
  const posts = getBlogPosts();

  return (
    <div className="pt-16">
      <div className="mx-auto max-w-6xl px-5 py-16 lg:px-8 lg:py-24">
        <Reveal>
          <p className="font-mono text-xs uppercase tracking-[0.2em] text-silver">
            blog — 기록과 후기
          </p>
          <h1 className="mt-4 font-display text-[clamp(2rem,5vw,3.5rem)] font-extrabold text-ink">
            블로그
          </h1>
          <p className="mt-4 max-w-xl leading-relaxed text-graphite">
            미팅 후기, 현장 체험기, 분석하다 만난 시행착오를 씁니다.
          </p>
        </Reveal>

        <StaggerGroup className="mt-12 grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {posts.map((post) => (
            <StaggerItem key={post.slug} className="h-full">
              <PostCard post={post} />
            </StaggerItem>
          ))}
        </StaggerGroup>
      </div>
    </div>
  );
}
