import { useEffect, useState } from "react"
import { Link, Navigate, useNavigate, useParams } from "react-router-dom"
import { ArrowLeft, Sparkles } from "lucide-react"

import { ResumeHighlight } from "@/components/result/ResumeHighlight"
import { fetchMockCase, type AnalysisResult, type FitLevel, type MockDomain } from "@/lib/analysis"
import { useArchiveRecords } from "@/lib/archiveStore"
import { demoData } from "@/lib/demoData"
import { reanalysisAfterDraft, reanalysisAfterResult, reanalysisDemo } from "@/lib/reanalysisDemo"
import type { CareerEntry } from "@/lib/resume"

/**
 * 아카이브 상세 — 저장된 분석을 다시 본다.
 * 기존 결과 화면(ResumeHighlight: 적합도 + 충족 현황 + 이력서 하이라이팅 + 강점/보완점)을 재활용.
 * 지금은 더미: 카드의 demoKey 로 목업 결과를 불러오고, 이력서 원문은 demoData 에서 가져온다.
 */
export default function ArchiveDetailPage() {
  const { id } = useParams()
  const navigate = useNavigate()
  const record = useArchiveRecords().find((r) => r.id === id)
  const demoKey = record?.demoKey
  const [result, setResult] = useState<AnalysisResult | null>(null)

  useEffect(() => {
    if (!demoKey) return
    const [domain, level] = demoKey.split("-") as [MockDomain, FitLevel]
    let alive = true
    void fetchMockCase(domain, level).then((res) => {
      if (alive && res.ok) setResult(res.result)
    })
    return () => {
      alive = false
    }
  }, [demoKey])

  // 없는 기록이면 아카이브로
  if (!record) return <Navigate to="/archive" replace />

  const demo = demoKey ? demoData[demoKey] : undefined
  const careers: CareerEntry[] = demo
    ? demo.resume.careers.map((c) => ({
        company: c.company,
        role: c.role,
        work: c.work,
        tenure: { start: c.start || null, end: c.end || null },
      }))
    : []

  // 재분석 진입 — 어느 카드든 "보완해서 다시 분석"(높음도 100%는 아니니까).
  // 기획·낮음은 성장 데모(스크립트 before→after), 그 외는 그 카드의 이력서+공고로 일반 재분석.
  const prefillDraft = demo
    ? {
        resume: {
          careers,
          skills: demo.resume.skills,
          projects: demo.resume.project ?? "",
          education: demo.resume.education ?? "",
          certifications: demo.resume.certificate ?? "",
        },
        job: demo.jobPost,
      }
    : record.saved?.resume
      ? { resume: record.saved.resume, job: record.saved.job ?? "" }
      : null
  const reanalyzeState =
    demoKey === "기획-낮음"
      ? {
          prefill: reanalysisAfterDraft,
          reanalysisPreset: reanalysisAfterResult,
          reanalysisPrev: reanalysisDemo.before.matchRate,
        }
      : prefillDraft
        ? { prefill: prefillDraft }
        : null
  const highFit = record.level === "높음"
  const cta =
    demoKey === "기획-낮음"
      ? {
          heading: "아쉬운 점을 보완하면, 얼마나 가까워질까요?",
          desc: "진단에서 짚인 보완점을 채운 이력서로, 같은 공고에 다시 분석해볼 수 있어요.",
          label: "보완해서 다시 분석하기",
        }
      : {
          heading: highFit ? "이미 잘 맞지만, 100%는 아니에요" : "조금 더 채우면 더 가까워져요",
          desc: highFit
            ? "이력서를 더 다듬어 같은 공고에 다시 분석해볼 수 있어요."
            : "보완점을 반영한 이력서로 같은 공고에 다시 분석해보세요.",
          label: "보완해서 다시 분석하기",
        }

  return (
    <div className="mx-auto w-full max-w-3xl">
      <Link
        to="/archive"
        className="inline-flex items-center gap-1.5 text-caption font-medium text-text-secondary transition-colors hover:text-foreground"
      >
        <ArrowLeft className="size-4" />
        아카이브로 돌아가기
      </Link>

      <h1 className="mt-3 text-h2 font-bold text-foreground">{record.title}</h1>
      <p className="mt-1 text-caption text-text-muted">{record.date} 분석 · 저장된 기록</p>

      <div className="mt-8">
        {record.saved ? (
          // 저장 카드 — 결과+이력서를 직접 들고 있어 다시 fetch 없이 바로 렌더
          <ResumeHighlight result={record.saved.result} careers={record.saved.careers} />
        ) : demoKey ? (
          result ? (
            <ResumeHighlight result={result} careers={careers} />
          ) : (
            <p className="py-12 text-center text-body text-text-muted">불러오는 중…</p>
          )
        ) : (
          <p className="rounded-card border border-dashed border-border-strong bg-surface-subtle py-12 text-center text-body text-text-secondary">
            이 기록의 상세 화면은 다음 단계에서 연결할게요.
          </p>
        )}
      </div>

      {/* 다시 분석하기 — 모든 카드에 노출(높음도 100%는 아니니 보완해서 재분석). 기획·낮음만 성장 데모. */}
      {reanalyzeState && (
        <div className="mt-8 rounded-card border border-primary-bg-strong bg-primary-bg/40 p-6 text-center dark:bg-primary-bg/20">
          <p className="text-h3 font-semibold text-foreground">{cta.heading}</p>
          <p className="mx-auto mt-1.5 max-w-md text-body leading-relaxed text-text-secondary">{cta.desc}</p>
          <button
            type="button"
            onClick={() => navigate("/", { state: reanalyzeState })}
            className="btn-analyze mt-5 inline-flex h-11 items-center justify-center gap-2 rounded-chip px-6 text-body font-semibold text-white transition-[filter] hover:brightness-[1.04] active:scale-[0.99] [&_svg]:size-5 [&_svg]:shrink-0"
          >
            <Sparkles />
            {cta.label}
          </button>
        </div>
      )}
    </div>
  )
}
