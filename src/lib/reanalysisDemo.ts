// reanalysisDemo.ts
// 재분석(보완 후 다시 분석) 흐름을 위한 더미 데이터
// 시나리오: 기획·낮음(33%) → 약점 보완 → 재분석(61%)
//
// 핵심: 원본의 보완점 중 일부를 실제로 채운 "보완된 이력서"를 준비.
// 이를 재분석하면 적합도가 오르고, 어떤 요구가 새로 충족됐는지 보여줌.
// 단, 100%가 아니라 61% — 정직하게 "가까워졌지만 아직 여지 있음".

import type { AnalysisResult } from "@/lib/analysis"
import type { ResumeInput } from "@/lib/demoData"
import type { InputDraft, ResumeForm } from "@/lib/resume"

export type ReanalysisCase = {
  before: {
    resume: ResumeInput
    matchRate: number // 33
    fitLevel: "낮음"
  }
  after: {
    resume: ResumeInput
    matchRate: number // 61
    fitLevel: "보통"
    // 이번에 새로 충족된 요구 (성장 표시용)
    newlyMet: string[]
  }
  jobPost: string
}

export const reanalysisDemo: ReanalysisCase = {
  // ─────────────────────────────────────────────
  // BEFORE — 원본 (기획·낮음, 33%)
  // 마케팅 담당자가 기획직에 지원, 방향이 어긋남
  // ─────────────────────────────────────────────
  before: {
    resume: {
      careers: [
        {
          company: "OO에이전시",
          start: "2023-06",
          end: "현재",
          role: "마케팅 담당자",
          work: "SNS 콘텐츠 기획과 광고 집행 담당. 인스타그램·블로그 채널을 운영하며 팔로워를 늘림. 프로모션 이벤트를 기획하고 실행.",
        },
      ],
      skills: "콘텐츠 마케팅, SNS 운영, 광고 집행, 카피라이팅",
      project: "",
      education: "OO대학교 광고홍보학과 (2017–2021)",
      certificate: "",
    },
    matchRate: 33,
    fitLevel: "낮음",
  },

  // ─────────────────────────────────────────────
  // AFTER — 보완본 (61%)
  // 진단받은 약점을 반영: 기획 주도 경험, PRD, 데이터 분석을 추가
  // (마케팅 경력 위에 "기획으로 전환하려는 노력"을 얹은 형태 — 현실적)
  // ─────────────────────────────────────────────
  after: {
    resume: {
      careers: [
        {
          company: "OO에이전시",
          start: "2023-06",
          end: "현재",
          role: "마케팅 담당자 (서비스 기획 병행)",
          work: "SNS 콘텐츠 기획과 광고 집행 담당. 최근 사내 랜딩페이지 개편을 주도하며, 요구사항을 정의하고 간단한 PRD(문제·목표·유저스토리)를 작성해 개발·디자인과 협업. 광고 퍼널 데이터(유입·전환율)를 직접 분석해 랜딩 전환율 12% 개선.",
        },
      ],
      skills: "콘텐츠 마케팅, SNS 운영, 광고 집행, 카피라이팅, 요구사항 정의, PRD 작성(기초), 퍼널 데이터 분석(GA)",
      project: "사내 랜딩페이지 개편 — 요구사항 정의부터 A/B 테스트까지 주도. 전환율 12% 개선.",
      education: "OO대학교 광고홍보학과 (2017–2021)",
      certificate: "GAIQ (구글 애널리틱스 자격)",
    },
    matchRate: 61,
    fitLevel: "보통",
    newlyMet: [
      "요구사항 정의 및 PRD 작성", // 아직 → 충족
      "데이터 기반 의사결정(지표 분석)", // 아직 → 충족(부분)
    ],
  },

  // 공고 (변하지 않음 — 같은 공고에 재지원)
  jobPost: `[OO페이] 프로덕트 기획자 (PM) 채용

주요 업무
- B2C 서비스의 프로덕트 기획 및 개선
- 요구사항 정의와 PRD 작성, 개발·디자인 협업 리드
- 핵심 지표 설계 및 데이터 기반 의사결정

자격 요건
- B2C 서비스/프로덕트 기획 경험
- 요구사항 정의 및 PRD 작성 능력
- 데이터 기반 의사결정(지표 설계·분석) 경험
- 개발·디자인 유관부서 협업 경험`,
}

// ─────────────────────────────────────────────
// 설계 노트 (정직한 진단 유지)
// - 33 → 61: 확 올랐지만 100%가 아님. "가까워졌으나 아직 여지 있음".
// - 여전히 남는 약점: "B2C 프로덕트 기획 경험"은 마케팅 병행 수준이라
//   완전 충족은 아님 → 재분석 결과에서도 이건 '부분' 정도로.
// - 보완 방식이 현실적: 없던 경력을 지어내지 않고,
//   기존 마케팅 업무 안에서 "기획적 시도"를 발굴/추가하는 형태.
//   (사용자에게 "이렇게 보완하면 된다"는 현실적 힌트도 됨)
// ─────────────────────────────────────────────

// ==============================================================
// 흐름 배선용 파생 데이터 (위 시나리오를 화면에 연결)
// ==============================================================

/** ResumeInput(데모 형식) → 입력 폼(ResumeForm). end "현재"는 재직중 토글로 처리됨 */
function toForm(r: ResumeInput): ResumeForm {
  return {
    careers: r.careers.map((c) => ({
      company: c.company,
      role: c.role,
      work: c.work,
      tenure: { start: c.start || null, end: c.end || null },
    })),
    skills: r.skills,
    projects: r.project ?? "",
    education: r.education ?? "",
    certifications: r.certificate ?? "",
  }
}

