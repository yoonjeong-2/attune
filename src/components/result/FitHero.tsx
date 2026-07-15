import type { FitLevel } from "@/lib/analysis"
import { cn } from "@/lib/utils"

/**
 * 적합도 히어로 — 총평이 주인공.
 * - 적합도 색은 보라 계열(높음/보통/낮음), 배경은 그 옅은 톤.
 * - 등급은 큰 글자 대신 "작은 색 배지"로 (자존감 배려). 낮음은 부드러운 문구.
 * - 총평을 크게, 핵심 구절만 굵게+진하게 강조.
 */
const FIT: Record<FitLevel, { label: string; badge: string; tint: string }> = {
  높음: { label: "적합도 높음", badge: "bg-fit-high", tint: "bg-fit-high-bg" },
  보통: { label: "어느 정도 맞아요", badge: "bg-fit-mid", tint: "bg-fit-mid-bg" },
  낮음: { label: "조금 더 준비가 필요해요", badge: "bg-fit-low", tint: "bg-[#f1f2f4] dark:bg-fit-low-bg" },
}

export function FitHero({
  level,
  summary,
  matchScore,
  highlight,
}: {
  level: FitLevel
  summary: string
  matchScore: number
  highlight: string
}) {
  const c = FIT[level]
  const isLow = level === "낮음"

  // 총평에서 핵심 구절만 강조 (highlight 는 summary 의 부분 문자열)
  const at = highlight ? summary.indexOf(highlight) : -1
  const emphasized =
    at === -1 ? null : { before: summary.slice(0, at), key: highlight, after: summary.slice(at + highlight.length) }

  return (
    <div className={cn("rounded-hero p-6 sm:p-8 dark:ring-1 dark:ring-white/10", c.tint)}>
      {/* 등급 = 작은 배지 + 매칭 점수(작게) */}
      <div className="flex flex-wrap items-center gap-2">
        <span className={cn("inline-flex items-center rounded-full px-3 py-1 text-caption font-semibold text-white", c.badge)}>
          {c.label}
        </span>
        <span className="text-caption text-text-muted">
          AI 매칭 <span className="ls-normal">{`${matchScore}%`}</span>
        </span>
      </div>

      {/* 총평 — 주인공. 핵심 구절만 굵게+진하게, 나머지는 톤 다운 */}
      <p className="mt-4 text-[1.25rem] leading-[1.5]">
        {emphasized ? (
          <>
            <span className="text-text-secondary">{emphasized.before}</span>
            <b className={cn("font-bold", isLow ? "text-[#5a6270]" : "text-foreground")}>{emphasized.key}</b>
            <span className="text-text-secondary">{emphasized.after}</span>
          </>
        ) : (
          <span className="text-text-secondary">{summary}</span>
        )}
      </p>
    </div>
  )
}
