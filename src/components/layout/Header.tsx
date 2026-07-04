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

  // 모바일 메뉴: 열리면 스크롤 잠금 + Escape로 닫기 + 첫 링크로 포커스
  useEffect(() => {
    if (!open) return;
    document.body.style.overflow = "hidden";
    firstLinkRef.current?.focus();
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") setOpen(false);
    };
    window.addEventListener("keydown", onKey);
    return () => {
      document.body.style.overflow = "";
      window.removeEventListener("keydown", onKey);
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

      {/* 모바일 오버레이 메뉴 */}
      <AnimatePresence>
        {open && (
          <motion.nav
            id="mobile-menu"
            aria-label="모바일 메뉴"
            className="fixed inset-x-0 top-16 bottom-0 z-40 bg-paper px-5 pt-6 md:hidden"
            initial={reduce ? { opacity: 1 } : { opacity: 0, y: -8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={reduce ? { opacity: 0 } : { opacity: 0, y: -8 }}
            transition={{ duration: 0.2 }}
          >
            <ul>
              {NAV.map((item, i) => (
                <li key={item.label} className="border-b border-line">
                  <Link
                    ref={i === 0 ? firstLinkRef : undefined}
                    href={linkHref(item)}
                    onClick={() => setOpen(false)}
                    className="block py-4 font-display text-2xl font-semibold text-ink"
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
