import { Target } from "lucide-react"

/** "연결 공고 요구" — 12px 회색 평문 (배지 배경 없이, 미니멀). 강점·보완점 공통. */
export function ReqTag({ children }: { children: React.ReactNode }) {
  return (
    <span className="inline-flex items-center gap-1 text-badge text-text-secondary">
      <Target className="size-3 shrink-0 text-text-muted/70" />
      {children}
    </span>
  )
}
