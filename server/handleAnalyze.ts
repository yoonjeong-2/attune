/*
 * 분석 요청 처리 코어 (프레임워크 독립).
 * Express(server/index.ts)와 Vercel 서버리스 함수(api/analyze.ts)가 함께 쓴다 —
 * 로직이 두 곳에서 갈라지지 않도록 여기 한 곳에만 둔다.
 * 반환값은 { status, body } — 각 진입점이 자기 방식대로 응답으로 변환한다.
 */
import { analyzeMatch, hasApiKey } from "./analyze.ts"
import { extractText, type SourceInput } from "./extract.ts"
import { MOCK_RESULTS, pickMockCase, pickMockDomain, type MockCase, type MockDomain } from "./mocks.ts"

// 목업 모드 스위치 (UI 개발/데모용): USE_MOCK=true 면 실제 Claude API 대신 가짜 결과를 반환.
const USE_MOCK = process.env.USE_MOCK === "true"
const MOCK_CASE_ENV = process.env.MOCK_CASE
const DEFAULT_MOCK_CASE: MockCase =
  MOCK_CASE_ENV === "높음" || MOCK_CASE_ENV === "낮음" || MOCK_CASE_ENV === "보통" ? MOCK_CASE_ENV : "보통"
const DEFAULT_MOCK_DOMAIN: MockDomain = process.env.MOCK_DOMAIN === "기획" ? "기획" : "개발"

export interface AnalyzeBody {
  resume?: SourceInput
  jobPosting?: SourceInput
  demo?: boolean
  mockCase?: { domain?: string; level?: string }
}

export interface AnalyzeReply {
  status: number
  body: Record<string, unknown>
}

/** 분석 요청 바디를 받아 구조화된 응답을 만든다. (§6-3 변환 / §10 분석 흐름) */
export async function handleAnalyze(body: AnalyzeBody): Promise<AnalyzeReply> {
  const { resume, jobPosting } = body ?? {}

  if (!resume?.raw?.trim() || !jobPosting?.raw?.trim()) {
    return {
      status: 400,
      body: { ok: false, error: "invalid_input", message: "서류와 채용공고를 모두 입력해 주세요." },
    }
  }

  // 목업 모드 — 실제 API/키 없이 미리 정의된 가짜 결과 반환 (§10 형식 동일).
  if (USE_MOCK) {
    const text = `${resume.raw} ${jobPosting.raw}`
    // 데모에서 케이스를 명시하면 그대로 사용, 아니면 입력 텍스트로 추정
    const mcDomain = body.mockCase?.domain
    const mcLevel = body.mockCase?.level
    const domain: MockDomain =
      mcDomain === "기획" || mcDomain === "개발" ? mcDomain : pickMockDomain(text, DEFAULT_MOCK_DOMAIN)
    const mockCase: MockCase =
      mcLevel === "높음" || mcLevel === "보통" || mcLevel === "낮음"
        ? mcLevel
        : pickMockCase(text, DEFAULT_MOCK_CASE)
    // 데모 전환은 즉시, 일반 분석 흐름은 로딩 화면이 잠깐 보이도록 약간 지연
    if (!body.demo) await new Promise((r) => setTimeout(r, 600))
    return { status: 200, body: { ok: true, result: MOCK_RESULTS[domain][mockCase] } }
  }

  // 키가 없으면 실제 분석 불가 — 하드코딩하지 않고(§12) 안내만.
  if (!hasApiKey()) {
    return {
      status: 200,
      body: {
        ok: false,
        error: "no_api_key",
        message: "서버에 분석용 API 키가 설정되지 않았어요. 환경변수에 ANTHROPIC_API_KEY를 넣어 주세요.",
      },
    }
  }

  // 1) 입력 변환(§6-3): 링크면 서버가 불러와 텍스트로. 실패 시 텍스트 붙여넣기로 유도(§6-2).
  const [resumeEx, jobEx] = await Promise.all([extractText(resume), extractText(jobPosting)])
  if (!resumeEx.ok) {
    return {
      status: 200,
      body: {
        ok: false,
        error: "extract_failed",
        which: "resume",
        message: `내 서류 링크에서 ${resumeEx.reason} 내용을 직접 붙여넣어 주세요.`,
      },
    }
  }
  if (!jobEx.ok) {
    return {
      status: 200,
      body: {
        ok: false,
        error: "extract_failed",
        which: "job",
        message: `채용공고 링크에서 ${jobEx.reason} 공고 내용을 직접 붙여넣어 주세요.`,
      },
    }
  }

  // 2) 분석(§10)
  try {
    const result = await analyzeMatch({ resumeText: resumeEx.text, jobText: jobEx.text })
    return { status: 200, body: { ok: true, result } }
  } catch (err) {
    const status = (err as { status?: number })?.status
    let message = "분석 중 문제가 생겼어요. 잠시 후 다시 시도해 주세요."
    if (status === 401 || status === 403) {
      message = "분석용 API 키가 유효하지 않은 것 같아요. 키를 확인해 주세요."
    } else if (status === 429) {
      message = "요청이 몰렸어요. 잠시 후 다시 시도해 주세요."
    }
    console.error("[analyze] 실패:", err instanceof Error ? err.message : err)
    return { status: 200, body: { ok: false, error: "analysis_failed", message } }
  }
}

/** 상태 확인용 응답 바디 (Express /api/health, Vercel api/health 공용) */
export function healthBody(): Record<string, unknown> {
  return { ok: true, hasApiKey: hasApiKey(), mock: USE_MOCK }
}
