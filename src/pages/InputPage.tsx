import { useState } from "react"
import { useLocation, useNavigate } from "react-router-dom"
import { Sparkles } from "lucide-react"

import { TabSwitch } from "@/components/TabSwitch"
import { DemoSwitcher } from "@/components/result/DemoSwitcher"
import { ResumeForm } from "@/components/input/ResumeForm"
import { SourceField } from "@/components/input/SourceField"
import { type AnalysisResult, type FitLevel, type MockDomain } from "@/lib/analysis"
import { cn } from "@/lib/utils"
import { demoData } from "@/lib/demoData"
import { detectInput, isAnalyzable, toSourceInput, type AnalysisInput } from "@/lib/input"
import {
  emptyResumeForm,
  isResumeReady,
  serializeResume,
  type InputDraft,
  type ResumeForm as ResumeFormData,
} from "@/lib/resume"

/**
 * 화면 1 · 입력 (CLAUDE.md §7)
 * - 내 서류: 필드 구조(경력·스킬 필수, 보조는 접힘). 경력의 기간은 월 선택 UI.
 * - 채용공고: 텍스트/링크 한 칸(§6).
 * - "분석하기"로 내 서류를 텍스트로 변환(§6-3)해 다음 화면(분석 중)으로 넘긴다.
 */
