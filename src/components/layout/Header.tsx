"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useRef, useState } from "react";
import { AnimatePresence, motion, useReducedMotion } from "motion/react";

// 홈 섹션은 앵커, 블로그/갤러리는 라우트.
const NAV = [
  { label: "팀", anchor: "#team" },
  { label: "프로젝트", anchor: "#projects" },
  { label: "기록", anchor: "#meetings" },
  { label: "블로그", href: "/blog/" },
  { label: "갤러리", href: "/gallery/" },
] as const;

export function Header() {
  const pathname = usePathname();
  const isHome = pathname === "/";
  const [scrolled, setScrolled] = useState(false);
  const [open, setOpen] = useState(false);
  const firstLinkRef = useRef<HTMLAnchorElement>(null);
  const reduce = useReducedMotion();

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 8);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  // 모바일 메뉴: Escape·바깥 클릭으로 닫기 + 첫 링크로 포커스.
  // 컴팩트 드롭다운이라 스크롤 잠금은 하지 않는다 (잠그면 스크롤바가 사라지며 레이아웃이 밀린다).
  const headerRef = useRef<HTMLElement>(null);
  useEffect(() => {
    if (!open) return;
    firstLinkRef.current?.focus();
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") setOpen(false);
    };
    const onPointerDown = (e: PointerEvent) => {
      if (!headerRef.current?.contains(e.target as Node)) setOpen(false);
    };
    window.addEventListener("keydown", onKey);
    document.addEventListener("pointerdown", onPointerDown);
    return () => {
      window.removeEventListener("keydown", onKey);
      document.removeEventListener("pointerdown", onPointerDown);
    };
  }, [open]);

  // 라우트가 바뀌면 메뉴 닫기 (렌더 중 상태 보정 패턴)
  const [prevPathname, setPrevPathname] = useState(pathname);
  if (prevPathname !== pathname) {
    setPrevPathname(pathname);
    setOpen(false);
  }

  const linkHref = (item: (typeof NAV)[number]) =>
    "href" in item ? item.href : isHome ? item.anchor : `/${item.anchor}`;

  const isActive = (item: (typeof NAV)[number]) =>
    "href" in item && pathname.startsWith(item.href.replace(/\/$/, ""));

  return (
    <header
      ref={headerRef}
      className={`fixed inset-x-0 top-0 z-50 transition-colors duration-300 ${
        scrolled || open
          ? "border-b border-line bg-paper/85 backdrop-blur-md"
          : "border-b border-transparent bg-transparent"
      }`}
    >
      <div className="mx-auto flex h-16 max-w-6xl items-center justify-between px-5 lg:px-8">
        <Link
          href="/"
          className="font-display text-[0.9375rem] font-semibold text-ink"
          aria-label="Team. 혜빈이택한민정 — 홈으로"
        >
          Team.<span className="text-graphite">혜빈이택한민정</span>
        </Link>

        {/* 데스크톱 네비 */}
        <nav aria-label="주 메뉴" className="hidden md:block">
          <ul className="flex items-center gap-6">
            {NAV.map((item) => (
              <li key={item.label}>
                <Link
                  href={linkHref(item)}
                  className={`px-1 py-1 text-sm transition-colors hover:bg-marker hover:text-ink ${
                    isActive(item)
                      ? "font-semibold text-ink underline decoration-marker decoration-4 underline-offset-8"
                      : "text-graphite"
                  }`}
                >
                  {item.label}
                </Link>
              </li>
            ))}
          </ul>
        </nav>

        {/* 모바일 햄버거 */}
        <button
          type="button"
          className="flex h-11 w-11 flex-col items-center justify-center gap-1.5 md:hidden"
          aria-expanded={open}
          aria-controls="mobile-menu"
          aria-label={open ? "메뉴 닫기" : "메뉴 열기"}
          onClick={() => setOpen((v) => !v)}
        >
          <span
            className={`h-0.5 w-6 bg-ink transition-transform duration-200 ${
              open ? "translate-y-1 rotate-45" : ""
            }`}
          />
          <span
            className={`h-0.5 w-6 bg-ink transition-transform duration-200 ${
              open ? "-translate-y-1 -rotate-45" : ""
            }`}
          />
        </button>
      </div>

      {/* 모바일 드롭다운 메뉴 — 헤더 기준 absolute (fixed는 backdrop-blur가 containing block을
          만들어 높이가 붕괴하므로 금지). 불투명 paper 배경 + 컴팩트 카드. */}
      <AnimatePresence>
        {open && (
          <motion.nav
            id="mobile-menu"
            aria-label="모바일 메뉴"
            className="absolute right-4 top-full mt-2 w-44 overflow-hidden rounded-lg border border-line bg-paper shadow-[0_8px_24px_rgba(22,22,22,0.1)] md:hidden"
            initial={reduce ? { opacity: 1 } : { opacity: 0, y: -6 }}
            animate={{ opacity: 1, y: 0 }}
            exit={reduce ? { opacity: 0 } : { opacity: 0, y: -6 }}
            transition={{ duration: 0.18 }}
          >
            <ul className="divide-y divide-line">
              {NAV.map((item, i) => (
                <li key={item.label}>
                  <Link
                    ref={i === 0 ? firstLinkRef : undefined}
                    href={linkHref(item)}
                    onClick={() => setOpen(false)}
                    className={`block px-4 py-3 text-sm ${
                      isActive(item)
                        ? "font-semibold text-ink underline decoration-marker decoration-4 underline-offset-4"
                        : "text-ink"
                    }`}
                  >
                    {item.label}
                  </Link>
                </li>
              ))}
            </ul>
          </motion.nav>
        )}
      </AnimatePresence>
    </header>
  );
}
