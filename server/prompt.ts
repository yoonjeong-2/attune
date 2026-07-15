/*
 * 분석 프롬프트 & 출력 스키마 (CLAUDE.md §10, §5)
 * - 입력: (1) 내 서류 텍스트, (2) 채용공고 텍스트
 * - 출력: 구조화된 JSON (아래 ANALYSIS_SCHEMA로 강제)
 * - "정직한 진단"(§5) 원칙을 시스템 프롬프트에 명시.
 */

export const SYSTEM_PROMPT = `당신은 국내 IT 직군(개발·기획) 채용을 깊이 이해하는 "채용 매칭 분석가"입니다.
지원자의 서류(이력서·포트폴리오)와 채용공고 하나를 받아, 오직 "이 공고의 관점"에서 서류가 얼마나 맞는지 분석합니다.

가장 중요한 원칙 — 정직한 진단:
- 약점을 억지로 만들어내지 마세요. 서류가 공고에 잘 맞으면 트집을 잡지 않습니다.
- 약점(보완점)은 실제로 부족한 부분이 있을 때만 적고, 없으면 반드시 빈 배열로 둡니다. "약점 N개"를 채우지 마세요.
- 모든 강점과 약점은 (1) 공고의 어떤 요구와 연결되는지, (2) 서류의 어떤 근거에 기반하는지 함께 제시합니다.
- 서류에 없는 내용을 있다고 가정하거나 추측하지 마세요. 근거가 없으면 강점으로 적지 않습니다.

공고 핵심 요구는 '필수(must_have)'와 '우대(nice_to_have)'로 구분해 뽑습니다.

약점(보완점)의 심각도(severity)는 세 단계로 구분합니다:
- "critical": 공고의 필수 요건을 충족하지 못하는 치명적 미스매치.
- "recommended": 우대 사항 등, 보완하면 합격 가능성이 뚜렷이 올라가는 부분.
- "enhancement": 이미 충분하지만 더 돋보이게 다듬을 수 있는 강화 제안.

전체 적합도(level)는 "높음"/"보통"/"낮음" 중 하나로 정직하게 판단하고, 한 줄 총평(summary)으로 요약합니다.
- match_score: 적합도를 0~100 점수로도 표현하되 level과 일관되게 (높음 75+, 보통 45~74, 낮음 44 이하).
- highlight: summary에서 가장 핵심이 되는 구절을 "그대로"(summary의 부분 문자열) 골라 강조용으로 제공합니다.
적합도가 높으면 강점 중심으로 풍성하게, 보통·낮음이면 보완점을 근거·개선 제안과 함께 충실히 제시합니다.

[말투]
- 명사형('~음/~함')이 아니라 대화하듯 부드러운 '~요' 말투로 쓰세요.
- 약점을 말할 때도 딱딱하거나 단정적이지 않게, 가능성을 함께 주는 따뜻한 톤으로.
  예: "경력이 다소 짧음" (X) → "경력 연차가 공고 기준보다 조금 짧아요" (O)
- 개선 제안(suggestion)은 "이렇게 해보면 좋아요"처럼 구체적이고 격려하는 톤으로.

한국어로, 지원자에게 실질적으로 도움이 되도록 구체적으로 작성하세요.`

/** 두 텍스트를 사용자 메시지로 조립 */
export function buildUserContent(resumeText: string, jobText: string): string {
  return `[내 서류]
${resumeText}

[채용공고]
${jobText}

위 서류와 공고를 대조해, 지정된 구조로 분석 결과를 작성해 주세요. 없는 약점은 빈 배열로 두세요.`
}

/**
 * 출력 JSON 스키마 (structured outputs로 강제).
 * 구조화 출력이 지원하는 부분집합만 사용: 타입/enum/배열/object + additionalProperties:false.
 * (minItems/maxItems 등 제약은 미지원이라 넣지 않음 → 약점 빈 배열 허용 = 정직한 진단)
 */
export const ANALYSIS_SCHEMA = {
  type: "object",
  additionalProperties: false,
  properties: {
    overall_fit: {
      type: "object",
      additionalProperties: false,
      properties: {
        level: { type: "string", enum: ["높음", "보통", "낮음"] },
        match_score: {
          type: "integer",
          description: "적합도 점수 0~100 정수. level과 일관되게 (높음 75+, 보통 45~74, 낮음 44 이하).",
        },
        summary: { type: "string", description: "한 줄 총평" },
        highlight: {
          type: "string",
          description: "summary에서 가장 핵심이 되는 구절. 반드시 summary에 그대로 포함된 부분 문자열이어야 한다.",
        },
      },
      required: ["level", "match_score", "summary", "highlight"],
    },
    job_requirements: {
      type: "object",
      additionalProperties: false,
      properties: {
        must_have: { type: "array", items: { type: "string" }, description: "필수 요건" },
        nice_to_have: { type: "array", items: { type: "string" }, description: "우대 사항" },
      },
      required: ["must_have", "nice_to_have"],
    },
    strengths: {
      type: "array",
      items: {
        type: "object",
        additionalProperties: false,
        properties: {
          point: { type: "string", description: "강점 내용" },
          matched_requirement: { type: "string", description: "연결되는 공고 요구" },
          evidence: { type: "string", description: "서류에서의 근거" },
        },
        required: ["point", "matched_requirement", "evidence"],
      },
    },
    weaknesses: {
      type: "array",
      items: {
        type: "object",
        additionalProperties: false,
        properties: {
          point: { type: "string", description: "약점/보완점 내용" },
          matched_requirement: { type: "string", description: "이 보완점이 연결되는 공고 요구 (필수/우대 중 무엇인지)" },
          severity: { type: "string", enum: ["critical", "recommended", "enhancement"] },
          reason: { type: "string", description: "왜 약점인지 (공고 요구 대비)" },
          suggestion: { type: "string", description: "어떻게 고칠지 개선 제안" },
        },
        required: ["point", "matched_requirement", "severity", "reason", "suggestion"],
      },
    },
  },
  required: ["overall_fit", "job_requirements", "strengths", "weaknesses"],
} as const
