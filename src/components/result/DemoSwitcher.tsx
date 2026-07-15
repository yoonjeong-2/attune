import { useEffect, useRef, useState } from "react"
import { ChevronDown, Eye, EyeOff } from "lucide-react"

import {
  fetchMockMode,
  type AnalysisResult,
  type FitLevel,
  type MockDomain,
} from "@/lib/analysis"
import { cn } from "@/lib/utils"

const DOMAINS: MockDomain[] = ["기획", "개발"]
const LEVELS: FitLevel[] = ["높음", "보통", "낮음"]

// 데모 패널 온/오프 저장 키 (시연 중 껐다 켜도 유지). "off" 면 꺼짐.
const PANEL_KEY = "demoPanelOn"

/** 현재 결과의 공고 요구로 직군을 추정 (초기 선택 표시용) */
function inferDomain(result: AnalysisResult): MockDomain {
  const reqs = result.job_requirements.must_have.join(" ")
  return /기획|PRD|프로덕트/.test(reqs) ? "기획" : "개발"
}

/**
 * 데모용 케이스 전환 바 (포트폴리오 시연용).
 * - USE_MOCK=true 일 때만 노출 (실제 모드에선 완전히 숨김).
 * - 직군·적합도를 각각 드롭다운으로 골라 그 조합의 목업 결과로 전환.
 */
export function DemoSwitcher({
  current,
  onSelect,
}: {
  /** 결과 화면에선 현재 결과를 넘겨 초기 선택 표시. 입력 화면에선 생략(기획/높음 기본). */
  current?: AnalysisResult
  /** 직군×적합도를 고르면 호출 — 무엇을 할지는 부모가 결정(입력 채우기 / 결과 교체 등) */
  onSelect: (domain: MockDomain, level: FitLevel) => void | Promise<void>
}) {
  const [mockMode, setMockMode] = useState<boolean | null>(null)
  // 데모 패널 표시 여부 (시연 중엔 꺼서 데모 UI를 숨긴다). 저장된 값 우선.
  const [enabled, setEnabled] = useState<boolean>(() => {
    if (typeof window === "undefined") return true
    return window.localStorage.getItem(PANEL_KEY) !== "off"
  })
  // 기본은 미선택(null). 결과 화면에서 current 를 넘기면 그 값으로 표시.
  const [domain, setDomain] = useState<MockDomain | null>(() => (current ? inferDomain(current) : null))
  const [level, setLevel] = useState<FitLevel | null>(() => current?.overall_fit.level ?? null)
  const [busy, setBusy] = useState(false)

  useEffect(() => {
    fetchMockMode().then(setMockMode)
  }, [])

  // 목업 모드가 아니면(또는 확인 중이면) 완전히 숨김
  if (mockMode !== true) return null

  function toggle() {
    setEnabled((v) => {
      const next = !v
      if (typeof window !== "undefined") window.localStorage.setItem(PANEL_KEY, next ? "on" : "off")
      return next
    })
  }

  // 꺼짐 — 흐름에서 완전히 빠져(아래 요소가 위로 올라옴) 구석에 작은 복원 버튼만 남긴다.
  if (!enabled) {
    return (
      <button
        type="button"
        onClick={toggle}
        title="데모 패널 다시 열기"
        className="fixed bottom-4 right-4 z-30 inline-flex items-center gap-1.5 rounded-full border border-dashed border-border-strong bg-card/80 px-3 py-1.5 text-caption font-medium text-text-muted opacity-50 shadow-sm backdrop-blur transition-opacity hover:opacity-100"
      >
        <Eye className="size-3.5" />
        DEMO
      </button>
    )
  }

  async function fill(nextDomain: MockDomain, nextLevel: FitLevel) {
    setBusy(true)
    try {
      await onSelect(nextDomain, nextLevel)
    } finally {
      setBusy(false)
    }
  }
  // 직군·적합도 둘 다 골랐을 때만 그 조합으로 채운다.
  function pickDomain(d: MockDomain) {
    setDomain(d)
    if (level) void fill(d, level)
  }
  function pickLevel(l: FitLevel) {
    setLevel(l)
    if (domain) void fill(domain, l)
  }

  return (
    <div className="rounded-card border border-dashed border-border-strong bg-[#fafafc] p-3 dark:bg-white/[0.03]">
      <div className="flex flex-wrap items-center gap-x-4 gap-y-2">
        <span className="rounded bg-foreground px-2 py-0.5 text-badge font-semibold text-background">DEMO</span>

        <div className="flex items-center gap-2">
          <span className="text-caption font-medium text-text-secondary">직군</span>
          <Dropdown value={domain} placeholder="선택" options={DOMAINS} disabled={busy} onChange={pickDomain} />
        </div>

        <div className="flex items-center gap-2">
          <span className="text-caption font-medium text-text-secondary">적합도</span>
          <Dropdown value={level} placeholder="선택" options={LEVELS} disabled={busy} onChange={pickLevel} />
        </div>

        <span className="text-caption text-text-muted">예시를 골라 결과를 둘러보세요</span>

        {/* 데모 패널 끄기 — 시연 중 데모 UI를 숨긴다 */}
        <button
          type="button"
          onClick={toggle}
          title="데모 패널 숨기기"
          className="ml-auto inline-flex items-center gap-1 rounded-full px-2 py-1 text-caption font-medium text-text-muted transition-colors hover:bg-surface-subtle hover:text-foreground"
        >
          <EyeOff className="size-3.5" />
          끄기
        </button>
      </div>
    </div>
  )
}

