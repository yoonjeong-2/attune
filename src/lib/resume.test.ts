import { describe, expect, it } from "vitest"

import { emptyResumeForm, isResumeReady, serializeResume } from "@/lib/resume"
import type { ResumeForm } from "@/lib/resume"

/** 테스트용 폼 헬퍼 — 빈 폼에서 일부만 덮어씀 */
function form(over: Partial<ResumeForm>): ResumeForm {
  return { ...emptyResumeForm(), ...over }
}

describe("emptyResumeForm", () => {
  it("빈 경력 1개 + 빈 필드로 시작", () => {
    const f = emptyResumeForm()
    expect(f.careers).toHaveLength(1)
    expect(f.careers[0].company).toBe("")
    expect(f.skills).toBe("")
  })
})

describe("isResumeReady", () => {
  it("경력(회사+담당업무) + 스킬이 모두 있어야 true", () => {
    const ready = form({
      careers: [{ company: "OO핀테크", role: "백엔드", work: "결제 API 개발", tenure: { start: "2022-01", end: "현재" } }],
      skills: "Java, Spring",
    })
    expect(isResumeReady(ready)).toBe(true)
  })

  it("빈 폼은 false", () => {
    expect(isResumeReady(emptyResumeForm())).toBe(false)
  })

  it("스킬이 비면 false", () => {
    const noSkill = form({
      careers: [{ company: "OO", role: "", work: "일함", tenure: { start: null, end: null } }],
      skills: "",
    })
    expect(isResumeReady(noSkill)).toBe(false)
  })

  it("담당업무가 비면 false", () => {
    const noWork = form({
      careers: [{ company: "OO", role: "", work: "", tenure: { start: null, end: null } }],
      skills: "Java",
    })
    expect(isResumeReady(noWork)).toBe(false)
  })
})

describe("serializeResume", () => {
  it("빈 폼은 빈 문자열", () => {
    expect(serializeResume(emptyResumeForm())).toBe("")
  })

  it("경력·스킬을 섹션 텍스트로 직렬화", () => {
    const f = form({
      careers: [{ company: "핀테크", role: "백엔드", work: "결제 시스템 설계", tenure: { start: "2022-03", end: "현재" } }],
      skills: "Java, Spring",
    })
    const s = serializeResume(f)
    expect(s).toContain("[경력]")
    expect(s).toContain("핀테크 · 백엔드")
    expect(s).toContain("(2022-03 ~ 현재)")
    expect(s).toContain("담당업무: 결제 시스템 설계")
    expect(s).toContain("[스킬]")
    expect(s).toContain("Java, Spring")
  })
})
