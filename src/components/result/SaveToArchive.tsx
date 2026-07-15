import { useState } from "react"
import { useNavigate } from "react-router-dom"
import { Bookmark, Check } from "lucide-react"

import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import type { AnalysisResult } from "@/lib/analysis"
import { addSavedRecord, nextSavedId } from "@/lib/archiveStore"
import type { CareerEntry, ResumeForm } from "@/lib/resume"
import { cn } from "@/lib/utils"

/** 오늘 날짜 "YYYY.MM.DD" (더미 카드 형식과 동일) */
function todayDot(): string {
  const d = new Date()
  const p = (n: number) => String(n).padStart(2, "0")
  return `${d.getFullYear()}.${p(d.getMonth() + 1)}.${p(d.getDate())}`
}

/** 제목 기본값 — 최근 경력의 "회사명 · 직무" (없으면 일반 문구) */
function defaultTitle(careers: CareerEntry[]): string {
  const c = careers[0]
  if (c?.company?.trim()) return c.role?.trim() ? `${c.company} · ${c.role}` : c.company
  return "내 분석 기록"
}

/**
 * 결과 화면 → "아카이브에 저장" (더미).
 * 버튼 → 제목 확인 모달 → 저장 시 세션 스토어에 카드 추가 → "저장됐어요" 토스트.
 */
export function SaveToArchive({
  result,
  careers,
  resume,
  job,
}: {
  result: AnalysisResult
  careers: CareerEntry[]
  resume?: ResumeForm
  job?: string
}) {
  const navigate = useNavigate()
  const [open, setOpen] = useState(false)
  const [done, setDone] = useState(false)
  // 저장 완료 시 북마크를 채워진 상태(★)로 표시
  const [saved, setSaved] = useState(false)

  function save(title: string) {
    addSavedRecord({
      id: nextSavedId(),
      title: title.trim() || defaultTitle(careers),
      level: result.overall_fit.level,
      date: todayDot(),
      strengths: result.strengths.length,
      weaknesses: result.weaknesses.length,
      saved: { result, careers, resume, job },
    })
    setOpen(false)
    setSaved(true)
    setDone(true)
    window.setTimeout(() => setDone(false), 2600)
  }

  return (
    <>
      {/* 아카이브 저장 — 북마크 아이콘. 저장 전 빈 북마크, 저장 후 채워진 보라 북마크 */}
      <button
        type="button"
        onClick={() => (saved ? navigate("/archive") : setOpen(true))}
        aria-label={saved ? "아카이브에 저장됨 · 보기" : "아카이브에 저장"}
        aria-pressed={saved}
        title={saved ? "저장됨 · 아카이브에서 보기" : "아카이브에 저장"}
        className={cn(
          "flex size-9 shrink-0 items-center justify-center rounded-full transition-colors",
          saved
            ? "text-primary hover:bg-primary-bg"
            : "text-text-muted hover:bg-surface-subtle hover:text-primary-text"
        )}
      >
        <Bookmark className={cn("size-5", saved && "fill-primary")} />
      </button>

      {open && <SaveModal defaultValue={defaultTitle(careers)} onCancel={() => setOpen(false)} onSave={save} />}
      {done && <SavedToast onView={() => navigate("/archive")} />}
    </>
  )
}

/** 저장 모달 — 제목 확인/수정 */
function SaveModal({
  defaultValue,
  onCancel,
  onSave,
}: {
  defaultValue: string
  onCancel: () => void
  onSave: (title: string) => void
}) {
  const [title, setTitle] = useState(defaultValue)
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/30 p-4" onClick={onCancel}>
      <div
        role="dialog"
        aria-modal="true"
        onClick={(e) => e.stopPropagation()}
        className="w-full max-w-sm rounded-card border border-border bg-card p-5 shadow-float"
      >
        <p className="text-h3 font-semibold text-foreground">이 분석을 저장할게요</p>
        <p className="mt-1 text-caption text-text-secondary">아카이브에서 다시 볼 수 있게 제목을 정해주세요.</p>
        <label className="mt-4 block">
          <span className="text-caption font-medium text-text-secondary">제목</span>
          <Input
            className="mt-1.5"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="회사명 · 직무"
            autoFocus
            onKeyDown={(e) => {
              if (e.key === "Enter") onSave(title)
            }}
          />
        </label>
        <div className="mt-5 flex justify-end gap-2">
          <Button variant="outline" size="sm" onClick={onCancel}>
            취소
          </Button>
          <Button size="sm" onClick={() => onSave(title)}>
            저장
          </Button>
        </div>
      </div>
    </div>
  )
}

/** 저장 완료 토스트 — 하단 중앙, 잠시 뒤 사라짐 */
function SavedToast({ onView }: { onView: () => void }) {
  return (
    <div className="fixed inset-x-0 bottom-6 z-50 flex justify-center px-4">
      <div className="flex items-center gap-3 rounded-full bg-foreground px-4 py-2.5 shadow-float">
        <Check className="size-4 text-background" />
        <span className="text-caption font-medium text-background">아카이브에 저장됐어요</span>
        <button
          type="button"
          onClick={onView}
          className="text-caption font-semibold text-background underline underline-offset-2 hover:opacity-80"
        >
          보러가기
        </button>
      </div>
    </div>
  )
}
