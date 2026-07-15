import { useState } from "react"
import { Check, Circle, Lightbulb, Triangle } from "lucide-react"

import type { AnalysisResult, FitLevel } from "@/lib/analysis"
import type { CareerEntry } from "@/lib/resume"
import { cn } from "@/lib/utils"

/** 강점/약점을 하이라이팅 뷰용으로 합친 항목 */
type Item = {
  id: string
  kind: "strength" | "weakness"
  point: string
  matched_requirement: string
  evidence: string
  suggestion?: string
  source_quote: string
}

const FIT: Record<FitLevel, { label: string; badge: string }> = {
  높음: { label: "적합도 높음", badge: "bg-fit-high" },
  보통: { label: "어느 정도 맞아요", badge: "bg-fit-mid" },
  낮음: { label: "조금 더 준비가 필요해요", badge: "bg-fit-low" },
}

function buildItems(result: AnalysisResult): Item[] {
  const strengths = result.strengths.map((s, i) => ({
    id: `s${i}`,
    kind: "strength" as const,
    point: s.point,
    matched_requirement: s.matched_requirement,
    evidence: s.evidence,
    source_quote: s.source_quote ?? "",
  }))
  const weaknesses = result.weaknesses.map((w, i) => ({
    id: `w${i}`,
    kind: "weakness" as const,
    point: w.point,
    matched_requirement: w.matched_requirement,
    evidence: w.reason,
    suggestion: w.suggestion,
    source_quote: w.source_quote ?? "",
  }))
  return [...strengths, ...weaknesses]
}

/** 담당업무 텍스트를 하이라이트 구간으로 분해 (단순 문자열 매칭) */
function toSegments(text: string, items: Item[]): Array<{ text: string; item?: Item }> {
  const hits: Array<{ start: number; end: number; item: Item }> = []
  for (const it of items) {
    if (!it.source_quote) continue
    const idx = text.indexOf(it.source_quote)
    if (idx === -1) continue
    hits.push({ start: idx, end: idx + it.source_quote.length, item: it })
  }
  hits.sort((a, b) => a.start - b.start)

  const segments: Array<{ text: string; item?: Item }> = []
  let pos = 0
  for (const h of hits) {
    if (h.start < pos) continue
    if (h.start > pos) segments.push({ text: text.slice(pos, h.start) })
    segments.push({ text: text.slice(h.start, h.end), item: h.item })
    pos = h.end
  }
  if (pos < text.length) segments.push({ text: text.slice(pos) })
  return segments
}

/** 밑줄 스타일 — 색 배경 없이 border-bottom 2px. 선택 시 진한 색 + 굵게. */
function underlineClass(kind: Item["kind"], active: boolean) {
  return cn(
    "border-b-2",
    kind === "strength"
      ? active
        ? "border-success"
        : "border-[#9fdbbe]"
      : active
        ? "border-warning"
        : "border-[#f0c89c]",
    active && "font-medium"
  )
}

/**
 * 결과 화면 하이라이팅 — 밑줄 + 번호 각주 방식.
 * - 상단: 적합도, 공고요구를 세로 1단씩(하단 너비에 맞춤).
 * - 원문: 담당업무를 끊지 않고 한 문단으로. 근거 구절엔 밑줄 + 위첨자 번호만(배경색 없음).
 * - 각주: 원문 바로 아래, 번호 순서대로 강점/보완점 설명. 원문↔각주 번호 1:1.
 * - 원문 근거 없는 항목(빈 source_quote)은 원문에 표시 없이 각주 맨 아래에 번호 없이 표시.
 */
