import { useEffect, useRef, useState, type ReactNode } from "react"
import { useNavigate } from "react-router-dom"
import { MoreHorizontal, Plus } from "lucide-react"

import { TabSwitch } from "@/components/TabSwitch"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import type { FitLevel } from "@/lib/analysis"
import { type ArchiveRecord } from "@/lib/archive"
import { useArchiveRecords } from "@/lib/archiveStore"
import { cn } from "@/lib/utils"

/** 적합도 배지 색 — 높음 보라 / 보통 연보라 / 낮음 회색. 낮음은 부드러운 문구. */
const FIT_BADGE: Record<FitLevel, { label: string; className: string }> = {
  높음: { label: "높음", className: "bg-fit-high-bg text-fit-high" },
  보통: { label: "보통", className: "bg-fit-mid-bg text-fit-mid" },
  낮음: { label: "조금 더 준비가 필요해요", className: "bg-fit-low-bg text-fit-low" },
}

/**
 * 아카이브 탭 — 저장된 분석 기록 목록 (지금은 더미).
 * 카드 관리(수정·삭제)는 UI만 — 실제 저장/삭제 로직은 다음 단계.
 */
export default function ArchivePage() {
  const navigate = useNavigate()
  const records = useArchiveRecords()

  return (
    <div className="flex flex-col gap-8">
      <TabSwitch />

      {records.length === 0 ? (
        <EmptyState onStart={() => navigate("/")} />
      ) : (
        <div className="mx-auto flex w-full max-w-4xl flex-col gap-6">
          {/* 헤더 + 새 분석 */}
          <div className="flex items-start justify-between gap-4">
            <div>
              <h1 className="text-h1 font-bold text-foreground">내 분석 기록</h1>
              <p className="mt-1 text-body text-text-secondary">
                지원한 곳마다 나의 강점과 보완점을 모아뒀어요
              </p>
            </div>
            <Button className="shrink-0" onClick={() => navigate("/")}>
              <Plus />
              새 분석
            </Button>
          </div>

          {/* 기록 카드 그리드 */}
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {records.map((r) => (
              <ArchiveCard key={r.id} record={r} />
            ))}
          </div>
        </div>
      )}
    </div>
  )
}

function ArchiveCard({ record }: { record: ArchiveRecord }) {
  const navigate = useNavigate()
  const badge = FIT_BADGE[record.level]
  const [menuOpen, setMenuOpen] = useState(false)
  const [editing, setEditing] = useState(false)
  const [confirming, setConfirming] = useState(false)
  const menuRef = useRef<HTMLDivElement>(null)

  // 메뉴 바깥 클릭 시 닫기
  useEffect(() => {
    if (!menuOpen) return
    function onDown(e: MouseEvent) {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) setMenuOpen(false)
    }
    document.addEventListener("mousedown", onDown)
    return () => document.removeEventListener("mousedown", onDown)
  }, [menuOpen])

  return (
    <div
      role="button"
      tabIndex={0}
      onClick={() => navigate(`/archive/${record.id}`)}
      onKeyDown={(e) => {
        if (e.key === "Enter") navigate(`/archive/${record.id}`)
      }}
      className="group relative flex cursor-pointer flex-col rounded-card border border-border bg-card p-5 transition-shadow hover:shadow-float"
    >
      {/* 상단: 배지 + ⋯ 메뉴 */}
      <div className="flex items-start justify-between gap-2">
        <span
          className={cn(
            "inline-flex w-fit items-center rounded-full px-2.5 py-1 text-badge font-semibold",
            badge.className
          )}
        >
          {badge.label}
        </span>

        <div ref={menuRef} className="relative -mr-1 -mt-1" onClick={(e) => e.stopPropagation()}>
          <button
            type="button"
            onClick={() => setMenuOpen((v) => !v)}
            aria-label="카드 관리 메뉴"
            aria-haspopup="menu"
            aria-expanded={menuOpen}
            // 평소 연회색(#B4B4BC), 카드 호버 시 진하게(#5A5A66)
            className="flex size-7 items-center justify-center rounded-md text-[#b4b4bc] transition-colors hover:bg-surface-subtle group-hover:text-[#5a5a66]"
          >
            <MoreHorizontal className="size-4" />
          </button>

          {menuOpen && (
            <div
              role="menu"
              className="absolute right-0 top-full z-20 mt-1 w-32 rounded-[9px] border border-border bg-card p-1 shadow-float"
            >
              <button
                type="button"
                role="menuitem"
                onClick={() => {
                  setMenuOpen(false)
                  setEditing(true)
                }}
                className="block w-full rounded-[6px] px-3 py-1.5 text-left text-caption text-text-secondary transition-colors hover:bg-surface-subtle"
              >
                제목 수정
              </button>
              <button
                type="button"
                role="menuitem"
                onClick={() => {
                  setMenuOpen(false)
                  setConfirming(true)
                }}
                // 삭제만 빨간 텍스트(#D94A4A)
                className="block w-full rounded-[6px] px-3 py-1.5 text-left text-caption text-[#d94a4a] transition-colors hover:bg-surface-subtle"
              >
                삭제
              </button>
            </div>
          )}
        </div>
      </div>

      <p className="mt-3 text-h3 font-semibold text-foreground">{record.title}</p>
      <p className="mt-1 text-caption text-text-muted">{record.date}</p>
      <div className="mt-4 border-t border-border pt-3 text-caption text-text-secondary">
        강점 {record.strengths} · 보완점 {record.weaknesses}
      </div>

      {editing && <EditTitleModal initialTitle={record.title} onClose={() => setEditing(false)} />}
      {confirming && <DeleteConfirm onClose={() => setConfirming(false)} />}
    </div>
  )
}

