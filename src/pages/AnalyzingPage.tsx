import { useCallback, useEffect, useRef, useState } from "react"
import { useLocation, useNavigate } from "react-router-dom"
import { Check, Loader2, TriangleAlert } from "lucide-react"

import { Button } from "@/components/ui/button"
import { requestAnalysis, type AnalysisResult, type FitLevel, type MockDomain } from "@/lib/analysis"
import type { AnalysisInput } from "@/lib/input"
import type { InputDraft } from "@/lib/resume"
import { cn } from "@/lib/utils"

/**
 * 화면 2 · 분석 중 (CLAUDE.md §7) — 5단계 다듬기.
 * 단순 스피너가 아니라 진행 단계를 스텝으로 보여준다.
 * (분석은 한 번의 호출이라 단계는 시간에 따라 진행되는 표시 — 마지막 단계에서 결과를 기다린다.)
 */
const STAGES = [
  "공고의 핵심 요구를 읽고 있어요",
  "이력서와 맞춰보고 있어요",
  "강점과 보완점을 정리하고 있어요",
]
/** 각 단계가 진행 중으로 머무는 시간 — 목업 모드에서 '분석하는 과정'을 단계별로 연출 */
const STEP_MS = 700

export default function AnalyzingPage() {
  const navigate = useNavigate()
  const location = useLocation()
  const navState = location.state as {
    input?: AnalysisInput
    draft?: InputDraft
    demoCase?: { domain: MockDomain; level: FitLevel }
    presetResult?: AnalysisResult
    reanalysisPrev?: number
  } | null
  const input = navState?.input
  const draft = navState?.draft
  const demoCase = navState?.demoCase
  // 재분석(보완 후) — 서버 호출 대신 미리 만든 결과를 그대로 사용
  const presetResult = navState?.presetResult
  // 재분석 이전 매칭 점수 — 결과 화면의 상승폭(▲) 계산용으로 그대로 넘긴다
  const reanalysisPrev = navState?.reanalysisPrev

  const [error, setError] = useState<{ message: string; which?: "resume" | "job" } | null>(null)
  // 완료된 단계 수 (0~STAGES.length). i < stage → 완료(✓), i === stage → 진행 중.
  const [stage, setStage] = useState(0)
  // 분석 결과는 준비되는 대로 담아두고, 단계 연출이 끝난 뒤 넘어간다.
  const [result, setResult] = useState<AnalysisResult | null>(null)
  const startedOnce = useRef(false)

  const run = useCallback(() => {
    if (!input) return
    setError(null)
    setStage(0)
    setResult(null)
    // 재분석 프리셋이 있으면 서버를 거치지 않고 그 결과로 (단계 연출은 그대로 흐른다)
    if (presetResult) {
      setResult(presetResult)
      return
    }
    void requestAnalysis(input, demoCase).then((res) => {
      if (res.ok) setResult(res.result)
      else setError({ message: res.message, which: res.which })
    })
  }, [input, demoCase, presetResult])

  // 분석 실행 (StrictMode 중복 호출 방지)
  useEffect(() => {
    if (!input) {
      navigate("/", { replace: true })
      return
    }
    if (startedOnce.current) return
    startedOnce.current = true
    run()
  }, [input, navigate, run])

  // 단계 연출 — 한 단계씩 약 0.7초 간격으로 순차 체크
  useEffect(() => {
    if (error || stage >= STAGES.length) return
    const t = setTimeout(() => setStage((s) => s + 1), STEP_MS)
    return () => clearTimeout(t)
  }, [stage, error])

  // 세 단계가 모두 체크되고 결과도 준비됐을 때만 결과로 (완료 상태를 잠깐 보여준 뒤)
  useEffect(() => {
    if (error || stage < STAGES.length || !result) return
    const t = setTimeout(() => {
      // 결과 화면 하이라이팅을 위해 이력서(담당업무 원문)도 함께 전달
      navigate("/result", { replace: true, state: { result, resume: draft?.resume, job: draft?.job, reanalysisPrev } })
    }, 350)
    return () => clearTimeout(t)
  }, [stage, result, error, navigate, draft, reanalysisPrev])

  if (!input) return null

  if (error) {
    return (
      <section className="mx-auto flex max-w-md flex-col items-center gap-5 py-6 text-center">
        <div className="flex size-12 items-center justify-center rounded-full bg-warning/15">
          <TriangleAlert className="size-6 text-warning" />
        </div>
        <div className="space-y-1.5">
          <h1 className="text-xl font-bold tracking-tight">분석을 마치지 못했어요</h1>
          <p className="leading-relaxed text-muted-foreground">{error.message}</p>
        </div>
        <div className="flex flex-col gap-2 sm:flex-row">
          <Button variant="outline" onClick={() => navigate("/", { state: { prefill: draft } })}>
            입력으로 돌아가기
          </Button>
          <Button onClick={run}>다시 시도</Button>
        </div>
      </section>
    )
  }

  return (
    <section className="mx-auto flex max-w-sm flex-col items-center gap-8 py-10 text-center">
      <div className="space-y-2">
        <h1 className="text-xl font-bold tracking-tight sm:text-2xl">이 공고의 눈으로 살펴보는 중…</h1>
        <p className="text-sm text-muted-foreground">이력서를 꼼꼼히 살펴보고 있어요. 잠시만 기다려 주세요.</p>
      </div>

      <ol className="flex w-full flex-col gap-3 text-left">
        {STAGES.map((label, i) => {
          const state = i < stage ? "done" : i === stage ? "active" : "pending"
          return (
            <li key={label} className="flex items-center gap-3">
              <StepIcon state={state} />
              <span
                className={cn(
                  "text-sm transition-colors",
                  state === "active" && "font-medium text-foreground",
                  state === "done" && "text-foreground",
                  state === "pending" && "text-text-muted"
                )}
              >
                {label}
              </span>
            </li>
          )
        })}
      </ol>
    </section>
  )
}

function StepIcon({ state }: { state: "done" | "active" | "pending" }) {
  // 완료 — 옅은 보라 원(#EEEDFB=primary-bg) + 보라 체크(#5B5BD6=primary). 초록(강점 의미)과 겹치지 않게 브랜드색으로.
  if (state === "done") {
    return (
      <span className="flex size-6 shrink-0 items-center justify-center rounded-full bg-primary-bg">
        <Check className="size-3.5 text-primary" />
      </span>
    )
  }
  // 진행 중 — 보라 스피너 (유지)
  if (state === "active") {
    return (
      <span className="flex size-6 shrink-0 items-center justify-center rounded-full bg-primary/10">
        <Loader2 className="size-3.5 animate-spin text-primary" />
      </span>
    )
  }
  // 대기 — 연회색(#F0F0F3) 빈 원
  return <span className="size-6 shrink-0 rounded-full bg-[#f0f0f3] dark:bg-white/[0.06]" />
}
