import { Check } from "lucide-react"

import type { Strength } from "@/lib/analysis"
import { DisclosureCard } from "./DisclosureCard"
import { ReqTag } from "./ReqTag"

/** 강점 항목 — 색은 앞 아이콘(체크 초록)에만. 접힘: 핵심 문장 + 연결 요구. 펼침: 근거. */
export function StrengthItem({ strength }: { strength: Strength }) {
  return (
    <DisclosureCard
      leading={<Check className="mt-0.5 size-5 shrink-0 text-success" />}
      title={strength.point}
      summary={<ReqTag>{strength.matched_requirement}</ReqTag>}
    >
      <p className="text-body text-text-secondary">{strength.evidence}</p>
    </DisclosureCard>
  )
}
