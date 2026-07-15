import { useEffect, useRef, useState } from "react"
import { Calendar, ChevronLeft, ChevronRight } from "lucide-react"

import { cn } from "@/lib/utils"

/**
 * 재직 기간 값 (경력 입력용).
 * 저장 형식은 AI가 기간을 계산할 수 있도록 통일한다:
 *   start: "YYYY-MM"
 *   end:   "YYYY-MM"  또는  "현재"
 * 아직 안 고른 값은 null.
 */
export interface Tenure {
  start: string | null
  end: string | null // "YYYY-MM" 또는 "현재"
}

const MONTHS = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12]
type Target = "start" | "end"

/** "YYYY-MM" → "YYYY.MM" (버튼 표시용). "현재"·빈값은 그대로. */
function toDisplay(v: string | null): string {
  if (!v || v === "현재") return v ?? ""
  const [y, m] = v.split("-")
  return `${y}.${m}`
}

/** "YYYY-MM"에서 연도만 뽑기 (팝업 초기 연도용) */
function yearOf(v: string | null): number | null {
  if (!v || v === "현재") return null
  const y = Number(v.split("-")[0])
  return Number.isFinite(y) ? y : null
}

/**
 * 재직 기간 월 선택 UI (사람인 스타일 참고 + 개선) — 1단계 기본 동작.
 * [시작일] ~ [종료일] [재직중] 을 한 줄에. 날짜 버튼을 누르면 아래에 월 선택 팝업.
 */
export function MonthRangePicker({
  value,
  onChange,
}: {
  value: Tenure
  onChange: (next: Tenure) => void
}) {
  const [open, setOpen] = useState<Target | null>(null)
  const rootRef = useRef<HTMLDivElement>(null)
  const working = value.end === "현재"

  // 팝업 바깥을 누르면 닫기
  useEffect(() => {
    if (!open) return
    function onDown(e: MouseEvent) {
      if (rootRef.current && !rootRef.current.contains(e.target as Node)) setOpen(null)
    }
    document.addEventListener("mousedown", onDown)
    return () => document.removeEventListener("mousedown", onDown)
  }, [open])

  function pick(target: Target, year: number, month: number) {
    const v = `${year}-${String(month).padStart(2, "0")}`
    onChange(target === "start" ? { ...value, start: v } : { ...value, end: v })
    setOpen(null)
  }

  function toggleWorking() {
    // 켜면 종료일을 "현재"로, 끄면 비움
    onChange({ ...value, end: working ? null : "현재" })
    if (open === "end") setOpen(null)
  }

  return (
    <div ref={rootRef} className="flex flex-wrap items-center gap-2">
      {/* 시작일 */}
      <div className="relative">
        <DateButton
          display={toDisplay(value.start)}
          placeholder="입사연월"
          active={open === "start"}
          onClick={() => setOpen(open === "start" ? null : "start")}
        />
        {open === "start" && (
          <MonthPopup
            initialYear={yearOf(value.start) ?? new Date().getFullYear()}
            selected={value.start}
            onPick={(y, m) => pick("start", y, m)}
          />
        )}
      </div>

      <span className="px-0.5 text-text-muted">~</span>

      {/* 종료일 (재직중이면 비활성 + "현재") */}
      <div className="relative">
        <DateButton
          display={working ? "현재" : toDisplay(value.end)}
          placeholder="퇴사연월"
          active={open === "end"}
          disabled={working}
          onClick={() => setOpen(open === "end" ? null : "end")}
        />
        {open === "end" && !working && (
          <MonthPopup
            initialYear={yearOf(value.end) ?? new Date().getFullYear()}
            selected={value.end}
            onPick={(y, m) => pick("end", y, m)}
          />
        )}
      </div>

      {/* 재직중 토글 */}
      <button
        type="button"
        onClick={toggleWorking}
        aria-pressed={working}
        className="ml-1 inline-flex items-center gap-2"
      >
        <span
          className={cn(
            "relative h-5 w-9 rounded-full transition-colors",
            working ? "bg-primary" : "bg-border-strong"
          )}
        >
          <span
            className={cn(
              "absolute top-0.5 size-4 rounded-full bg-white shadow-sm transition-all",
              working ? "left-[18px]" : "left-0.5"
            )}
          />
        </span>
        <span className={cn("text-body", working ? "text-foreground" : "text-text-secondary")}>재직중</span>
      </button>
    </div>
  )
}

/** 날짜 버튼 — 달력 아이콘 + "YYYY.MM" (없으면 placeholder) */
function DateButton({
  display,
  placeholder,
  active,
  disabled,
  onClick,
}: {
  display: string
  placeholder: string
  active: boolean
  disabled?: boolean
  onClick: () => void
}) {
  return (
    <button
      type="button"
      disabled={disabled}
      onClick={onClick}
      className={cn(
        "inline-flex items-center gap-1.5 rounded-chip border px-3 py-2 text-body transition-colors",
        disabled
          ? "cursor-not-allowed border-border bg-muted/50 text-text-muted"
          : active
            ? "border-primary bg-card text-foreground"
            : "border-border bg-card text-foreground hover:border-border-strong"
      )}
    >
      <Calendar className="size-4 shrink-0 text-text-muted" />
      <span className={cn(!display && "text-text-muted")}>{display || placeholder}</span>
    </button>
  )
}

/** 월 선택 팝업 — ‹ 연도 › + 12개월 3열 그리드. 선택 월은 메인 컬러 배경. */
function MonthPopup({
  initialYear,
  selected,
  onPick,
}: {
  initialYear: number
  selected: string | null
  onPick: (year: number, month: number) => void
}) {
  const [year, setYear] = useState(initialYear)
  const selYear = yearOf(selected)
  const selMonth = selected && selected !== "현재" ? Number(selected.split("-")[1]) : null

  return (
    <div className="absolute left-0 top-full z-20 mt-2 w-64 rounded-card border border-border bg-card p-3 shadow-float">
      {/* 연도 이동 */}
      <div className="flex items-center justify-between">
        <button
          type="button"
          onClick={() => setYear((y) => y - 1)}
          aria-label="이전 연도"
          className="grid size-7 place-items-center rounded-chip text-text-secondary transition-colors hover:bg-muted"
        >
          <ChevronLeft className="size-4" />
        </button>
        <span className="text-body font-semibold text-foreground">{year}년</span>
        <button
          type="button"
          onClick={() => setYear((y) => y + 1)}
          aria-label="다음 연도"
          className="grid size-7 place-items-center rounded-chip text-text-secondary transition-colors hover:bg-muted"
        >
          <ChevronRight className="size-4" />
        </button>
      </div>

      {/* 12개월 · 3열 */}
      <div className="mt-2 grid grid-cols-3 gap-1.5">
        {MONTHS.map((m) => {
          const isSel = selYear === year && selMonth === m
          return (
            <button
              key={m}
              type="button"
              onClick={() => onPick(year, m)}
              className={cn(
                "rounded-chip py-2 text-body transition-colors",
                isSel ? "bg-primary text-white" : "text-text-secondary hover:bg-muted"
              )}
            >
              {m}월
            </button>
          )
        })}
      </div>
    </div>
  )
}