export function ResumeHighlight({
  result,
  careers,
  showFit = true,
}: {
  result: AnalysisResult
  careers: CareerEntry[]
  /** 적합도 카드 표시 여부. 재분석 '자세히 보기'에선 false (위 성장 카드에서 이미 적합도를 보여줌) */
  showFit?: boolean
}) {
  const items = buildItems(result)
  const strengthItems = items.filter((it) => it.kind === "strength")
  const weaknessItems = items.filter((it) => it.kind === "weakness")
  // 강점만 원문에 밑줄+번호. 보완점은 원문에 표시하지 않고 아래 '더 준비하면 좋아요'로.
  const quotedStrengths = strengthItems.filter((it) => it.source_quote)
  const noQuoteStrengths = strengthItems.filter((it) => !it.source_quote)
  const [selectedId, setSelectedId] = useState<string | null>(null)

  // 번호 매기기 — 원문 등장 순서(경력 순 → 위치 순). 강점만.
  const numberOf = new Map<string, number>()
  quotedStrengths
    .map((it) => {
      let ci = careers.length
      let idx = Number.MAX_SAFE_INTEGER
      for (let k = 0; k < careers.length; k++) {
        const p = careers[k].work.indexOf(it.source_quote)
        if (p !== -1) {
          ci = k
          idx = p
          break
        }
      }
      return { it, ci, idx }
    })
    .sort((a, b) => a.ci - b.ci || a.idx - b.idx)
    .forEach((p, i) => numberOf.set(p.it.id, i + 1))

  const numberedFootnotes = [...quotedStrengths].sort(
    (a, b) => (numberOf.get(a.id) ?? 0) - (numberOf.get(b.id) ?? 0)
  )

  function selectFromText(item: Item) {
    const willSelect = selectedId !== item.id
    setSelectedId(willSelect ? item.id : null)
    if (willSelect) {
      setTimeout(
        () => document.getElementById(`fn-${item.id}`)?.scrollIntoView({ behavior: "smooth", block: "nearest" }),
        0
      )
    }
  }

  function selectFromFootnote(item: Item) {
    const willSelect = selectedId !== item.id
    setSelectedId(willSelect ? item.id : null)
    if (willSelect && item.source_quote) {
      setTimeout(
        () => document.getElementById(`u-${item.id}`)?.scrollIntoView({ behavior: "smooth", block: "center" }),
        0
      )
    }
  }

  return (
    <div className="flex flex-col">
      {/* 상단 카드 — 적합도, 충족 현황 (세로 1단씩, 내부 간격 24px 유지) */}
      <div className="flex flex-col gap-6">
        {showFit && <FitCard fit={result.overall_fit} />}
        <FulfillmentCard result={result} />
      </div>

      {/* 원문 + 각주 — 상단 카드와 확실히 벌어지게 (80px, 새 섹션 시작 느낌) */}
      {/* 상단 카드 ↔ 원문 간격 — 첫 분석(카드 2개)은 80px, 재분석 '자세히 보기'(카드 1개)는 44px */}
      <div className={showFit ? "mt-20" : "mt-11"}>
        <h2 className="text-h3 font-semibold text-foreground">이력서에서 이렇게 읽었어요</h2>
        <p className="mt-0.5 text-caption text-text-muted">
          밑줄 친 부분을 누르면, 아래 같은 번호의 설명으로 이어져요.
        </p>

        {/* 원문 — 담당업무를 끊지 않고 한 문단으로. 모든 경력을 처음부터 다 펼쳐 보여준다. */}
        <div className="mt-4 rounded-card border border-border bg-card p-5">
          <div className="flex flex-col gap-4">
            {careers.map((c, i) => (
              <CareerParagraph
                key={i}
                career={c}
                items={quotedStrengths}
                numberOf={numberOf}
                selectedId={selectedId}
                onSelect={selectFromText}
              />
            ))}
          </div>
        </div>

        {/* 각주 — 번호 순서대로 (원문에 밑줄+번호가 있는 강점/보완점) */}
        <ol className="mt-5 flex flex-col gap-2.5">
          {numberedFootnotes.map((it) => (
            <Footnote
              key={it.id}
              item={it}
              number={numberOf.get(it.id) ?? null}
              active={selectedId === it.id}
              onClick={() => selectFromFootnote(it)}
            />
          ))}
        </ol>

        {/* 원문 근거 없는(자격·스킬에서 확인) 강점 — 점선으로 명확히 구분 */}
        {noQuoteStrengths.length > 0 && (
          <div className="mt-3.5 border-t border-dashed border-[#e5e5ea] pt-3.5 dark:border-white/[0.12]">
            <p className="mb-2.5 text-caption text-text-muted">본문에는 없지만, 다른 곳에서 확인한 강점이에요</p>
            <ul className="flex flex-col gap-2.5">
              {noQuoteStrengths.map((it) => (
                <Footnote
                  key={it.id}
                  item={it}
                  number={null}
                  active={selectedId === it.id}
                  onClick={() => selectFromFootnote(it)}
                />
              ))}
            </ul>
          </div>
        )}

        {/* 보완점 — 원문에 밑줄 치지 않고 여기 모아서 (주황 계열, 부드럽게 · 경고색 없음) */}
        {weaknessItems.length > 0 && (
          <div className="mt-4 border-t border-border pt-3.5">
            <div className="mb-2.5 flex items-center gap-1.5">
              <Lightbulb className="size-4 shrink-0 text-warning" />
              <p className="text-caption font-medium text-text-secondary">이런 점을 더 준비하면 좋아요</p>
            </div>
            <ul className="flex flex-col gap-2.5">
              {weaknessItems.map((it) => (
                <Footnote
                  key={it.id}
                  item={it}
                  number={null}
                  active={selectedId === it.id}
                  onClick={() => selectFromFootnote(it)}
                />
              ))}
            </ul>
          </div>
        )}
      </div>
    </div>
  )
}

