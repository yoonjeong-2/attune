import { useState } from "react"
import { useNavigate } from "react-router-dom"
import { Check, ChevronDown, Lightbulb, RotateCcw, Sparkles, TrendingUp, Wrench } from "lucide-react"

import { ResultSection } from "@/components/result/ResultSection"
import { ResumeHighlight } from "@/components/result/ResumeHighlight"
import type { AnalysisResult, FitLevel } from "@/lib/analysis"
import { reanalysisAfterDraft, reanalysisChanges, reanalysisDemo } from "@/lib/reanalysisDemo"
import type { CareerEntry } from "@/lib/resume"
import { cn } from "@/lib/utils"

const FIT_LABEL: Record<FitLevel, string> = {
  높음: "적합도 높음",
  보통: "어느 정도 맞아요",
  낮음: "조금 더 준비가 필요해요",
}

/**
 * 재분석(2차 이상) 결과 — "성장 + 변화 중심" 화면.
 * 첫 분석과 같은 스타일(히어로 카드 1개 + 텍스트 섹션)을 따르되, 내용은 변화 요약 + 다음 방향.
 * 색은 최소로 — 히어로(옅은 보라 flat) + 아이템 앞 아이콘(초록=달라진 점 / 주황=더 채울 점)에만.
 * 전체 세부(충족 현황·하이라이팅)는 '자세히 보기'로 접어둔다.
 */
export function ReanalysisResult({
  result,
  careers,
  prevMatch,
}: {
  result: AnalysisResult
  careers: CareerEntry[]
  prevMatch: number
}) {
  const navigate = useNavigate()
  const [open, setOpen] = useState(false)
  const curr = result.overall_fit.match_score
  const delta = curr - prevMatch

  return (
    <div className="flex flex-col gap-10">
      {/* 배너 + 성장 히어로 (서로 가깝게) */}
      <div className="flex flex-col gap-3">
        {/* 배너 — 채운 박스 대신 은은한 보라 텍스트 라벨 (색 최소화) */}
        <div className="flex items-center gap-1.5 text-[#3d3a94] dark:text-primary-text">
          <RotateCcw className="size-4" />
          <span className="text-caption font-semibold">다시 분석한 결과예요</span>
        </div>

        {/* 성장 히어로 — 첫 분석 FitCard와 같은 톤(옅은 보라 flat). 배지 + 성장 + 총평을 한 카드에 */}
        <div className="rounded-card bg-[#f4f3fb] p-6 dark:bg-primary-bg sm:p-7">
          <span className="inline-flex items-center rounded-full bg-fit-mid px-3 py-1 text-caption font-semibold text-white">
            {FIT_LABEL[result.overall_fit.level]}
          </span>
          <p className="mt-3 text-caption text-text-secondary">{reanalysisChanges.growthNote}</p>
          <div className="mt-1 flex items-baseline gap-2.5">
            <span className="ls-normal text-[44px] font-bold leading-none text-[#3d3a94] dark:text-primary-text">
              {curr}%
            </span>
            {delta > 0 && <span className="ls-normal text-[22px] font-bold text-primary">▲ {delta}%</span>}
          </div>
          <p className="mt-4 text-body leading-relaxed text-text-secondary">{reanalysisChanges.verdict}</p>
        </div>
      </div>

      {/* 달라진 점 — 섹션(회색 헤더 아이콘) + 초록 Check 아이템 */}
      <ResultSection icon={TrendingUp} title="지난번과 무엇이 달라졌나요">
        <ul className="flex flex-col gap-4">
          {reanalysisChanges.improved.map((it, i) => (
            <li key={i} className="flex gap-3">
              <Check className="mt-0.5 size-5 shrink-0 text-[#1d9e75]" />
              <div>
                <p className="text-body font-semibold text-foreground">{it.title}</p>
                <p className="mt-0.5 text-caption leading-relaxed text-text-secondary">{it.note}</p>
              </div>
            </li>
          ))}
        </ul>
      </ResultSection>

      {/* 더 채울 점 — 섹션(회색 헤더 아이콘) + 주황 Lightbulb 아이템 */}
      <ResultSection icon={Wrench} title="이런 점을 더 채우면 좋아요">
        <ul className="flex flex-col gap-4">
          {reanalysisChanges.toFill.map((it, i) => (
            <li key={i} className="flex gap-3">
              <Lightbulb className="mt-0.5 size-5 shrink-0 text-[#ef9f27]" />
              <div>
                <p className="text-body font-semibold text-foreground">{it.title}</p>
                <p className="mt-0.5 text-caption leading-relaxed text-text-secondary">{it.note}</p>
              </div>
            </li>
          ))}
        </ul>
      </ResultSection>

      {/* 자세히 보기 — 구분선으로 요약↔상세 구분. 박스/그림자 없이, 커서(포인터)로 클릭 가능함을 알림 */}
      <div className="border-t border-border pt-8">
        <button
          type="button"
          onClick={() => setOpen((v) => !v)}
          aria-expanded={open}
          className="group flex w-full cursor-pointer items-center justify-between gap-3 text-left"
        >
          <span className="text-body font-semibold text-foreground transition-colors group-hover:text-black dark:group-hover:text-white">
            전체 분석 자세히 보기
          </span>
          <ChevronDown className={cn("size-6 shrink-0 text-primary transition-transform", open && "rotate-180")} />
        </button>
        {open && (
          <div className="mt-6">
            <ResumeHighlight result={result} careers={careers} showFit={false} />
          </div>
        )}
      </div>

      {/* 하단 액션 */}
      <div className="flex flex-col items-center gap-4">
        <button
          type="button"
          onClick={() =>
            navigate("/", {
              state: {
                prefill: reanalysisAfterDraft,
                reanalysisPreset: result,
                reanalysisPrev: reanalysisDemo.before.matchRate,
              },
            })
          }
          className="btn-analyze inline-flex h-12 items-center justify-center gap-2 rounded-chip px-8 text-body font-semibold text-white transition-[filter] hover:brightness-[1.04] active:scale-[0.99] [&_svg]:size-5 [&_svg]:shrink-0"
        >
          <Sparkles />
          한 번 더 보완해서 분석하기
        </button>
        <button
          type="button"
          onClick={() => navigate("/", { state: { prefill: { resume: reanalysisAfterDraft.resume, job: "" } } })}
          className="inline-flex items-center gap-1 text-caption text-text-muted underline underline-offset-2 transition-colors hover:text-text-secondary"
        >
          <RotateCcw className="size-3.5" />
          다른 공고로 분석하기
        </button>
      </div>
    </div>
  )
}
