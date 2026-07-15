import { Navigate, useLocation, useNavigate } from "react-router-dom"
import { ClipboardList, RotateCcw, Sparkles, ThumbsUp, Wrench } from "lucide-react"

import { FitHero } from "@/components/result/FitHero"
import { JobRequirements } from "@/components/result/JobRequirements"
import { ResultSection } from "@/components/result/ResultSection"
import { ReanalysisResult } from "@/components/result/ReanalysisResult"
import { ResumeHighlight } from "@/components/result/ResumeHighlight"
import { SaveToArchive } from "@/components/result/SaveToArchive"
import { StrengthItem } from "@/components/result/StrengthItem"
import { WeaknessItem } from "@/components/result/WeaknessItem"
import type { AnalysisResult } from "@/lib/analysis"
import { emptyResumeForm, type ResumeForm } from "@/lib/resume"

/**
 * 화면 3 · 결과 (핵심 화면, CLAUDE.md §7)
 * - 이력서 담당업무에 매칭되는 근거 구절(source_quote)이 있으면 → 좌우 2분할 하이라이팅 뷰
 *   (오른쪽에 적합도·공고요구 sticky, 왼쪽에 이력서+하이라이트).
 * - 없으면 → 기존 단일 컬럼(적합도 → 공고요구 → 강점/보완점).
 * - 결과 화면의 DEMO 케이스 전환 탭은 제거(입력 화면에만 유지).
 */
export default function ResultPage() {
  const navigate = useNavigate()
  const location = useLocation()
  const state = location.state as {
    result?: AnalysisResult
    resume?: ResumeForm
    job?: string
    reanalysisPrev?: number
  } | null
  const result = state?.result
  // 하이라이팅용 이력서 원문(담당업무) — 분석 화면에서 함께 넘어옴
  const resume = state?.resume
  // 재분석/다른 공고로 이어갈 때 입력 프리필에 쓸 공고 원문
  const job = state?.job
  // 재분석 진입 시 이전 매칭 점수 (있으면 재분석 결과 — 배너 + 상승폭 표시)
  const reanalysisPrev = state?.reanalysisPrev

  // 결과 없이 직접 들어온 경우 입력으로.
  if (!result) return <Navigate to="/" replace />

  const { overall_fit, job_requirements, strengths, weaknesses } = result
  const careers = resume?.careers ?? []

  // 재분석(2차 이상)은 첫 분석과 다른 '성장·변화 중심' 별도 화면으로.
  if (reanalysisPrev != null) {
    return (
      <div className="mx-auto w-full max-w-2xl">
        <ReanalysisResult result={result} careers={careers} prevMatch={reanalysisPrev} />
      </div>
    )
  }

  // --- 이하 첫 분석(1차) 결과 화면 (기존) ---
  // 담당업무 원문에 실제로 매칭되는 source_quote가 하나라도 있을 때만 하이라이팅 뷰
  const allWork = careers.map((c) => c.work).join("\n")
  const quotes = [...strengths, ...weaknesses]
    .map((x) => x.source_quote)
    .filter((q): q is string => Boolean(q))
  const showHighlight = careers.length > 0 && quotes.some((q) => allWork.includes(q))

  // 다음 행동으로 이어갈 때 현재 이력서를 그대로 실어 보낸다 (보완=같은 공고 / 다른 공고=공고 비움)
  const prefillResume = resume ?? emptyResumeForm()

  // 상단 우측: 아카이브 저장 북마크
  const topRow = (
    <div className="flex justify-end">
      <SaveToArchive result={result} careers={careers} resume={resume} job={job} />
    </div>
  )

  // 하단: 재분석 주 버튼(보라 그라데이션) + 최하단 '다른 공고' 약한 링크
  const footerActions = (
    <div className="flex flex-col items-center gap-4">
      <button
        type="button"
        onClick={() => navigate("/", { state: { prefill: { resume: prefillResume, job: job ?? "" } } })}
        className="btn-analyze inline-flex h-12 items-center justify-center gap-2 rounded-chip px-8 text-body font-semibold text-white transition-[filter] hover:brightness-[1.04] active:scale-[0.99] [&_svg]:size-5 [&_svg]:shrink-0"
      >
        <Sparkles />
        보완해서 다시 분석하기
      </button>
      <button
        type="button"
        onClick={() => navigate("/", { state: { prefill: { resume: prefillResume, job: "" } } })}
        className="inline-flex items-center gap-1 text-caption text-text-muted underline underline-offset-2 transition-colors hover:text-text-secondary"
      >
        <RotateCcw className="size-3.5" />
        다른 공고로 분석하기
      </button>
    </div>
  )

  // 하이라이팅 케이스 — 좌우 2분할
  if (showHighlight) {
    return (
      <div className="mx-auto w-full max-w-3xl">
        <div className="mb-6">{topRow}</div>
        <ResumeHighlight result={result} careers={careers} />
        <div className="mt-10">{footerActions}</div>
      </div>
    )
  }

  // 하이라이팅 없는 케이스 — 기존 단일 컬럼 (DEMO 탭 없음)
  return (
    <div className="mx-auto flex w-full max-w-2xl flex-col gap-10">
      {topRow}
      <FitHero
        level={overall_fit.level}
        summary={overall_fit.summary}
        matchScore={overall_fit.match_score}
        highlight={overall_fit.highlight}
      />

      <ResultSection icon={ClipboardList} title="공고 핵심 요구">
        <JobRequirements
          mustHave={job_requirements.must_have}
          niceToHave={job_requirements.nice_to_have}
        />
      </ResultSection>

      <ResultSection icon={ThumbsUp} title="강점" count={strengths.length}>
        {strengths.length === 0 ? (
          <p className="text-body text-text-secondary">이 공고 기준으로 크게 두드러지는 강점은 아직 안 보여요.</p>
        ) : (
          <div className="divide-y divide-[#eeeef2] dark:divide-white/[0.08]">
            {strengths.map((s, i) => (
              <StrengthItem key={i} strength={s} />
            ))}
          </div>
        )}
      </ResultSection>

      <ResultSection icon={Wrench} title="보완점" count={weaknesses.length}>
        {weaknesses.length === 0 ? (
          <div className="py-1">
            <p className="text-body font-medium text-text-primary">크게 걸리는 약점은 없어요</p>
            <p className="mt-1 text-body text-text-secondary">
              이 공고에 잘 맞는 서류예요. 강점을 살려서 자신 있게 지원해보세요!
            </p>
          </div>
        ) : (
          <div className="divide-y divide-[#eeeef2] dark:divide-white/[0.08]">
            {weaknesses.map((w, i) => (
              <WeaknessItem key={i} weakness={w} />
            ))}
          </div>
        )}
      </ResultSection>

      {footerActions}
    </div>
  )
}
