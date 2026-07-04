import type { Metadata } from "next";
import { getGalleryItems } from "@/lib/content";
import { GalleryClient } from "@/components/gallery/GalleryClient";
import { Reveal } from "@/components/motion/Reveal";

export const metadata: Metadata = {
  title: "갤러리",
  description: "미팅, 현장 체험, 활동 사진 모음 — Team. 혜빈이택한민정.",
};

// 사진 업로드 전 EXIF(GPS) 제거 원칙 — CLAUDE.md 3장
export default function GalleryPage() {
  const items = getGalleryItems();

  return (
    <div className="pt-16">
      <div className="mx-auto max-w-6xl px-5 py-16 lg:px-8 lg:py-24">
        <Reveal>
          <p className="font-mono text-xs uppercase tracking-[0.2em] text-silver">
            gallery — 활동 사진
          </p>
          <h1 className="mt-4 font-display text-[clamp(2rem,5vw,3.5rem)] font-extrabold text-ink">
            갤러리
          </h1>
          <p className="mt-4 max-w-xl leading-relaxed text-graphite">
            미팅과 현장의 순간들. 사진 위에 마우스를 올리면 색이 돌아옵니다.
          </p>
        </Reveal>

        <div className="mt-12">
          <GalleryClient items={items} />
        </div>
      </div>
    </div>
  );
}
