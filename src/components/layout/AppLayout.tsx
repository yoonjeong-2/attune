import { Link, Outlet } from "react-router-dom"

import { Logo } from "@/components/Logo"
import { ThemeToggle } from "@/components/ThemeToggle"

/**
 * 공통 레이아웃 — 미니멀 헤더(제목=홈 링크 + 테마 토글) + 본문.
 * 주 네비게이션(분석하기/아카이브)은 각 화면 상단(타이틀 위)의 세그먼트 토글로 처리한다.
 */
export function AppLayout() {
  return (
    <div className="min-h-dvh bg-background text-foreground">
      <header className="sticky top-0 z-10 border-b border-border bg-background/80 backdrop-blur">
        <div className="mx-auto flex max-w-5xl items-center justify-between gap-3 px-4 py-3 sm:px-6">
          <Link
            to="/"
            aria-label="attune 홈으로"
            className="inline-flex items-center transition-opacity hover:opacity-70"
          >
            <Logo className="h-[17px] w-auto" />
          </Link>
          <ThemeToggle />
        </div>
      </header>

      <main className="mx-auto max-w-5xl px-4 py-8 sm:px-6 sm:py-12">
        <Outlet />
      </main>
    </div>
  )
}
