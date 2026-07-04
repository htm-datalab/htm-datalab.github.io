"use client";

// 부드러운 스크롤 — 홈(원페이지 랜딩)에서만 사용. design.md 5장.
// prefers-reduced-motion 사용자는 네이티브 스크롤 유지.
import { ReactLenis } from "lenis/react";
import { useReducedMotion } from "motion/react";

export function LenisProvider() {
  const reduce = useReducedMotion();

  if (reduce) return null;

  return <ReactLenis root options={{ anchors: true }} />;
}