export default function InputPage() {
  const navigate = useNavigate()
  const location = useLocation()
  // 분석에서 되돌아온 경우(§6-2 fallback) 또는 재분석 진입 시 이전/보완된 입력을 복원.
  const navState = location.state as {
    prefill?: InputDraft
    reanalysisPreset?: AnalysisResult
    reanalysisPrev?: number
    demoCase?: { domain: MockDomain; level: FitLevel }
  } | null
  const prefill = navState?.prefill
  const [resume, setResume] = useState(() => prefill?.resume ?? emptyResumeForm())
  const [job, setJob] = useState(() => prefill?.job ?? "")
  // 재분석 진입: 보완된 이력서로 들어온 경우, "분석하기" 시 이 결과(61%)를 그대로 낸다
  const [preset] = useState<AnalysisResult | null>(() => navState?.reanalysisPreset ?? null)
  // 재분석 이전 매칭 점수 — 결과 화면의 상승폭(▲) 계산용으로 함께 넘긴다
  const [prevScore] = useState<number | null>(() => navState?.reanalysisPrev ?? null)
  // 데모로 채운 케이스 — 분석 시 그 케이스 결과를 그대로 받도록 함께 넘긴다. 수동 편집하면 해제.
  // 재분석 진입 시엔 prefill과 함께 넘어온 케이스로 초기화(안 그러면 재분석이 케이스를 잃고 하이라이트가 어긋남).
  const [demoCase, setDemoCase] = useState<{ domain: MockDomain; level: FitLevel } | null>(
    () => navState?.demoCase ?? null
  )
  // 버튼을 누른 뒤 "분석 중"(흐르는 그라데이션) 상태 — 잠깐 보여준 뒤 로딩 화면으로 넘어간다
  const [submitting, setSubmitting] = useState(false)

  const resumeReady = isResumeReady(resume)
  const jobReady = isAnalyzable(detectInput(job))
  const canAnalyze = resumeReady && jobReady

  // 데모: 선택한 케이스의 더미 데이터로 입력 필드를 채운다.
  // (결과로 점프하지 않고 입력 화면에 머물러 사용자가 직접 "분석하기"를 누르게 함)
  function fillFromDemo(domainSel: MockDomain, levelSel: FitLevel) {
    const demo = demoData[`${domainSel}-${levelSel}`]
    if (!demo) return // 아직 연결하지 않은 케이스 (지금은 "기획-높음"만)
    const filled: ResumeFormData = {
      careers: demo.resume.careers.map((c) => ({
        company: c.company,
        role: c.role,
        work: c.work,
        // end 가 "현재"면 그대로 → MonthRangePicker가 재직중 토글 ON 으로 처리
        tenure: { start: c.start || null, end: c.end || null },
      })),
      skills: demo.resume.skills,
      projects: demo.resume.project ?? "",
      education: demo.resume.education ?? "",
      certifications: demo.resume.certificate ?? "",
    }
    setResume(filled)
    setJob(demo.jobPost)
    setDemoCase({ domain: domainSel, level: levelSel })
  }

  // 수동 편집이 들어오면 데모 케이스 힌트를 해제 (내가 쓴 이력서로 정상 분석되게)
  function editResume(next: ResumeFormData) {
    setResume(next)
    setDemoCase(null)
  }
  function editJob(next: string) {
    setJob(next)
    setDemoCase(null)
  }

  function handleAnalyze() {
    if (!canAnalyze || submitting) return
    // 구조화된 내 서류 → 분석용 텍스트로 변환(§6-3). 폼 원본은 draft로 함께 넘겨 fallback 복원에 사용.
    const input: AnalysisInput = {
      resume: { raw: serializeResume(resume), kind: "text" },
      jobPosting: toSourceInput(job),
    }
    const draft: InputDraft = { resume, job }
    // 버튼의 "분석 중"(흐르는 그라데이션)을 잠깐 보여준 뒤 로딩 화면으로 (핸드오프)
    setSubmitting(true)
    window.setTimeout(
      () =>
        navigate("/analyzing", {
          state: { input, draft, demoCase, presetResult: preset ?? undefined, reanalysisPrev: prevScore ?? undefined },
        }),
      650
    )
  }

  return (
    <div className="flex flex-col gap-8 sm:gap-10">
      {/* 상단 2탭 (타이틀 텍스트 위) */}
      <TabSwitch />

      {/* 히어로 (§1 서비스 정의) */}
      <header className="mx-auto max-w-2xl text-center">
        <h1 className="text-3xl font-bold tracking-tight sm:text-4xl">
          이 공고에 내 서류, 잘 맞을까?
        </h1>
        <p className="mt-4 text-base leading-relaxed text-muted-foreground sm:text-lg">
          이력서와 채용공고를 함께 넣으면, <b className="font-semibold text-foreground">이 공고의 눈으로</b>{" "}
          강점과 약점을 짚어드려요.
        </p>
      </header>

      {/* 재분석 진입 — 지난(보완된) 이력서를 불러온 안내 */}
      {preset && (
        <div className="mx-auto w-full max-w-2xl rounded-card border border-primary-bg-strong bg-primary-bg/40 px-4 py-3">
          <p className="text-body font-medium text-primary-text">지난 이력서를 불러왔어요</p>
          <p className="mt-0.5 text-caption text-text-secondary">보완한 내용을 확인하고 다시 분석해보세요.</p>
        </div>
      )}

      {/* DEMO(입력 박스와 같은 폭) + 입력 — 한 덩어리로 정렬. DEMO↔입력 14px, 입력끼리 24px */}
      <div className="mx-auto flex w-full max-w-2xl flex-col gap-3.5">
        {/* 데모용 케이스 — USE_MOCK=true 일 때만 노출. 입력 박스와 좌우 폭 일치 */}
        <DemoSwitcher onSelect={fillFromDemo} />

        <div className="flex flex-col gap-6">
          <ResumeForm value={resume} onChange={editResume} />
          <SourceField
            id="job-input"
            title="채용공고"
            description="지원하려는 공고 하나"
            placeholder="채용공고 URL을 붙여넣거나, 공고 내용을 직접 붙여넣어 주세요."
            fallback="이미지 형식의 공고는 아직 지원되지 않아요. 공고 URL이나 텍스트를 넣어주세요."
            value={job}
            onChange={editJob}
          />
        </div>
      </div>

      {/* 분석하기 */}
      <div className="mx-auto flex w-full max-w-md flex-col items-center gap-3">
        <button
          type="button"
          aria-disabled={!canAnalyze || submitting}
          aria-busy={submitting}
          onClick={handleAnalyze}
          className={cn(
            "inline-flex h-12 w-full items-center justify-center gap-2 rounded-chip text-body font-semibold transition-[box-shadow,filter] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background [&_svg]:size-5 [&_svg]:shrink-0",
            submitting
              ? // 분석 중 — 흐르는 그라데이션 + 대기 커서
                "btn-analyze-loading cursor-wait text-white"
              : canAnalyze
                ? // 활성 — 정적 그라데이션 + 은은한 호버/눌림
                  "btn-analyze cursor-pointer text-white hover:brightness-[1.04] active:scale-[0.99]"
                : // 비활성 — 연회색 배경 + 회색 텍스트 + 클릭 불가
                  "cursor-not-allowed bg-[#f0f0f3] text-[#b4b4bc] dark:bg-white/[0.05] dark:text-white/40"
          )}
        >
          <Sparkles />
          {submitting ? "분석하고 있어요…" : "분석하기"}
        </button>
        <p className="text-center text-xs leading-relaxed text-muted-foreground">
          억지로 약점을 만들지 않아요. 잘 맞으면 잘 맞다고, 부족하면 어디가 왜 부족한지 정직하게 알려드려요.
        </p>
      </div>
    </div>
  )
}