/** 경력 한 건 — 회사·직무 + 담당업무(밑줄 + 위첨자 번호, 배경색 없음) */
function CareerParagraph({
  career,
  items,
  numberOf,
  selectedId,
  onSelect,
}: {
  career: CareerEntry
  items: Item[]
  numberOf: Map<string, number>
  selectedId: string | null
  onSelect: (item: Item) => void
}) {
  return (
    <div>
      {(career.company || career.role) && (
        <p className="mb-1 text-caption font-medium text-text-muted">
          {[career.company, career.role].filter(Boolean).join(" · ")}
        </p>
      )}
      <p className="text-body leading-[2.1] text-foreground">
        {toSegments(career.work, items).map((seg, si) =>
          seg.item ? (
            <span
              key={si}
              id={`u-${seg.item.id}`}
              role="button"
              tabIndex={0}
              onClick={() => onSelect(seg.item!)}
              onKeyDown={(e) => {
                if (e.key === "Enter" || e.key === " ") {
                  e.preventDefault()
                  onSelect(seg.item!)
                }
              }}
              className="cursor-pointer"
            >
              <span className={underlineClass(seg.item.kind, seg.item.id === selectedId)}>{seg.text}</span>
              <sup
                className={cn(
                  "ml-0.5 text-[0.7em] font-bold",
                  seg.item.kind === "strength" ? "text-success" : "text-warning-text"
                )}
              >
                {numberOf.get(seg.item.id)}
              </sup>
            </span>
          ) : (
            <span key={si}>{seg.text}</span>
          )
        )}
      </p>
    </div>
  )
}

