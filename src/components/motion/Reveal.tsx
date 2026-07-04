"use client";

// 스크롤 등장 프리미티브 — design.md 5장 스펙 고정.
// 등장은 viewport 진입 시 1회만, 이동 20px, 0.6s.
import { motion, useReducedMotion } from "motion/react";
import type { ReactNode } from "react";

export const EASE_OUT_EXPO: [number, number, number, number] = [0.16, 1, 0.3, 1];

export function Reveal({
  children,
  delay = 0,
  className,
}: {
  children: ReactNode;
  delay?: number;
  className?: string;
}) {
  const reduce = useReducedMotion();

  if (reduce) {
    return <div className={className}>{children}</div>;
  }

  return (
    <motion.div
      className={className}
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "-80px" }}
      transition={{ duration: 0.6, ease: EASE_OUT_EXPO, delay }}
    >
      {children}
    </motion.div>
  );
}
