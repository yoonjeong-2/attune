/*
 * 입력 변환 계층 (서버 측, CLAUDE.md §6-3, §8)
 * 링크 → 실제 텍스트 추출. 브라우저는 CORS로 남의 페이지를 못 읽으므로 서버(프록시)가 대신 가져온다.
 * 이미지/PDF 등 텍스트 추출이 불가한 경우는 실패로 반환 → 상위에서 fallback 안내(§6-2).
 */

export type SourceKind = "empty" | "text" | "link" | "unsupported-image"

export interface SourceInput {
  raw: string
  kind: SourceKind
}

export type ExtractResult =
  | { ok: true; text: string }
  | { ok: false; reason: string }

const MAX_CHARS = 30_000 // 토큰 폭주 방지용 상한
const MIN_CHARS = 80 // 이보다 짧으면 추출 실패(봇 차단·JS 렌더 등)로 간주

/** 원본 입력을 분석 가능한 순수 텍스트로 변환한다. */
export async function extractText(source: SourceInput): Promise<ExtractResult> {
  const raw = source.raw?.trim() ?? ""
  if (!raw) return { ok: false, reason: "빈 입력이에요." }

  // 텍스트는 그대로 사용
  if (source.kind === "text") {
    return { ok: true, text: raw.slice(0, MAX_CHARS) }
  }

  // 링크만 여기서 불러온다. 그 외(이미지 등)는 지원하지 않음.
  if (source.kind !== "link") {
    return { ok: false, reason: "지원되지 않는 형식이에요." }
  }

  try {
    const res = await fetch(raw, {
      redirect: "follow",
      signal: AbortSignal.timeout(15_000),
      headers: {
        // 일부 사이트의 기본 봇 차단을 피하기 위한 일반 브라우저 UA
        "user-agent":
          "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0 Safari/537.36",
        accept: "text/html,application/xhtml+xml,text/plain;q=0.9,*/*;q=0.8",
      },
    })

    if (!res.ok) {
      return { ok: false, reason: `페이지를 불러오지 못했어요 (HTTP ${res.status}).` }
    }

    const contentType = res.headers.get("content-type") ?? ""
    const isTextual = /text\/html|text\/plain|application\/xhtml/i.test(contentType)
    if (!isTextual) {
      // PDF/이미지 등 → 텍스트 추출 불가 (§6 미지원)
      return { ok: false, reason: "이 링크는 텍스트를 추출할 수 없는 형식이에요." }
    }

    const body = await res.text()
    const text = /html|xhtml/i.test(contentType) ? htmlToText(body) : collapse(body)

    if (text.length < MIN_CHARS) {
      // 로그인/봇 차단/자바스크립트 렌더 페이지 등 → 본문을 못 얻음
      return { ok: false, reason: "링크에서 읽을 수 있는 내용을 찾지 못했어요." }
    }

    return { ok: true, text: text.slice(0, MAX_CHARS) }
  } catch (err) {
    const aborted = err instanceof Error && err.name === "TimeoutError"
    return {
      ok: false,
      reason: aborted ? "링크 불러오기가 시간 초과됐어요." : "링크를 불러오는 중 문제가 생겼어요.",
    }
  }
}

/** 아주 단순한 HTML → 텍스트 변환 (본문만 대략 추출) */
function htmlToText(html: string): string {
  const stripped = html
    // 본문에 불필요한 블록 제거
    .replace(/<script[\s\S]*?<\/script>/gi, " ")
    .replace(/<style[\s\S]*?<\/style>/gi, " ")
    .replace(/<noscript[\s\S]*?<\/noscript>/gi, " ")
    .replace(/<head[\s\S]*?<\/head>/gi, " ")
    // 블록 경계는 줄바꿈으로
    .replace(/<\/(p|div|section|article|li|h[1-6]|br|tr)>/gi, "\n")
    // 나머지 태그 제거
    .replace(/<[^>]+>/g, " ")
  return collapse(decodeEntities(stripped))
}

/** 자주 쓰는 HTML 엔티티 디코드 */
function decodeEntities(s: string): string {
  return s
    .replace(/&nbsp;/gi, " ")
    .replace(/&amp;/gi, "&")
    .replace(/&lt;/gi, "<")
    .replace(/&gt;/gi, ">")
    .replace(/&quot;/gi, '"')
    .replace(/&#39;|&apos;/gi, "'")
    .replace(/&#(\d+);/g, (_, n) => safeCodePoint(parseInt(n, 10)))
    .replace(/&#x([0-9a-f]+);/gi, (_, h) => safeCodePoint(parseInt(h, 16)))
}

function safeCodePoint(code: number): string {
  try {
    return String.fromCodePoint(code)
  } catch {
    return " "
  }
}

/** 공백/빈 줄 정리 */
function collapse(s: string): string {
  return s
    .replace(/[ \t\f\r]+/g, " ")
    .replace(/\n\s*\n\s*\n+/g, "\n\n")
    .split("\n")
    .map((line) => line.trim())
    .join("\n")
    .trim()
}
