"use client";

// 미팅 기록 캘린더 — "모눈종이 기록지". 월 전환 + 미팅 날 형광펜 도트,
// 날짜 선택 시 아래에 장부(ledger)식 상세 카드. design.md 6장.
import { useMemo, useState } from "react";
import { motion, useReducedMotion } from "motion/react";
import type { Meeting } from "@/lib/content";

const WEEKDAYS = ["일", "월", "화", "수", "목", "금", "토"] as const;

/** "2026-07-03" → "2026-07" (ISO 형식이라 문자열 비교로 정렬 가능) */
function monthKeyOf(date: string) {
  return date.slice(0, 7);
}

function shiftMonth(key: string, delta: number) {
  const [y, m] = key.split("-").map(Number);
  const d = new Date(y, m - 1 + delta, 1);
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}`;
}

function formatMonth(key: string) {
  const [y, m] = key.split("-");
  return `${y}. ${m}`;
}

export function MeetingsCalendar({ meetings }: { meetings: Meeting[] }) {
  const reduce = useReducedMotion() ?? false;

  const { byDate, datesAsc, minMonth, maxMonth } = useMemo(() => {
    const byDate = new Map<string, Meeting[]>();
    for (const m of meetings) {
      byDate.set(m.date, [...(byDate.get(m.date) ?? []), m]);
    }
    const datesAsc = [...byDate.keys()].sort();
    return {
      byDate,
      datesAsc,
      minMonth: monthKeyOf(datesAsc[0]),
      maxMonth: monthKeyOf(datesAsc[datesAsc.length - 1]),
    };
  }, [meetings]);

  // 초기 화면: 가장 최근 기록이 있는 달 + 그 날짜 선택
  const latestDate = datesAsc[datesAsc.length - 1];
  const [viewMonth, setViewMonth] = useState(() => monthKeyOf(latestDate));
  const [selectedDate, setSelectedDate] = useState<string | null>(latestDate);

  function goTo(delta: number) {
    const next = shiftMonth(viewMonth, delta);
    if (next < minMonth || next > maxMonth) return;
    setViewMonth(next);
    // 상세 패널이 비지 않게 그 달의 첫 미팅을 자동 선택
    setSelectedDate(datesAsc.find((d) => monthKeyOf(d) === next) ?? null);
  }

  // 월 그리드 계산 — 날짜 문자열을 직접 new Date()에 넣지 않는다 (UTC 오프셋 이슈)
  const [year, month] = viewMonth.split("-").map(Number);
  const firstWeekday = new Date(year, month - 1, 1).getDay();
  const daysInMonth = new Date(year, month, 0).getDate();
  const totalCells = Math.ceil((firstWeekday + daysInMonth) / 7) * 7;

  const selectedMeetings = selectedDate ? (byDate.get(selectedDate) ?? []) : [];

  return (
    <div className="mx-auto max-w-2xl">
      {/* 월 헤더 */}
      <div className="flex items-center justify-center gap-2">
        <button
          type="button"
          onClick={() => goTo(-1)}
          disabled={viewMonth <= minMonth}
          aria-label="이전 달"
          className="flex size-11 items-center justify-center font-mono text-lg text-silver transition-colors hover:text-marker disabled:opacity-30 disabled:hover:text-silver"
        >
          ←
        </button>
        <p className="w-28 text-center font-mono text-lg tracking-[0.15em] text-paper">
          {formatMonth(viewMonth)}
        </p>
        <button
          type="button"
          onClick={() => goTo(1)}
          disabled={viewMonth >= maxMonth}
          aria-label="다음 달"
          className="flex size-11 items-center justify-center font-mono text-lg text-silver transition-colors hover:text-marker disabled:opacity-30 disabled:hover:text-silver"
        >
          →
        </button>
      </div>

      {/* 모눈종이 그리드 — gap-px 사이로 배경색이 비쳐 헤어라인이 된다 */}
      <div className="mt-5 grid grid-cols-7 gap-px border border-graphite/50 bg-graphite/50">
        {WEEKDAYS.map((w) => (
          <div
            key={w}
            className="bg-carbon py-2 text-center font-mono text-[0.6875rem] text-silver"
          >
            {w}
          </div>
        ))}
        {Array.from({ length: totalCells }, (_, idx) => {
          const day = idx - firstWeekday + 1;
          if (day < 1 || day > daysInMonth) {
            return <div key={idx} aria-hidden className="min-h-12 bg-carbon md:min-h-14" />;
          }
          const date = `${viewMonth}-${String(day).padStart(2, "0")}`;
          const dayMeetings = byDate.get(date);
          if (!dayMeetings) {
            return (
              <div key={idx} className="min-h-12 bg-carbon p-1.5 md:min-h-14">
                <span className="font-mono text-[0.6875rem] text-silver/50">{day}</span>
              </div>
            );
          }
          const selected = date === selectedDate;
          const done = dayMeetings.every((m) => m.done);
          return (
            <button
              key={idx}
              type="button"
              onClick={() => setSelectedDate(date)}
              aria-pressed={selected}
              aria-label={`${month}월 ${day}일 — ${dayMeetings.map((m) => m.title).join(", ")}`}
              className={`group relative min-h-12 p-1.5 text-left transition-colors md:min-h-14 ${
                selected ? "bg-marker" : "bg-carbon"
              }`}
            >
              <span
                className={`font-mono text-[0.6875rem] ${
                  selected
                    ? "font-semibold text-ink"
                    : "text-paper group-hover:text-marker"
                }`}
              >
                {day}
              </span>
              {/* 미팅 도트 — 완료는 채움, 예정은 외곽선 (타임라인 도트 의미 계승) */}
              <span
                aria-hidden
                className={`absolute bottom-1.5 left-1/2 size-1.5 -translate-x-1/2 rounded-full md:size-2 ${
                  done
                    ? selected
                      ? "bg-ink"
                      : "bg-marker"
                    : selected
                      ? "border border-ink"
                      : "border border-silver"
                }`}
              />
            </button>
          );
        })}
      </div>

      {/* 범례 */}
      <p className="mt-3 flex justify-center gap-6 font-mono text-[0.6875rem] text-silver">
        <span className="flex items-center gap-2">
          <span aria-hidden className="size-1.5 rounded-full bg-marker" />
          완료
        </span>
        <span className="flex items-center gap-2">
          <span aria-hidden className="size-1.5 rounded-full border border-silver" />
          예정
        </span>
      </p>

      {/* 선택한 날짜의 상세 — 장부(ledger) 카드 */}
      <div aria-live="polite" className="mt-6">
        <motion.div
          key={selectedDate ?? viewMonth}
          initial={reduce ? false : { opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.25 }}
          className="space-y-3"
        >
          {selectedMeetings.length > 0 ? (
            selectedMeetings.map((m) => (
              <article
                key={`${m.date}-${m.title}`}
                className="border border-graphite/60 p-5 text-left md:p-6"
              >
                <div className="flex flex-wrap items-center gap-x-3 gap-y-1">
                  <span
                    aria-hidden
                    className={`size-2.5 rounded-full ${
                      m.done ? "bg-marker" : "border border-silver"
                    }`}
                  />
                  <time dateTime={m.date} className="font-mono text-xs text-silver">
                    {m.date}
                  </time>
                  <span className="rounded-full border border-graphite px-2 py-0.5 font-mono text-[0.6875rem] text-silver">
                    {m.type}
                  </span>
                  {!m.done && (
                    <span className="font-mono text-[0.6875rem] text-silver">예정</span>
                  )}
                </div>
                <h3 className="mt-1.5 text-base font-semibold text-paper">{m.title}</h3>
                <p className="mt-1 text-sm leading-relaxed text-[#a3a3a0]">{m.memo}</p>
              </article>
            ))
          ) : (
            <p className="py-6 text-center font-mono text-sm text-silver">
              이 달의 기록이 없습니다
            </p>
          )}
        </motion.div>
      </div>
    </div>
  );
}
