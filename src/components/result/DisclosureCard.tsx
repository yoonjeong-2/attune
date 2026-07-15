import { useState, type ReactNode } from "react"
import { ChevronDown } from "lucide-react"

import { cn } from "@/lib/utils"

/**
 * 점층적 공개 "리스트 항목" — 카드/그림자/액센트바 없음.
 * 항목들은 부모의 얇은 구분선(divide)으로만 나뉜다.
 * 접힘: 아이콘 + 핵심 문장 + 한 줄 요약.  펼침: 상세.
 */
export function DisclosureCard({
  leading,
  title,
  summary,
  children,
  defaultOpen = false,
}: {
  leading: ReactNode
  title: string
  summary?: ReactNode
  children: ReactNode
  defaultOpen?: boolean
}) {
  const [open, setOpen] = useState(defaultOpen)

  return (
    <div>
      <button
        type="button"
        onClick={() => setOpen((o) => !o)}
        aria-expanded={open}
        className="flex w-full items-start gap-3 py-4 text-left"
      >
        {leading}
        <div className="min-w-0 flex-1">
          <p className="text-body font-medium text-text-primary">{title}</p>
          {summary && <div className="mt-1.5">{summary}</div>}
        </div>
        <ChevronDown
          className={cn(
            "mt-0.5 size-5 shrink-0 text-text-muted/70 transition-transform duration-300 ease-out",
            open && "rotate-180"
          )}
        />
      </button>

      {/* 아코디언 (grid-rows 0fr↔1fr) */}
      <div
        className={cn(
          "grid transition-[grid-template-rows] duration-300 ease-out",
          open ? "grid-rows-[1fr]" : "grid-rows-[0fr]"
        )}
      >
        <div
          className={cn(
            "overflow-hidden transition-opacity duration-300 ease-out",
            open ? "opacity-100" : "opacity-0"
          )}
        >
          {/* pl-8: 아이콘 폭만큼 들여써서 제목 아래로 정렬 */}
          <div className="pl-8 pb-4 pt-0.5">{children}</div>
        </div>
      </div>
    </div>
  )
}