/** 각주 한 줄 — [번호] 제목 · 연결요구 / 근거(+개선안). 선택 시 옅은 배경 강조. */
function Footnote({
  item,
  number,
  active,
  onClick,
}: {
  item: Item
  number: number | null
  active: boolean
  onClick: () => void
}) {
  const isWeakness = item.kind === "weakness"
  const isCredential = item.kind === "strength" && number == null // 원문 근거 없는 강점(자격·스킬)
  // 원문 밑줄로 이어지는(번호 있는) 강점만 클릭·호버·강조. 보완점·자격스킬 강점은 읽기 전용.
  const linkable = number != null

  const body = (
    <>
      {/* 아이콘 — 번호 배지(강점) / 자격·스킬 초록 체크 / 보완점 주황 전구. 모두 같은 크기 원. */}
      {number != null ? (
        <span className="mt-0.5 flex size-5 shrink-0 items-center justify-center rounded-full bg-success text-badge font-bold text-white">
          {number}
        </span>
      ) : isWeakness ? (
        <span className="mt-0.5 flex size-5 shrink-0 items-center justify-center rounded-full bg-[#fdf0e3] dark:bg-warning-bg">
          <Lightbulb className="size-3.5 text-warning" />
        </span>
      ) : (
        <span className="mt-0.5 flex size-5 shrink-0 items-center justify-center rounded-full bg-[#e9f7ef] dark:bg-success-bg">
          <Check className="size-3.5 text-success" />
        </span>
      )}

      <div className="flex flex-1 flex-col gap-1">
        <div className="flex flex-wrap items-baseline gap-x-2 gap-y-0.5">
          <span className="text-body font-semibold text-foreground">{item.point}</span>
          <span className="text-caption text-text-muted">· {item.matched_requirement}</span>
          {isCredential && (
            <span className="rounded-full bg-[#f2f2f5] px-2 py-0.5 text-badge text-[#6b7280] dark:bg-white/[0.08] dark:text-text-secondary">
              자격·스킬에서 확인
            </span>
          )}
        </div>
        <p className="text-body leading-relaxed text-text-secondary">{item.evidence}</p>
        {item.suggestion && (
          <div className="mt-1 rounded-[10px] bg-[#f5f5f7] px-[14px] py-[12px] dark:bg-white/[0.05]">
            <p className="text-caption font-semibold text-foreground">이렇게 해보면 좋아요</p>
            <p className="mt-[4px] text-body leading-[1.5] text-text-secondary">{item.suggestion}</p>
          </div>
        )}
        {/* 예외 안내 — 왜 원문에 표시하지 않았는지 (자격·스킬 강점만) */}
        {isCredential && (
          <div className="mt-2 rounded-[8px] bg-[#fafafc] px-3 py-2.5 dark:bg-white/[0.03]">
            <p className="text-caption leading-relaxed text-text-muted">
              이력서 본문(담당업무)엔 직접 적혀있지 않아, 위 원문에는 표시하지 않았어요. 자격·스킬에서 확인한 강점이에요.
            </p>
          </div>
        )}
      </div>
    </>
  )

  return (
    <li id={`fn-${item.id}`}>
      {linkable ? (
        <button
          type="button"
          onClick={onClick}
          className={cn(
            "flex w-full gap-3 rounded-card p-3 text-left transition-colors",
            active ? "bg-success-bg/60" : "hover:bg-surface-subtle/60"
          )}
        >
          {body}
        </button>
      ) : (
        // 보완점·자격스킬 강점: 이동할 원문 밑줄이 없어 상호작용/fill 없이 읽기 전용
        <div className="flex w-full gap-3 rounded-card p-3 text-left">{body}</div>
      )}
    </li>
  )
}

/** 적합도 카드 — 배지 + 매칭% + 총평(핵심 구절 강조). 옅은 보라 배경(#F4F3FB). */
function FitCard({ fit }: { fit: AnalysisResult["overall_fit"] }) {
  const c = FIT[fit.level]
  const isLow = fit.level === "낮음"
  const at = fit.highlight ? fit.summary.indexOf(fit.highlight) : -1
  const em =
    at === -1
      ? null
      : { before: fit.summary.slice(0, at), key: fit.highlight, after: fit.summary.slice(at + fit.highlight.length) }

  return (
    <div
      className={cn(
        "rounded-card p-6 dark:ring-1 dark:ring-white/10",
        // 낮음은 회색 계열로 확정(#F1F2F4), 그 외는 옅은 보라
        isLow ? "bg-[#f1f2f4] dark:bg-fit-low-bg" : "bg-[#f4f3fb] dark:bg-primary-bg"
      )}
    >
      <div className="flex flex-wrap items-center gap-2">
        <span className={cn("inline-flex items-center rounded-full px-3 py-1 text-caption font-semibold text-white", c.badge)}>
          {c.label}
        </span>
        <span className="text-caption text-text-muted">
          AI 매칭 <span className="ls-normal">{`${fit.match_score}%`}</span>
        </span>
      </div>
      <p className="mt-4 text-[1.25rem] leading-[1.5]">
        {em ? (
          <>
            <span className="text-text-secondary">{em.before}</span>
            <b className={cn("font-bold", isLow ? "text-[#5a6270]" : "text-foreground")}>{em.key}</b>
            <span className="text-text-secondary">{em.after}</span>
          </>
        ) : (
          <span className="text-text-secondary">{fit.summary}</span>
        )}
      </p>
    </div>
  )
}

