import { useLocation, useNavigate } from "react-router-dom"

import { cn } from "@/lib/utils"

const TABS = [
  { label: "분석하기", path: "/" },
  { label: "아카이브", path: "/archive" },
]

/**
 * 상단 2탭 세그먼트 토글 (밑줄 탭 아님).
 * 회색 배경(#F2F2F5) 안에 두 탭, 선택된 탭만 흰색 알약으로 떠오름(살짝 그림자).
 * 분석하기 → "/", 아카이브 → "/archive".
 */
export function TabSwitch() {
  const navigate = useNavigate()
  const { pathname } = useLocation()
  // 아카이브 = /archive, 분석하기 = 그 외 전부(입력→분석→결과 흐름 포함)
  const isArchive = pathname === "/archive"

  return (
    <div className="flex justify-center">
      <div className="inline-flex rounded-full bg-[#f2f2f5] p-1 dark:bg-white/[0.06]">
        {TABS.map((t) => {
          const active = t.path === "/archive" ? isArchive : !isArchive
          return (
            <button
              key={t.path}
              type="button"
              onClick={() => navigate(t.path)}
              aria-current={active ? "page" : undefined}
              className={cn(
                "rounded-full px-5 py-1.5 text-caption font-medium transition-colors",
                active
                  ? "bg-card text-foreground shadow-sm" // 선택: 흰 알약 + 살짝 그림자
                  : "text-text-secondary hover:text-foreground"
              )}
            >
              {t.label}
            </button>
          )
        })}
      </div>
    </div>
  )
}
