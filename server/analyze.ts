/*
 * 분석 계층 (CLAUDE.md §8, §10) — Claude API 호출.
 * 입력 변환(extract.ts)과 분리된, "텍스트를 분석하는" 부분(§6-3).
 * API 키는 환경변수(ANTHROPIC_API_KEY)로만 받는다. 코드에 하드코딩 금지(§8, §12).
 */
import Anthropic from "@anthropic-ai/sdk"

import { ANALYSIS_SCHEMA, buildUserContent, SYSTEM_PROMPT } from "./prompt"

// 기본 모델은 최신 Opus. 비용/속도를 조절하고 싶으면 .env의 ANTHROPIC_MODEL로 교체 가능.
const MODEL = process.env.ANTHROPIC_MODEL || "claude-opus-4-8"

// 적응형 사고(thinking: adaptive)는 4.6세대 이상에서만 지원된다.
// Haiku 4.5 등 구세대에 보내면 400이 나므로, 지원 모델일 때만 켠다.
const ADAPTIVE_MODELS = ["opus-4-8", "opus-4-7", "opus-4-6", "sonnet-5", "sonnet-4-6", "fable-5", "mythos-5"]
const useAdaptiveThinking = ADAPTIVE_MODELS.some((m) => MODEL.includes(m))

export interface AnalyzeInput {
  resumeText: string
  jobText: string
}

/** 서버에 분석용 자격증명이 설정돼 있는지 */
export function hasApiKey(): boolean {
  return Boolean(process.env.ANTHROPIC_API_KEY)
}

let client: Anthropic | null = null
function getClient(): Anthropic {
  if (!client) client = new Anthropic() // ANTHROPIC_API_KEY 를 환경변수에서 읽음
  return client
}

/**
 * 서류/공고 텍스트를 Claude에 넘겨 구조화된 분석 결과(JSON)를 받는다.
 * output_config.format 으로 스키마를 강제하므로 결과는 ANALYSIS_SCHEMA 형태를 따른다.
 */
export async function analyzeMatch({ resumeText, jobText }: AnalyzeInput): Promise<unknown> {
  const message = await getClient().messages.create({
    model: MODEL,
    max_tokens: 16_000,
    // 매칭 분석은 추론이 필요 → 지원 모델에서만 적응형 사고 사용 (구세대엔 미포함)
    ...(useAdaptiveThinking ? { thinking: { type: "adaptive" as const } } : {}),
    system: SYSTEM_PROMPT,
    messages: [{ role: "user", content: buildUserContent(resumeText, jobText) }],
    // 구조화 출력: 응답을 스키마에 맞는 JSON으로 제약
    output_config: { format: { type: "json_schema", schema: ANALYSIS_SCHEMA } },
  } as Anthropic.MessageCreateParamsNonStreaming)

  if (message.stop_reason === "refusal") {
    throw new Error("refusal")
  }

  const jsonText = message.content
    .filter((block) => block.type === "text")
    .map((block) => block.text)
    .join("")
    .trim()

  if (!jsonText) throw new Error("empty_response")

  // 스키마로 강제된 JSON. 파싱 실패 시 상위에서 analysis_failed 로 처리.
  return JSON.parse(jsonText)
}
