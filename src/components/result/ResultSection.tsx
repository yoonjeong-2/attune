import type { LucideIcon } from "lucide-react"

import { cn } from "@/lib/utils"

/** 결과 화면의 한 섹션 — 일관된 H2 제목·아이콘·여백 (디자인가이드 §2-2). */
export function ResultSection({
  icon: Icon,
  title,
  count,
  accent,
  children,
}: {
  icon: LucideIcon
  title: string
  count?: number
  accent?: string
  children: React.ReactNode
}) {
  return (
    <section className="flex flex-col gap-3.5">
      <div className="flex items-center gap-2">
        <Icon className={cn("size-5", accent ?? "text-text-muted")} />
        <h2 className="text-h2 font-semibold">{title}</h2>
        {count != null && count > 0 && (
          <span className="text-body font-normal text-text-muted">{count}</span>
        )}
      </div>
      {children}
    </section>
  )
}
