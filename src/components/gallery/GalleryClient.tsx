"use client";

// 갤러리 — 태그 필터 + 라이트박스 (yet-another-react-lightbox).
// 사진은 CSS로만 흑백 처리, hover/focus 시 컬러 (design.md 4장).
import { useMemo, useState } from "react";
import Lightbox from "yet-another-react-lightbox";
import Captions from "yet-another-react-lightbox/plugins/captions";
import "yet-another-react-lightbox/styles.css";
import "yet-another-react-lightbox/plugins/captions.css";
import type { GalleryItem } from "@/lib/content";
import { StaggerGroup, StaggerItem } from "@/components/motion/Stagger";

const ALL = "전체";

export function GalleryClient({ items }: { items: GalleryItem[] }) {
  const [activeTag, setActiveTag] = useState<string>(ALL);
  const [index, setIndex] = useState(-1);

  const tags = useMemo(
    () => [ALL, ...Array.from(new Set(items.flatMap((i) => i.tags)))],
    [items],
  );

  const filtered = useMemo(
    () => (activeTag === ALL ? items : items.filter((i) => i.tags.includes(activeTag))),
    [items, activeTag],
  );

  // 라이트박스는 필터에 보이는 모든 게시물의 이미지를 이어서 넘긴다.
  // offsets[i] = filtered[i]의 첫 이미지가 slides 배열에서 시작하는 인덱스.
  const { slides, offsets } = useMemo(() => {
    const slides: { src: string; alt: string; description: string }[] = [];
    const offsets: number[] = [];
    for (const post of filtered) {
      offsets.push(slides.length);
      post.images.forEach((img, i) => {
        slides.push({
          src: img.src,
          alt: img.alt,
          description:
            post.images.length > 1 ? `${post.caption} (${i + 1}/${post.images.length})` : post.caption,
        });
      });
    }
    return { slides, offsets };
  }, [filtered]);

  return (
    <>
      {/* 태그 필터 */}
      <div role="group" aria-label="사진 태그 필터" className="flex flex-wrap gap-2">
        {tags.map((tag) => (
          <button
            key={tag}
            type="button"
            aria-pressed={activeTag === tag}
            onClick={() => setActiveTag(tag)}
            className={`rounded-full border px-3 py-1.5 font-mono text-xs transition-colors ${
              activeTag === tag
                ? "border-ink bg-marker text-ink"
                : "border-line text-graphite hover:border-ink"
            }`}
          >
            {tag}
          </button>
        ))}
      </div>

      {/* 사진 그리드 — 필터가 바뀔 때마다 스태거 재생을 피하려고 key로 리셋하지 않는다 */}
      <StaggerGroup className="mt-8 grid grid-cols-2 gap-3 md:grid-cols-3 md:gap-4">
        {filtered.map((item, i) => {
          const cover = item.images[0];
          const count = item.images.length;
          return (
            <StaggerItem key={cover.src}>
              <figure>
                <button
                  type="button"
                  onClick={() => setIndex(offsets[i])}
                  aria-label={
                    count > 1
                      ? `${item.caption} — 사진 ${count}장 크게 보기`
                      : `${item.caption} — 크게 보기`
                  }
                  className="group relative block w-full overflow-hidden rounded-lg border border-line bg-paper-dim"
                >
                  <img
                    src={cover.src}
                    alt={cover.alt}
                    width={800}
                    height={600}
                    loading="lazy"
                    className="aspect-[4/3] w-full object-cover grayscale transition-[filter,transform] duration-[450ms] group-hover:scale-[1.02] group-hover:grayscale-0 group-focus-visible:grayscale-0"
                  />
                  {count > 1 && (
                    <span className="absolute right-2 top-2 rounded-full bg-ink/70 px-2 py-0.5 font-mono text-[0.6875rem] text-paper">
                      ⧉ {count}
                    </span>
                  )}
                </button>
                <figcaption className="mt-2 flex items-baseline justify-between gap-2 px-0.5">
                  <span className="truncate text-xs text-graphite">{item.caption}</span>
                  <time dateTime={item.date} className="shrink-0 font-mono text-[0.6875rem] text-silver">
                    {item.date}
                  </time>
                </figcaption>
              </figure>
            </StaggerItem>
          );
        })}
      </StaggerGroup>

      {filtered.length === 0 && (
        <p className="mt-12 text-center text-sm text-silver">
          이 태그의 사진이 아직 없습니다.
        </p>
      )}

      <Lightbox
        open={index >= 0}
        index={index}
        close={() => setIndex(-1)}
        slides={slides}
        plugins={[Captions]}
        styles={{ container: { backgroundColor: "rgba(22, 22, 22, 0.95)" } }}
      />
    </>
  );
}
