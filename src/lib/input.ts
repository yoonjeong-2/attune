/*
 * 입력 변환 계층 (CLAUDE.md §6-3)
 *
 * "입력을 텍스트로 변환하는 부분"과 "그 텍스트를 분석하는 부분"을 분리한다.
 * 이 파일은 전자(前者)의 자리다. 지금(2단계)은 사용자가 넣은 원본을
 * 텍스트/링크/미지원(이미지)으로 판별하는 것까지만 담당한다.
 * 이후 3단계에서 링크 → 실제 텍스트 추출(서버 프록시 경유)이 여기에 붙는다.
 */

export type InputKind = "empty" | "text" | "link" | "unsupported-image"

export interface SourceInput {
  /** 사용자가 넣은 원본 문자열 (텍스트 또는 링크) */
  raw: string
  /** 휴리스틱으로 판별한 입력 형태 */
  kind: InputKind
}

/** 화면 1에서 수집해 분석 단계로 넘기는 입력 묶음 */
export interface AnalysisInput {
  resume: SourceInput
  jobPosting: SourceInput
}

/** 이미지/PDF 등 텍스트 추출이 불가한 확장자 (MVP 미지원, §6) */
const UNSUPPORTED_EXT = /\.(pdf|png|jpe?g|gif|webp|bmp|tiff?|heic|heif|svg)(?:[?#]|$)/i

/** 이미지·PDF로 export 되는 게 일반적이라 텍스트 추출이 어려운 호스트 (§6-1: 구글드라이브 PDF 링크 등) */
const UNSUPPORTED_HOST = /^https?:\/\/(?:[^/]*\.)?(?:drive\.google\.com|docs\.google\.com\/(?:file|viewer))/i

function isUrl(value: string): boolean {
  if (/\s/.test(value)) return false // 공백이 있으면 링크가 아니라 텍스트로 본다
  return /^https?:\/\/\S+$/i.test(value)
}

/** 원본 문자열이 텍스트인지, 링크인지, 미지원(이미지)인지 판별한다. */
export function detectInput(raw: string): InputKind {
  const value = raw.trim()
  if (!value) return "empty"
  if (!isUrl(value)) return "text"
  if (UNSUPPORTED_EXT.test(value) || UNSUPPORTED_HOST.test(value)) {
    return "unsupported-image"
  }
  return "link"
}

/** 분석 단계로 넘길 형태로 정규화한다. */
export function toSourceInput(raw: string): SourceInput {
  return { raw: raw.trim(), kind: detectInput(raw) }
}

/** 분석을 시작할 수 있는(=텍스트 또는 지원되는 링크) 입력인지 */
export function isAnalyzable(kind: InputKind): boolean {
  return kind === "text" || kind === "link"
}
