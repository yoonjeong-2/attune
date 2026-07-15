import { Lightbulb } from "lucide-react"

import type { Severity, Weakness } from "@/lib/analysis"
import { DisclosureCard } from "./DisclosureCard"
import { ReqTag } from "./ReqTag"

/** 심각도 3단계 라벨 (§5) — 색 없이 회색으로. 펼침 안에서만. */
const SEVERITY_LABEL: Record<Severity, string> = {
  critical: "꼭 챙겨요",
  recommended: "챙기면 좋아요",
  enhancement: "더 돋보이기",
}

/** 보완점 항목 — 색은 앞 아이콘(전구 주황)에만. 강점과 대칭 구조. */
export function WeaknessItem({ weakness }: { weakness: Weakness }) {
  return (
    <DisclosureCard
      leading={<Lightbulb className="mt-0.5 size-5 shrink-0 text-warning" />}
      title={weakness.point}
      summary={<ReqTag>{weakness.matched_requirement}</ReqTag>}
    >
      <div className="flex flex-col">
        <p className="text-caption text-text-muted">{SEVERITY_LABEL[weakness.severity]}</p>
        {/* 근거는 박스 없이 그대로 (맥락) — 박스와의 간격 12px */}
        <p className="mt-2 text-body text-text-secondary">{weakness.reason}</p>
        {/* 개선 제안만 은은한 회색 박스로. 여백을 조여 짜임새 있게(꽉 찬 느낌) */}
        <div className="mt-3 rounded-[10px] bg-[#f5f5f7] px-[14px] py-[12px] dark:bg-white/[0.05]">
          <p className="text-caption font-semibold leading-snug text-text-primary">이렇게 해보면 좋아요</p>
          <p className="mt-[4px] text-body leading-[1.5] text-text-secondary">{weakness.suggestion}</p>
        </div>
      </div>
    </DisclosureCard>
  )
}
