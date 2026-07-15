/*
 * 분석 API 클라이언트 (프론트 측, CLAUDE.md §6-3의 "분석" 진입점)
 * 얇은 서버의 POST /api/analyze 를 호출한다. 결과 타입은 §10 스키마와 일치.
 */
import type { AnalysisInput } from "@/lib/input"

export type FitLevel = "높음" | "보통" | "낮음"

/** 데모 전환용 직군 */
export type MockDomain = "기획" | "개발"

/** 약점 심각도 3단계 (§5) */
export type Severity = "critical" | "recommended" | "enhancement"

export interface Strength {
  point: string
  matched_requirement: string
  evidence: string
  /** 근거가 된 이력서 담당업무 원문 구절 (하이라이팅용, 없으면 빈 문자열/미지정) */
  source_quote?: string
}

export interface Weakness {
  point: string
  matched_requirement: string
  severity: Severity
  reason: string
  suggestion: string
  /** 근거가 된 이력서 담당업무 원문 구절 (하이라이팅용, 없으면 빈 문자열/미지정) */
  source_quote?: string
}

export interface AnalysisResult {
  overall_fit: {
    level: FitLevel
    /** 적합도 점수 0~100 (정수) */
    match_score: number
    /** 한 줄 총평 */
    summary: string
    /** summary 안에서 강조할 핵심 구절 (summary의 부분 문자열) */
    highlight: string
  }
  job_requirements: { must_have: string[]; nice_to_have: string[] }
  strengths: Strength[]
  weaknesses: Weakness[]
}

/** 서버가 돌려주는 응답 (성공 또는 구조화된 실패) */
export type AnalyzeResponse =
  | { ok: true; result: AnalysisResult }
  | { ok: false; error: string; which?: "resume" | "job"; message: string }

/**
 * /api/analyze 호출. 네트워크/파싱 오류도 구조화된 실패로 감싼다.
 * mockCase 를 주면(데모로 채운 경우) 목업 모드에서 그 케이스 결과를 그대로 돌려준다.
 */
export async function requestAnalysis(
  input: AnalysisInput,
  mockCase?: { domain: MockDomain; level: FitLevel }
): Promise<AnalyzeResponse> {
  let res: Response
  try {
    res = await fetch("/api/analyze", {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify(mockCase ? { ...input, mockCase } : input),
    })
  } catch {
    return {
      ok: false,
      error: "network",
      message: "분석 서버에 연결하지 못했어요. 백엔드가 실행 중인지 확인해 주세요 (npm run server).",
    }
  }

  try {
    const data = (await res.json()) as AnalyzeResponse
    return data
  } catch {
    return { ok: false, error: "bad_response", message: "서버 응답을 이해하지 못했어요." }
  }
}

/** 서버가 목업 모드인지 확인 (데모 전환 바 노출 여부용) */
export async function fetchMockMode(): Promise<boolean> {
  try {
    const res = await fetch("/api/health")
    const data = (await res.json()) as { mock?: boolean }
    return data?.mock === true
  } catch {
    return false
  }
}

/** 데모 전환 — 특정 직군×적합도 목업을 즉시 받아온다 (demo 플래그로 로딩 지연 생략) */
export async function fetchMockCase(domain: MockDomain, level: FitLevel): Promise<AnalyzeResponse> {
  const keyword = `${domain} ${level}`
  try {
    const res = await fetch("/api/analyze", {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({
        resume: { raw: keyword, kind: "text" },
        jobPosting: { raw: keyword, kind: "text" },
        demo: true,
        mockCase: { domain, level },
      }),
    })
    return (await res.json()) as AnalyzeResponse
  } catch {
    return { ok: false, error: "network", message: "케이스 전환에 실패했어요." }
  }
}
