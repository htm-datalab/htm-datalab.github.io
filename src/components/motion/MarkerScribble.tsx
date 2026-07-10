"use client";

// 손그림 형광펜 스크리블 — 페이지 히어로 제목 장식. 텍스트 뒤(-z-10)에서
// 좌→우로 그려지며 좌/우 루프를 지나간다. reduced-motion이면 정적 표시.
import { motion, useReducedMotion } from "motion/react";
import type { ReactNode } from "react";
import { EASE_OUT_EXPO } from "./Reveal";

const SCRIBBLE_PATH =
  "M4 92 C 26 55, 70 15, 102 38 C 134 60, 122 108, 92 106 C 65 104, 68 58, 108 38 C 165 12, 235 58, 292 62 C 350 66, 392 28, 432 35 C 466 41, 498 82, 466 102 C 436 120, 418 68, 456 42 C 492 18, 525 30, 552 52";

export function MarkerScribble({
  children,
  delay = 0.4,
}: {
  children: ReactNode;
  delay?: number;
}) {
  const reduce = useReducedMotion();

  const drawProps = reduce
    ? { initial: { pathLength: 1 } }
    : {
        initial: { pathLength: 0 },
        whileInView: { pathLength: 1 },
        viewport: { once: true, margin: "-40px" },
      };

  return (
    <span className="relative isolate inline-block">
      <svg
        aria-hidden
        viewBox="0 0 560 140"
        fill="none"
        className="pointer-events-none absolute left-1/2 top-1/2 -z-10 w-[min(175%,92vw)] -translate-x-1/2 -translate-y-1/2 overflow-visible"
      >
        <motion.path
          d={SCRIBBLE_PATH}
          className="stroke-marker"
          strokeWidth={16}
          strokeLinecap="round"
          transition={{ duration: 0.8, ease: EASE_OUT_EXPO, delay }}
          {...drawProps}
        />
      </svg>
      <span className="relative">{children}</span>
    </span>
  );
}