/** 흰 배경 + 얇은 테두리(#EAEAF0), radius 9px 드롭다운. 선택 항목은 보라 배경(#F4F3FB / 텍스트 #3D3A94). */
function Dropdown<T extends string>({
  value,
  placeholder,
  options,
  disabled,
  onChange,
}: {
  value: T | null
  placeholder: string
  options: readonly T[]
  disabled?: boolean
  onChange: (v: T) => void
}) {
  const [open, setOpen] = useState(false)
  const ref = useRef<HTMLDivElement>(null)

  // 바깥 클릭 시 닫기
  useEffect(() => {
    if (!open) return
    function onDown(e: MouseEvent) {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false)
    }
    document.addEventListener("mousedown", onDown)
    return () => document.removeEventListener("mousedown", onDown)
  }, [open])

  return (
    <div ref={ref} className="relative">
      <button
        type="button"
        disabled={disabled}
        onClick={() => setOpen((v) => !v)}
        aria-haspopup="listbox"
        aria-expanded={open}
        className="inline-flex items-center gap-1.5 rounded-[9px] border border-border bg-card px-3 py-1.5 text-caption transition-colors hover:border-border-strong disabled:opacity-60"
      >
        {/* 미선택이면 '선택'을 옅은 색으로 */}
        <span className={cn(value == null ? "text-text-muted" : "font-medium text-foreground")}>
          {value ?? placeholder}
        </span>
        <ChevronDown className={cn("size-3.5 text-text-muted transition-transform", open && "rotate-180")} />
      </button>

      {open && (
        <div
          role="listbox"
          className="absolute left-0 top-full z-20 mt-1 min-w-full rounded-[9px] border border-border bg-card p-1 shadow-float"
        >
          {options.map((o) => (
            <button
              key={o}
              type="button"
              role="option"
              aria-selected={o === value}
              onClick={() => {
                onChange(o)
                setOpen(false)
              }}
              className={cn(
                "block w-full rounded-[6px] px-3 py-1.5 text-left text-caption transition-colors",
                o === value
                  ? "bg-[#f4f3fb] font-medium text-[#3d3a94] dark:bg-primary-bg dark:text-primary-text"
                  : "text-text-secondary hover:bg-surface-subtle"
              )}
            >
              {o}
            </button>
          ))}
        </div>
      )}
    </div>
  )
}
