"use client";

// 시그니처 Hero — 팀명 디코딩: "혜빈이 택한 민정" 위에 형광펜이 그어지며
// 세 사람의 이름이 드러난다. design.md 1장.
import { motion, useReducedMotion } from "motion/react";
import { EASE_OUT_EXPO } from "@/components/motion/Reveal";

const NAMES = [
  { name: "혜빈", label: "팀장", trailing: "이" },
  { name: "택한", label: "팀원", trailing: "" },
  { name: "민정", label: "팀원", trailing: "" },
] as const;

// 등장 순서: 문장(0.1s) → 형광펜 3획(0.7s~) → 라벨(1.5s~) → 나머지
const SWIPE_BASE = 0.7;
const SWIPE_GAP = 0.22;
const LABEL_BASE = 1.5;

function fadeUp(reduce: boolean, delay: number) {
  return reduce
    ? {}
    : {
        initial: { opacity: 0, y: 20 },
        animate: { opacity: 1, y: 0 },
        transition: { duration: 0.6, ease: EASE_OUT_EXPO, delay },
      };
}

export function Hero() {
  const reduce = useReducedMotion() ?? false;

  return (
    <section
      aria-label="팀 소개"
      className="relative flex min-h-svh flex-col justify-center overflow-hidden"
    >
      <div className="mx-auto w-full max-w-6xl px-5 pt-24 pb-16 lg:px-8">
        <motion.p
          className="font-mono text-xs uppercase tracking-[0.2em] text-silver"
          {...fadeUp(reduce, 0.1)}
        >
          team portfolio — 대학생 데이터 분석 팀
        </motion.p>

        {/* 팀명 디코딩. 라벨 자리를 위해 위 여백 확보 */}
        <motion.h1
          className="mt-10 font-display text-[clamp(2.75rem,9vw,6.75rem)] font-extrabold leading-[1.1] tracking-[-0.03em] text-ink"
          {...fadeUp(reduce, 0.2)}
        >
          {NAMES.map((seg, i) => (
            <span key={seg.name} className="whitespace-nowrap">
              <span className="relative isolate inline-block">
                {/* 이름 라벨 — 형광펜이 그어진 뒤 나타난다 */}
                <motion.span
                  aria-hidden
                  className="absolute -top-[1.4em] left-[0.05em] font-mono text-[max(0.6875rem,0.14em)] font-normal tracking-[0.2em] text-graphite"
                  initial={reduce ? {} : { opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ duration: 0.4, delay: LABEL_BASE + i * 0.12 }}
                >
                  {seg.label}
                </motion.span>
                {/* 형광펜 스와이프 */}
                <motion.span
                  aria-hidden
                  className="absolute inset-x-[-0.06em] top-[0.14em] bottom-[0.02em] -z-10 bg-marker"
                  style={{ originX: 0 }}
                  initial={reduce ? { scaleX: 1 } : { scaleX: 0 }}
                  animate={{ scaleX: 1 }}
                  transition={{
                    duration: 0.5,
                    ease: EASE_OUT_EXPO,
                    delay: SWIPE_BASE + i * SWIPE_GAP,
                  }}
                />
                {seg.name}
              </span>
              {seg.trailing}
              {i < NAMES.length - 1 && " "}
            </span>
          ))}
        </motion.h1>

        <motion.p
          className="mt-10 max-w-xl text-base leading-relaxed text-graphite md:text-lg"
          {...fadeUp(reduce, 0.45)}
        >
          숫자 더미에서 <strong className="font-semibold text-ink">형광펜 그을 한 줄</strong>을
          찾습니다. 사회적 기업 아름다운가게, 농부시장 마르쉐@의 데이터를 분석한
          대학생 데이터 분석 팀입니다.
        </motion.p>

        {/* 데이터 스트립 — 팀의 기본 수치 */}
        <motion.dl
          className="mt-8 flex flex-wrap gap-x-8 gap-y-2 font-mono text-xs text-silver"
          {...fadeUp(reduce, 0.55)}
        >
          <div className="flex gap-2">
            <dt>의뢰</dt>
            <dd className="text-ink">02건</dd>
          </div>
          <div className="flex gap-2">
            <dt>팀원</dt>
            <dd className="text-ink">03명</dd>
          </div>
          <div className="flex gap-2">
            <dt>멘토</dt>
            <dd className="text-ink">01명</dd>
          </div>
          <div className="flex gap-2">
            <dt>시즌</dt>
            <dd className="text-ink">2026</dd>
          </div>
        </motion.dl>

        <motion.div className="mt-12 flex flex-wrap gap-4" {...fadeUp(reduce, 0.65)}>
          <a
            href="#projects"
            className="border-2 border-ink px-6 py-3 text-sm font-semibold text-ink transition-colors hover:bg-marker"
          >
            프로젝트 보기
          </a>
          <a
            href="#meetings"
            className="px-2 py-3 text-sm text-graphite underline decoration-line decoration-2 underline-offset-4 transition-colors hover:decoration-marker"
          >
            활동 기록 보기
          </a>
        </motion.div>
      </div>

      {/* 스크롤 힌트 */}
      {!reduce && (
        <motion.div
          aria-hidden
          className="absolute bottom-6 left-1/2 -translate-x-1/2 font-mono text-xs text-silver"
          initial={{ opacity: 0 }}
          animate={{ opacity: [0, 1, 1, 0], y: [0, 0, 6, 6] }}
          transition={{ duration: 2, delay: 2, repeat: Infinity, repeatDelay: 1 }}
        >
          scroll ↓
        </motion.div>
      )}
    </section>
  );
}
