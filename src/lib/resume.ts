/*
 * 내 서류(이력서) 데이터 모델 + 분석용 텍스트 변환 (CLAUDE.md §6-3 변환 계층)
 *
 * 화면에서는 필드 구조로 입력받되, 분석 단계에는 "텍스트"로 넘긴다.
 * 즉 여기(serializeResume)가 구조 → 텍스트 변환의 자리다.
 */
import type { Tenure } from "@/components/input/MonthRangePicker"

export interface CareerEntry {
  company: string // 회사명
  tenure: Tenure // 재직 기간 (월 선택 UI)
  role: string // 직무
  work: string // 담당업무
}

export interface ResumeForm {
  careers: CareerEntry[]
  skills: string
  // 보조(선택) — 접어두고 필요시 펼침
  projects: string
  education: string
  certifications: string
}

/** 입력 화면 폼 원본 — 분석 실패로 되돌아올 때(§6-2 fallback) 복원하려고 함께 들고 다닌다. */
export interface InputDraft {
  resume: ResumeForm
  job: string
}

export function emptyTenure(): Tenure {
  return { start: null, end: null }
}

export function emptyCareer(): CareerEntry {
  return { company: "", tenure: emptyTenure(), role: "", work: "" }
}

export function emptyResumeForm(): ResumeForm {
  return { careers: [emptyCareer()], skills: "", projects: "", education: "", certifications: "" }
}

/** 재직 기간을 읽기 좋은 문자열로: "2022-03 ~ 현재". 둘 다 비면 빈 문자열. */
function formatTenure(t: Tenure): string {
  if (!t.start && !t.end) return ""
  return `${t.start ?? "?"} ~ ${t.end ?? "?"}`
}

/**
 * 구조화된 내 서류 → 분석용 텍스트 (§6-3 변환).
 * 빈 항목은 빼고, 사람이 읽는 섹션 형식으로 직렬화한다.
 */
export function serializeResume(r: ResumeForm): string {
  const lines: string[] = []

  const careers = r.careers.filter(
    (c) => c.company.trim() || c.role.trim() || c.work.trim() || c.tenure.start
  )
  if (careers.length) {
    lines.push("[경력]")
    for (const c of careers) {
      const head = [c.company.trim(), c.role.trim()].filter(Boolean).join(" · ")
      const period = formatTenure(c.tenure)
      lines.push(`- ${head || "(회사명 미기재)"}${period ? ` (${period})` : ""}`)
      if (c.work.trim()) lines.push(`  담당업무: ${c.work.trim()}`)
    }
  }

  const section = (title: string, body: string) => {
    if (!body.trim()) return
    lines.push("", `[${title}]`, body.trim())
  }
  section("스킬", r.skills)
  section("프로젝트", r.projects)
  section("학력", r.education)
  section("자격", r.certifications)

  return lines.join("\n").trim()
}

/** 분석을 시작할 최소 입력인지 — 경력 1개 이상(회사명+담당업무) + 스킬 (필수 필드). */
export function isResumeReady(r: ResumeForm): boolean {
  const hasCareer = r.careers.some((c) => c.company.trim() && c.work.trim())
  return hasCareer && r.skills.trim().length > 0
}
