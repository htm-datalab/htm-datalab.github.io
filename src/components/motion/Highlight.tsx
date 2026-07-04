"use client";

// 형광펜 스와이프 — 사이트 시그니처. design.md 6장: 페이지당 2–3곳 이내로만.
import { motion, useReducedMotion } from "motion/react";
import type { ReactNode } from "react";
import { EASE_OUT_EXPO } from "./Reveal";

export function Highlight({
  children,
  delay = 0,
  /** true면 스크롤 진입이 아니라 마운트 직후 재생 (Hero 전용) */
  onLoad = false,
}: {
  children: ReactNode;
  delay?: number;
  onLoad?: boolean;
}) {
  const reduce = useReducedMotion();

  const swipeProps = reduce
    ? { initial: { scaleX: 1 } }
    : onLoad
      ? { initial: { scaleX: 0 }, animate: { scaleX: 1 } }
      : {
          initial: { scaleX: 0 },
          whileInView: { scaleX: 1 },
          viewport: { once: true, margin: "-40px" },
        };

  return (
    <span className="relative isolate inline">
      <motion.span
        aria-hidden
        className="absolute -inset-x-[0.08em] top-[0.08em] bottom-0 -z-10 bg-marker"
        style={{ originX: 0 }}
        transition={{ duration: 0.5, ease: EASE_OUT_EXPO, delay }}
        {...swipeProps}
      />
      {children}
    </span>
  );
}