/** 화면 중앙 모달 껍데기 — 배경 클릭 시 닫힘 */
function ModalShell({
  children,
  onClose,
  className,
}: {
  children: ReactNode
  onClose: () => void
  className?: string
}) {
  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/30 p-4"
      onClick={(e) => {
        e.stopPropagation()
        onClose()
      }}
    >
      <div
        role="dialog"
        aria-modal="true"
        onClick={(e) => e.stopPropagation()}
        onKeyDown={(e) => e.stopPropagation()}
        className={cn("w-full rounded-card border border-border bg-card p-5 shadow-float", className)}
      >
        {children}
      </div>
    </div>
  )
}

/** 제목 수정 모달 — UI만(저장/취소 모두 닫기) */
function EditTitleModal({ initialTitle, onClose }: { initialTitle: string; onClose: () => void }) {
  const [title, setTitle] = useState(initialTitle)
  return (
    <ModalShell onClose={onClose} className="max-w-sm">
      <p className="text-h3 font-semibold text-foreground">제목 수정</p>
      <label className="mt-4 block">
        <span className="text-caption font-medium text-text-secondary">제목</span>
        <Input className="mt-1.5" value={title} onChange={(e) => setTitle(e.target.value)} autoFocus />
      </label>
      <div className="mt-5 flex justify-end gap-2">
        <Button variant="outline" size="sm" onClick={onClose}>
          취소
        </Button>
        {/* 저장 = 보라(#5B5BD6=bg-primary). 지금은 닫기만. */}
        <Button size="sm" onClick={onClose}>
          저장
        </Button>
      </div>
    </ModalShell>
  )
}

/** 삭제 확인 — UI만(확인/취소 모두 닫기) */
function DeleteConfirm({ onClose }: { onClose: () => void }) {
  return (
    <ModalShell onClose={onClose} className="max-w-xs text-center">
      <p className="text-body font-medium text-foreground">이 기록을 삭제할까요?</p>
      <div className="mt-5 flex justify-center gap-2">
        <Button variant="outline" size="sm" onClick={onClose}>
          취소
        </Button>
        <Button
          size="sm"
          onClick={onClose}
          className="bg-[#d94a4a] text-white hover:bg-[#c43e3e]"
        >
          삭제
        </Button>
      </div>
    </ModalShell>
  )
}

/** 빈 상태 — 기록이 하나도 없을 때, 따뜻한 톤 안내 */
function EmptyState({ onStart }: { onStart: () => void }) {
  return (
    <div className="flex flex-col items-center gap-5 py-20 text-center">
      <div className="space-y-1.5">
        <p className="text-h3 font-semibold text-foreground">아직 분석 기록이 없어요</p>
        <p className="text-body text-text-secondary">첫 분석을 시작해볼까요?</p>
      </div>
      <Button size="lg" onClick={onStart}>
        분석 시작하기
      </Button>
    </div>
  )
}
