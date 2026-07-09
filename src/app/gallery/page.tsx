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
        <Reveal className="text-center">
          <p className="font-mono text-xs uppercase tracking-[0.2em] text-silver">
            gallery — 활동 사진
          </p>
          <h1 className="mt-4 font-display text-[clamp(2rem,5vw,3.5rem)] font-extrabold text-ink">
            갤러리
          </h1>
          <p className="mx-auto mt-4 max-w-xl leading-relaxed text-graphite">
            형형색색의 순간들을 포착합니다.
          </p>
        </Reveal>

        <div className="mt-12">
          <GalleryClient items={items} />
        </div>
      </div>
    </div>
  );
}
