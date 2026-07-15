/*
 * 목업(가짜) 분석 결과 — USE_MOCK=true 일 때 실제 Claude API 대신 반환한다.
 * 형식은 §10 스키마(및 프론트 AnalysisResult)와 100% 동일 → 나중에 실제 API로 바꿔도 결과 화면이 안 깨진다.
 *
 * 구조: 직군(개발·기획) × 적합도(높음/보통/낮음).
 * 말투: 대화체 '~요' + 따뜻한 톤(단점도 가능성을 함께). 실제 프롬프트(prompt.ts)와 톤을 맞춤.
 */

export type MockCase = "높음" | "보통" | "낮음"
export type MockDomain = "개발" | "기획"

interface MockResult {
  overall_fit: { level: MockCase; match_score: number; summary: string; highlight: string }
  job_requirements: { must_have: string[]; nice_to_have: string[] }
  strengths: Array<{ point: string; matched_requirement: string; evidence: string; source_quote?: string }>
  weaknesses: Array<{
    point: string
    matched_requirement: string
    severity: "critical" | "recommended" | "enhancement"
    reason: string
    suggestion: string
    source_quote?: string
  }>
}

const DEV_REQUIREMENTS = {
  must_have: ["Java/Spring 기반 서버 개발", "RDBMS 및 JPA 활용", "REST API 설계·구현"],
  nice_to_have: ["MSA·이벤트 스트리밍(Kafka) 경험", "대용량 트래픽 처리 경험", "AWS 등 클라우드 운영"],
}

const PM_REQUIREMENTS = {
  must_have: ["B2C 서비스/프로덕트 기획 경험", "요구사항 정의 및 PRD 작성", "데이터 기반 의사결정(지표 설계·분석)", "개발·디자인 유관부서 협업"],
  nice_to_have: ["A/B 테스트 설계·실행", "SQL 등 데이터 직접 추출", "그로스·리텐션 개선 경험", "애자일(스크럼) 환경 경험"],
}