/** 재분석 진입 시 입력 화면에 채울 "보완된 이력서 + 동일 공고" */
export const reanalysisAfterDraft: InputDraft = {
  resume: toForm(reanalysisDemo.after.resume),
  job: reanalysisDemo.jobPost,
}

/**
 * 보완본을 재분석했을 때 나오는 결과(61%, 보통).
 * - 충족 현황: newlyMet("요구사항 정의·PRD" → 충족 / "데이터 기반 의사결정" → 부분)
 * - 남는 보완점: 데이터 지표 '설계', B2C 프로덕트 기획(마케팅 병행) → 둘 다 '부분'
 * - 강점 근거(source_quote)는 after.resume 담당업무 문장과 매칭되어 하이라이팅됨.
 */
export const reanalysisAfterResult: AnalysisResult = {
  overall_fit: {
    level: "보통",
    match_score: 61,
    summary:
      "기획으로 방향을 잡으려는 노력이 확실히 보여요. 이 공고에 한결 가까워졌고, 두 가지만 더 채우면 충분히 겨뤄볼 만해요.",
    highlight: "한결 가까워졌고",
  },
  job_requirements: {
    must_have: [
      "B2C 서비스/프로덕트 기획 경험",
      "요구사항 정의 및 PRD 작성",
      "데이터 기반 의사결정(지표 설계·분석)",
      "개발·디자인 유관부서 협업",
    ],
    nice_to_have: ["A/B 테스트 등 실험 기반 개선 경험"],
  },
  strengths: [
    {
      point: "요구사항을 정의하고 PRD로 풀어낸 경험이 생겼어요",
      matched_requirement: "요구사항 정의 및 PRD 작성",
      evidence:
        "랜딩페이지 개편에서 요구사항을 정의하고 PRD(문제·목표·유저스토리)를 직접 작성했어요. 공고가 핵심으로 꼽는 요구와 정확히 맞닿아요.",
      source_quote: "요구사항을 정의하고 간단한 PRD(문제·목표·유저스토리)를 작성",
    },
    {
      point: "개발·디자인과 협업하며 기획을 실행해봤어요",
      matched_requirement: "개발·디자인 유관부서 협업",
      evidence:
        "PRD를 바탕으로 개발·디자인과 협업해 실제 개편을 끌어냈어요. 공고가 원하는 유관부서 협업 경험과 이어져요.",
      source_quote: "개발·디자인과 협업",
    },
    {
      point: "실험(A/B 테스트)으로 개선해본 경험이 있어요",
      matched_requirement: "A/B 테스트 등 실험 기반 개선 경험",
      evidence: "랜딩페이지 개편을 A/B 테스트까지 끌고 가 전환율을 개선한 사례가 프로젝트에 담겨 있어요.",
      source_quote: "",
    },
  ],
  weaknesses: [
    {
      point: "데이터로 '지표를 설계'한 경험까지 보이면 더 강해요",
      matched_requirement: "데이터 기반 의사결정(지표 설계·분석)",
      severity: "recommended",
      reason:
        "퍼널 데이터를 분석해 전환율을 개선한 건 좋은 출발이에요. 다만 공고가 원하는 '핵심 지표를 처음부터 설계'하는 관점까지는 아직 초기 단계로 보여요.",
      suggestion:
        "개선했던 랜딩 사례에서 '어떤 지표를 왜 그 지표로 정했는지', 목표·가드레일 지표를 직접 설계한 관점으로 한 줄 더 적어보세요.",
    },
    {
      point: "B2C 프로덕트 기획은 아직 '마케팅 병행' 단계예요",
      matched_requirement: "B2C 서비스/프로덕트 기획 경험",
      severity: "recommended",
      reason:
        "랜딩페이지 개편을 주도한 건 분명한 기획 경험이에요. 다만 아직 마케팅과 병행하는 형태라, 온전한 프로덕트 기획 경험으로는 조금 더 채우면 좋아요.",
      suggestion:
        "개편 사례를 '문제 정의 → 가설 → 출시 → 검증'의 프로덕트 기획 사이클로 재구성해, 기획 주도성을 이력서 앞쪽에 배치해보세요.",
    },
  ],
}

/**
 * 재분석 결과 화면(성장·변화 중심)에서 쓰는 "관찰 톤" 요약.
 * - 첫 분석의 전체 진단과 달리, "무엇이 달라졌고 / 다음에 무엇을 채우면 좋은지"만 간결히.
 * - 워딩 원칙: 판정("충족")이 아니라 관찰("새로 확인됐어요" / "더 보이면 좋아요").
 * - 초록=달라진 점(좋아진 것), 주황=더 채울 점.
 */
export const reanalysisChanges = {
  growthNote: "보완한 내용이 이력서에 잘 담겼어요",
  improved: [
    { title: "요구사항 정의·PRD 경험이 새로 확인됐어요", note: "공고의 필수 요건과 맞닿은 부분이에요" },
    { title: "개발·디자인 협업 경험이 새로 확인됐어요", note: "공고의 필수 요건과 맞닿은 부분이에요" },
  ],
  toFill: [
    {
      title: "B2C 프로덕트 기획은 아직 마케팅 병행 단계로 보여요",
      note: "개편 사례를 '문제정의→가설→출시→검증'으로 재구성해보세요",
    },
    {
      title: "데이터로 지표를 설계한 경험이 더 보이면 좋아요",
      note: "'어떤 지표를 왜 정했는지'를 한 줄 더 적어보세요",
    },
  ],
  verdict: "기획으로 방향을 잡으려는 노력이 확실히 보여요. 두 가지만 더 채우면 충분히 겨뤄볼 만해요.",
}