type ReqStatus = "met" | "partial" | "none"

/** 요구 충족 상태 — 강점에서 다뤄졌으면 충족, 보완점이면 심각도에 따라 부분/아직, 아니면 아직 */
function reqStatus(req: string, result: AnalysisResult): ReqStatus {
  if (result.strengths.some((s) => (s.matched_requirement ?? "").includes(req))) return "met"
  const w = result.weaknesses.find((x) => (x.matched_requirement ?? "").includes(req))
  if (w) return w.severity === "critical" ? "none" : "partial"
  return "none"
}

/** 충족 현황 카드 — 각 요구에 충족/부분/아직 아이콘 + 요약 한 줄. 흰 배경 + 얇은 테두리. */
function FulfillmentCard({ result }: { result: AnalysisResult }) {
  const must = result.job_requirements.must_have
  const nice = result.job_requirements.nice_to_have
  const st = (r: string) => reqStatus(r, result)
  const metMust = must.filter((r) => st(r) === "met").length
  const metNice = nice.filter((r) => st(r) === "met").length

  return (
    <div className="rounded-card border border-border bg-card p-6">
      <div className="mb-4 flex flex-wrap items-baseline justify-between gap-x-3 gap-y-1">
        <h3 className="text-h3 font-semibold text-foreground">충족 현황</h3>
        <p className="text-caption text-text-secondary">
          필수 {must.length}개 중{" "}
          {/* 0개는 초록 강조 대신 회색(#9494A0)으로 — '하나도 못했다'가 아프게 도드라지지 않도록 */}
          {metMust > 0 ? (
            <b className="font-semibold text-success">{metMust}개</b>
          ) : (
            <span className="text-text-muted">{metMust}개</span>
          )}{" "}
          충족
          <span className="text-text-muted">
            {" · "}우대 {nice.length}개 중 {metNice}개
          </span>
        </p>
      </div>
      <div className="grid gap-x-6 gap-y-5 sm:grid-cols-2">
        <ReqStatusCol title="필수" items={must} statusOf={st} />
        <ReqStatusCol title="우대" items={nice} statusOf={st} />
      </div>
    </div>
  )
}

function ReqStatusCol({
  title,
  items,
  statusOf,
}: {
  title: string
  items: string[]
  statusOf: (r: string) => ReqStatus
}) {
  return (
    <div>
      <p className="mb-2.5 text-caption font-semibold text-text-secondary">{title}</p>
      {items.length === 0 ? (
        <p className="text-body text-text-muted">—</p>
      ) : (
        <ul className="flex flex-col gap-2.5">
          {items.map((item, i) => {
            const s = statusOf(item)
            return (
              <li
                key={i}
                className={cn(
                  "flex items-start gap-2 text-body",
                  s === "none" ? "text-text-muted" : "text-foreground"
                )}
              >
                <StatusIcon status={s} />
                <span>{item}</span>
              </li>
            )
          })}
        </ul>
      )}
    </div>
  )
}

/** 충족(체크 초록 #1D9E75) / 부분(세모 회색) / 아직(빈 원 연회색) — 경고색 없이 차분하게 */
function StatusIcon({ status }: { status: ReqStatus }) {
  if (status === "met") return <Check className="mt-0.5 size-4 shrink-0 text-success" />
  if (status === "partial") return <Triangle className="mt-[3px] size-3 shrink-0 text-text-muted" />
  return <Circle className="mt-0.5 size-4 shrink-0 text-text-muted/40" />
}
