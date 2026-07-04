import Link from "next/link";

export default function NotFound() {
  return (
    <div className="flex min-h-svh flex-col items-center justify-center px-5 pt-16 text-center">
      <p className="font-mono text-xs uppercase tracking-[0.2em] text-silver">404 — not found</p>
      <h1 className="mt-4 font-display text-[clamp(2rem,6vw,4rem)] font-extrabold text-ink">
        이 데이터는 결측치네요
      </h1>
      <p className="mt-4 text-graphite">찾으시는 페이지가 없습니다. 홈에서 다시 시작해 주세요.</p>
      <Link
        href="/"
        className="mt-8 border-2 border-ink px-6 py-3 text-sm font-semibold text-ink transition-colors hover:bg-marker"
      >
        홈으로
      </Link>
    </div>
  );
}