export const MOCK_RESULTS: Record<MockDomain, Record<MockCase, MockResult>> = {
  // ══════════════ 개발자(백엔드) ══════════════
  개발: {
    보통: {
      overall_fit: {
        level: "보통",
        match_score: 62,
        summary: "핵심 스택인 Java/Spring은 잘 맞아요. 여기에 대용량·MSA 경험을 조금만 더 보여주면 훨씬 강해질 거예요.",
        highlight: "Java/Spring은 잘 맞아요",
      },
      job_requirements: DEV_REQUIREMENTS,
      strengths: [
        {
          point: "Spring Boot로 서버를 2년간 만들어온 경험이 있어요",
          matched_requirement: "Java/Spring 기반 서버 개발 (필수)",
          evidence: "'주문 서비스 API' 프로젝트에서 Spring Boot로 REST API를 직접 설계하고 구현했어요.",
          source_quote: "Java와 Spring Boot로 주문 서비스 API를 설계·구현",
        },
        {
          point: "쿼리를 최적화해서 응답 속도를 확 끌어올렸어요",
          matched_requirement: "RDBMS 및 JPA 활용 (필수)",
          evidence: "N+1 문제를 없애고 인덱스를 손봐서 주요 API 응답시간을 40%나 줄였어요.",
          source_quote: "MySQL에서 N+1 문제를 없애고 인덱스를 손봐 주요 API 응답시간을 40% 개선",
        },
        {
          point: "REST API 설계 원칙을 잘 이해하고 있어요",
          matched_requirement: "REST API 설계·구현 (필수)",
          evidence: "리소스 중심으로 URL을 나누고 상태코드 규칙을 지켜서 API를 깔끔하게 구성했어요.",
          source_quote: "리소스 중심 URL과 상태코드 규칙을 지켜 REST API를 구성",
        },
      ],
      weaknesses: [
        {
          point: "경력 연차가 공고 기준보다 조금 짧아요",
          matched_requirement: "Java/Spring 기반 서버 개발 (필수)",
          severity: "recommended",
          reason: "공고는 3년 이상을 선호하는데 지금은 2년차라, 경력 깊이가 살짝 얕아 보일 수 있어요.",
          suggestion: "담당했던 범위와 성과를 숫자로 보여주면 연차 차이는 충분히 메울 수 있어요.",
        },
        {
          point: "MSA·Kafka 경험이 아직 서류에 안 보여요",
          matched_requirement: "MSA·이벤트 스트리밍(Kafka) 경험 (우대)",
          severity: "recommended",
          reason: "우대사항인 MSA·이벤트 스트리밍(Kafka) 경험이 이력서에서는 잘 드러나지 않아요.",
          suggestion: "사이드 프로젝트나 공부한 내용이라도 Kafka로 무엇을 어떻게 다뤘는지 적어두면 좋아요.",
        },
        {
          point: "대용량 트래픽을 다뤄봤다는 근거가 조금 약해요",
          matched_requirement: "대용량 트래픽 처리 경험 (우대)",
          severity: "enhancement",
          reason: "처리량이나 동시접속 같은 규모 숫자가 없어서, 대용량 상황에서의 역량을 가늠하기 어려워요.",
          suggestion: "초당 요청 수나 데이터 규모, 부하 테스트 결과 같은 숫자를 더하면 설득력이 확 올라가요.",
        },
      ],
    },
    높음: {
      overall_fit: {
        level: "높음",
        match_score: 90,
        summary: "공고의 필수는 물론 우대(대용량·MSA)까지 두루 갖춰서, 이 공고에 아주 잘 맞는 분이에요.",
        highlight: "이 공고에 아주 잘 맞는 분이에요",
      },
      job_requirements: DEV_REQUIREMENTS,
      strengths: [
        {
          point: "Spring으로 대규모 커머스 백엔드를 4년간 다뤄왔어요",
          matched_requirement: "Java/Spring 기반 서버 개발 (필수)",
          evidence: "결제·주문 도메인을 Spring Boot로 4년간 맡아서 핵심 서비스를 안정적으로 운영했어요.",
          source_quote: "Java와 Spring Boot로 결제·주문 도메인 백엔드를 4년간 맡아 핵심 서비스를 안정적으로 운영",
        },
        {
          point: "하루 수천만 건 트래픽을 무중단으로 운영했어요",
          matched_requirement: "대용량 트래픽 처리 경험 (우대)",
          evidence: "피크에 초당 3천 요청이 몰리는 API를 끊김 없이 운영한 경험이 있어요.",
          source_quote: "피크 시 초당 3천 요청이 몰리는 API를 무중단으로 운영",
        },
        {
          point: "Kafka로 이벤트 아키텍처를 직접 설계했어요",
          matched_requirement: "MSA·이벤트 스트리밍(Kafka) 경험 (우대)",
          evidence: "주문 이벤트를 Kafka로 비동기 처리해서 서비스 간 결합도를 크게 낮췄어요.",
          source_quote: "Kafka로 주문 이벤트를 비동기 처리해 서비스 간 결합도를 크게 낮춤",
        },
        {
          point: "성능을 개선해서 지연시간을 크게 줄였어요",
          matched_requirement: "RDBMS 및 JPA 활용 (필수)",
          evidence: "캐시를 도입하고 쿼리를 튜닝해서 핵심 API p99 지연을 60% 단축했어요.",
          source_quote: "Redis 캐시 도입과 쿼리 튜닝으로 핵심 API p99 지연을 60% 단축",
        },
      ],
      weaknesses: [],
    },
    낮음: {
      overall_fit: {
        level: "낮음",
        match_score: 31,
        summary: "지금은 프론트엔드 경험이 크지만, 백엔드(Java/Spring)를 조금만 쌓으면 이 공고에 한 걸음 더 가까워질 거예요.",
        highlight: "한 걸음 더 가까워질 거예요",
      },
      job_requirements: DEV_REQUIREMENTS,
      strengths: [
        {
          point: "학습이 빠르고 CS 기본기가 탄탄해요",
          matched_requirement: "필수 요건과는 거리가 조금 있어요",
          evidence: "자료구조·네트워크 같은 기초를 꾸준히 공부한 흔적이 보여요. 다만 실무로 이어진 근거는 조금 약해요.",
          source_quote: "자료구조·네트워크 등 CS 기초를 꾸준히 학습",
        },
      ],
      weaknesses: [
        {
          point: "필수 스택인 Java/Spring 실무 경험이 아직 없어요",
          matched_requirement: "Java/Spring 기반 서버 개발 (필수)",
          severity: "critical",
          reason: "공고에서 꼭 필요한 Java/Spring 경험이 서류에 없고, 프론트엔드(React) 경험 위주로 보여요.",
          suggestion: "Spring Boot로 인증·CRUD가 있는 작은 프로젝트를 만들어보면 필수 요건을 채운 근거가 생겨요.",
        },
        {
          point: "REST API를 직접 설계·운영해봤는지가 잘 안 드러나요",
          matched_requirement: "REST API 설계·구현 (필수)",
          severity: "critical",
          reason: "API를 직접 설계하고 운영한 이력이 서류에서 잘 보이지 않아요.",
          suggestion: "엔드포인트 구조와 설계 의도를 정리한 프로젝트를 포트폴리오에 넣어보세요.",
        },
        {
          point: "실무 규모의 프로젝트 경험이 조금 부족해요",
          matched_requirement: "RDBMS 및 JPA 활용 (필수)",
          severity: "recommended",
          reason: "팀 협업·배포·운영까지 이어진 프로젝트가 아직 많지 않아요.",
          suggestion: "배포 주소나 협업 방식, 맡은 역할을 구체적으로 적으면 실무 감각이 잘 드러나요.",
        },
      ],
    },
  },

  // ══════════════ 기획자(서비스 PM) ══════════════
  기획: {
    높음: {
      overall_fit: {
        level: "높음",
        match_score: 90,
        summary: "프로덕트 기획 전반과 데이터로 판단하는 힘을 두루 갖춰서, 이 공고에 아주 잘 맞는 기획자예요.",
        highlight: "이 공고에 아주 잘 맞는 기획자",
      },
      job_requirements: PM_REQUIREMENTS,
      strengths: [
        {
          point: "B2C 커머스 앱을 0에서 1로 기획해 런칭했어요",
          matched_requirement: "B2C 서비스/프로덕트 기획 경험 (필수)",
          evidence: "지금 회사에서 신규 커머스 앱을 문제 정의부터 런칭까지 직접 이끌어, 출시 6개월 만에 MAU 12만을 만들었어요.",
          source_quote: "신규 B2C 커머스 앱을 0에서 1로 기획해 런칭",
        },
        {
          point: "꼼꼼한 PRD로 개발 재작업을 확 줄였어요",
          matched_requirement: "요구사항 정의 및 PRD 작성 (필수)",
          evidence: "요구사항 정의부터 PRD까지 직접 써서 개발 재작업률을 40% 줄였어요.",
          source_quote: "요구사항 정의부터 PRD 작성까지 담당해 개발 재작업률 40% 감소",
        },
        {
          point: "지표를 직접 설계하고 데이터로 서비스를 개선했어요",
          matched_requirement: "데이터 기반 의사결정(지표 설계·분석) (필수)",
          evidence: "리텐션·전환율 같은 핵심 지표를 직접 설계하고 사내 대시보드로 퍼널을 분석해 결제 전환율을 8% 끌어올렸어요.",
          source_quote: "핵심 지표(리텐션·전환율)를 직접 설계하고 퍼널을 데이터로 분석해 개선",
        },
        {
          point: "개발·디자인과 협업해 안정적으로 릴리즈해왔어요",
          matched_requirement: "개발·디자인 유관부서 협업 (필수)",
          evidence: "PM으로서 PRD를 쓰고 개발·디자인과 협업해 분기마다 여러 기능을 안정적으로 릴리즈했어요.",
          source_quote: "개발·디자인과 협업해 분기당 3~4개 기능을 안정적으로 릴리즈",
        },
        {
          point: "A/B 테스트로 가설을 검증해봤어요",
          matched_requirement: "A/B 테스트 설계·실행 (우대)",
          evidence: "장바구니 이탈을 줄이려 결제 플로우를 A/B 테스트로 설계·실행해 검증했어요.",
          source_quote: "장바구니 이탈 개선 A/B 테스트를 설계·실행해 결제 전환율 8% 상승",
        },
        {
          point: "데이터를 직접 다룰 수 있는 SQL 역량을 갖췄어요",
          matched_requirement: "SQL 등 데이터 직접 추출 (우대)",
          evidence: "SQLD·ADsP 자격이 있고, 지표·퍼널 분석에 데이터를 직접 활용해 왔어요.",
          source_quote: "",
        },
      ],
      weaknesses: [],
    },
    보통: {
      overall_fit: {
        level: "보통",
        match_score: 64,
        summary: "기획 기본기와 협업 경험은 좋아요. 여기에 데이터로 판단한 근거를 더하면 훨씬 단단해질 거예요.",
        highlight: "훨씬 단단해질 거예요",
      },
      job_requirements: PM_REQUIREMENTS,
      strengths: [
        {
          point: "서비스 기획과 운영을 3년간 해왔어요",
          matched_requirement: "B2C 서비스/프로덕트 기획 경험 (필수)",
          evidence: "여러 기능의 기획서를 쓰고 릴리즈까지 챙긴 경험이 있어요.",
          source_quote: "B2C 콘텐츠 앱의 기능 기획과 요구사항 정의를 담당",
        },
        {
          point: "문서를 명확하게 쓰고 협업 커뮤니케이션이 좋아요",
          matched_requirement: "개발·디자인 유관부서 협업 (필수)",
          evidence: "기획서와 회의록을 잘 정리해서 개발·디자인과의 소통 비용을 줄였어요.",
          source_quote: "기획서와 회의록을 명확히 정리해 팀 간 소통 비용을 줄임",
        },
      ],
      weaknesses: [
        {
          point: "데이터로 판단한 근거가 조금 약해요",
          matched_requirement: "데이터 기반 의사결정(지표 설계·분석) (필수)",
          severity: "recommended",
          reason: "지표를 정의하고 분석해서 결정을 내린 사례가 서류에 잘 안 보여요.",
          suggestion: "어떤 지표를 왜 봤고 그래서 무엇을 바꿨는지(전환·리텐션 숫자와 함께) 적어보면 좋아요.",
        },
        {
          point: "A/B 테스트 같은 실험 경험이 아직 없어요",
          matched_requirement: "A/B 테스트 설계·실행 (우대)",
          severity: "recommended",
          reason: "우대사항인 실험 설계·실행 경험이 잘 드러나지 않아요.",
          suggestion: "작은 실험이라도 '가설 → 지표 → 결과' 형태로 정리해두면 눈에 띄어요.",
        },
        {
          point: "성과를 숫자로 보여주면 더 좋아요",
          matched_requirement: "그로스·리텐션 개선 경험 (우대)",
          severity: "enhancement",
          reason: "기획 결과가 글로만 설명돼 있어서, 임팩트가 얼마나 컸는지 가늠하기 어려워요.",
          suggestion: "핵심 성과를 전환율·리텐션·매출 같은 숫자로 바꿔서 표현해보세요.",
        },
      ],
    },
    낮음: {
      overall_fit: {
        level: "낮음",
        match_score: 33,
        summary: "지금은 기획보다 마케팅 경험이 크지만, 아래 몇 가지를 채우면 이 공고에 한 걸음 더 가까워질 거예요.",
        highlight: "한 걸음 더 가까워질 거예요",
      },
      job_requirements: PM_REQUIREMENTS,
      strengths: [
        {
          point: "콘텐츠를 기획하고 실행해본 경험이 있어요",
          matched_requirement: "기획·실행 기본기",
          evidence: "SNS 콘텐츠와 프로모션 이벤트를 직접 기획하고 실행해봤어요. 서비스 기획으로 옮겨오는 좋은 발판이 될 수 있어요.",
          source_quote: "SNS 콘텐츠 기획과 광고 집행을 담당",
        },
      ],
      weaknesses: [
        {
          point: "서비스 기획을 직접 이끌어본 경험이 아직 부족해요",
          matched_requirement: "B2C 서비스/프로덕트 기획 경험 (필수)",
          severity: "critical",
          reason: "공고에서 꼭 필요한 기획 주도 경험이 서류에 없고, 마케팅 업무가 주로 보여요.",
          suggestion: "작은 기능이라도 문제 정의부터 출시까지 직접 해보고 그 과정을 적어두면 좋아요.",
        },
        {
          point: "요구사항을 정의하고 PRD를 써본 경험이 잘 안 드러나요",
          matched_requirement: "요구사항 정의 및 PRD 작성 (필수)",
          severity: "critical",
          reason: "요구사항을 문서로 정리해서 개발에 전달한 이력이 잘 보이지 않아요.",
          suggestion: "간단한 기능이라도 PRD 샘플(문제·목표·유저스토리)을 만들어 포트폴리오에 넣어보세요.",
        },
        {
          point: "데이터로 판단해본 경험이 아직 없어요",
          matched_requirement: "데이터 기반 의사결정(지표 설계·분석) (필수)",
          severity: "recommended",
          reason: "지표를 근거로 결정을 내린 사례가 잘 보이지 않아요.",
          suggestion: "핵심 지표를 이해하고 간단한 분석이라도 시도해서 결정에 연결해보면 좋아요.",
        },
      ],
    },
  },
}

/**
 * 적합도 케이스 선택 — 입력에 '높음'/'보통'/'낮음' 글자가 있으면 그 케이스, 없으면 기본값.
 */
export function pickMockCase(inputText: string, fallback: MockCase): MockCase {
  if (inputText.includes("높음")) return "높음"
  if (inputText.includes("낮음")) return "낮음"
  if (inputText.includes("보통")) return "보통"
  return fallback
}

/**
 * 직군 선택 — 입력에 '기획'/'PM'이 있으면 기획, '개발'이 있으면 개발, 없으면 기본값.
 */
export function pickMockDomain(inputText: string, fallback: MockDomain): MockDomain {
  if (inputText.includes("기획") || inputText.includes("PM")) return "기획"
  if (inputText.includes("개발")) return "개발"
  return fallback
}
