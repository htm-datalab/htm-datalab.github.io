"use client";

// 시그니처 Hero — 팀명 디코딩: "혜빈이 택한 민정" 각 이름 뒤에
// 리포트에 첨부된 사진처럼 기울어진 흑백 인물 사진이 깔리고,
// 형광펜이 사진 위를 가로질러 그어지며 이름이 드러난다. design.md 1장.
import { motion, useReducedMotion } from "motion/react";
import type { Member } from "@/lib/content";
import { EASE_OUT_EXPO } from "@/components/motion/Reveal";

const NAMES = [
  { name: "혜빈", label: "", trailing: "이", tilt: "rotate-[-2.5deg]" },
  { name: "택한", label: "", trailing: "", tilt: "rotate-[1.5deg]" },
  { name: "민정", label: "", trailing: "", tilt: "rotate-[-1.5deg]" },
] as const;

// 등장 순서: 문장(0.1s) → 형광펜 3획(0.7s~) → 사진(각 획 직후) → 라벨(1.5s~) → 나머지
const SWIPE_BASE = 0.7;
const SWIPE_GAP = 0.22;
const PHOTO_BASE = 0.95;
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

export function Hero({ members }: { members: Member[] }) {
  const reduce = useReducedMotion() ?? false;
  const memberByName = new Map(members.map((m) => [m.name, m]));

  return (
    <section
      aria-label="팀 소개"
      className="relative flex min-h-svh flex-col justify-center overflow-hidden"
    >
      <div className="mx-auto w-full max-w-6xl px-5 pt-24 pb-16 text-center lg:px-8">
        <motion.p
          className="font-mono text-xs uppercase tracking-[0.2em] text-silver"
          {...fadeUp(reduce, 0.1)}
        >
          대학생 데이터 분석 팀
        </motion.p>

        {/* 팀명 디코딩. 위 여백은 이름 뒤로 솟는 사진 + 라벨 자리 (em = 제목 글자 크기 비례) */}
        <motion.h1
          className="mt-[1.3em] flex flex-col items-center gap-y-[1.25em] font-display text-[clamp(2.75rem,9vw,6.75rem)] font-extrabold leading-[1.1] tracking-[-0.03em] text-ink sm:flex-row sm:justify-center sm:gap-x-[0.35em] sm:gap-y-0"
          {...fadeUp(reduce, 0.2)}
        >
          {NAMES.map((seg, i) => {
            const photo = memberByName.get(seg.name)?.photo;
            return (
              <span key={seg.name} className="whitespace-nowrap">
                <span className="group/name relative isolate inline-block">
                  {/* 이름 라벨 — 형광펜이 그어진 뒤 나타난다. 사진 위 여백에 배치 */}
                  {/* flex — h1의 행간을 상속한 라인 박스가 라벨을 아래로 끌어내리지 않게 */}
                  <motion.span
                    aria-hidden
                    className="absolute -top-[1em] left-1/2 flex -translate-x-1/2"
                    initial={reduce ? {} : { opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ duration: 0.4, delay: LABEL_BASE + i * 0.12 }}
                  >
                    <span className="whitespace-nowrap font-mono text-[max(0.6875rem,0.14em)] font-normal tracking-[0.2em] text-graphite">
                      {seg.label}
                    </span>
                  </motion.span>
                  {/* 인물 사진 — 리포트에 붙인 인화 사진 (기울기 + paper 테두리, 흑백) */}
                  {photo && (
                    <span
                      aria-hidden
                      className={`absolute bottom-[-0.12em] left-1/2 -z-20 w-[1.32em] -translate-x-1/2 ${seg.tilt}`}
                    >
                      <motion.img
                        src={photo}
                        alt=""
                        className="aspect-[3/4] w-full border-[0.03em] border-paper object-cover grayscale transition-[filter] duration-[450ms] group-hover/name:grayscale-0"
                        initial={reduce ? {} : { opacity: 0, y: 16 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{
                          duration: 0.5,
                          ease: EASE_OUT_EXPO,
                          delay: PHOTO_BASE + i * SWIPE_GAP,
                        }}
                      />
                    </span>
                  )}
                  {/* 형광펜 스와이프 — 사진 위를 가로질러 긋는다 */}
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
              </span>
            );
          })}
        </motion.h1>

        <motion.p
          className="mx-auto mt-10 max-w-xl text-base leading-relaxed text-graphite md:text-lg"
          {...fadeUp(reduce, 0.45)}
        >
          방대한 데이터에 <strong className="font-semibold text-ink">형광펜 한 줄</strong>을
          긋습니다.<br></br><strong className="font-semibold text-ink">남을 돕는 사람을 돕는</strong> 대학생, 혜빈이택한민정 입니다.
        </motion.p>

        {/* 데이터 스트립 — 팀의 기본 수치, 리포트 푸터처럼 한 줄 */}
        <motion.dl
          className="mt-8 flex flex-wrap justify-center gap-y-1 font-mono text-xs text-silver sm:divide-x sm:divide-line"
          {...fadeUp(reduce, 0.55)}
        >
          <div className="flex gap-2 px-4">
            <dt>의뢰</dt>
            <dd className="text-ink">02건</dd>
          </div>
          <div className="flex gap-2 px-4">
            <dt>팀원</dt>
            <dd className="text-ink">03명</dd>
          </div>
          <div className="flex gap-2 px-4">
            <dt>멘토</dt>
            <dd className="text-ink">01명</dd>
          </div>
          <div className="flex gap-2 px-4">
            <dt>시즌</dt>
            <dd className="text-ink">2026</dd>
          </div>
        </motion.dl>

        <motion.div
          className="mt-12 flex flex-wrap justify-center gap-4"
          {...fadeUp(reduce, 0.65)}
        >
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
