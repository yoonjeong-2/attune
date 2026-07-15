// demoData.ts
// 데모용 케이스별 입력 더미 데이터
// 직군(기획/개발) × 적합도(높음/보통/낮음) = 6개 케이스
//
// 각 입력은 그 케이스의 목업 결과(server/mocks.ts)와 앞뒤가 맞도록 설계됨:
//  - 높음: 공고 필수를 대부분 충족 (강점 위주)
//  - 보통: 핵심은 충족하나 우대/데이터 근거가 빔 (강점+보완점 혼재)
//  - 낮음: 직무 방향이 공고와 어긋남 (보완점 위주, 부드러운 톤)
//
// ⚠️ 채팅으로 붙여넣은 원본이 한글 인코딩 깨짐(모지바케)이라, 의도대로 복원한 버전입니다.
//    원본 demoData.ts 파일을 이 경로에 그대로 저장하면 그 내용으로 교체됩니다.

export type CareerEntry = {
  company: string
  start: string // "YYYY-MM"
  end: string // "YYYY-MM" | "현재"
  role: string
  work: string
}

export type ResumeInput = {
  careers: CareerEntry[]
  skills: string
  project?: string
  education?: string
  certificate?: string
}

export type DemoCase = {
  resume: ResumeInput
  jobPost: string
}

// 공고는 직군별로 하나씩만 두고 재사용 (같은 공고에 서로 다른 서류를 대보는 구성)
const PM_JOB = `[OO페이] 프로덕트 기획자 (PM) 채용

주요 업무
- B2C 서비스의 프로덕트 기획 및 개선
- 요구사항 정의와 PRD 작성, 개발·디자인 팀 리드
- 핵심 지표 설계 및 데이터 기반 의사결정

자격 요건
- B2C 서비스/프로덕트 기획 경험
- 요구사항 정의 및 PRD 작성 능력
- 데이터 기반 의사결정(지표 설계·분석) 경험
- 개발·디자인 유관부서 협업 경험

우대 사항
- A/B 테스트 설계·실행 경험
- SQL 등 데이터 직접 추출 능력
- 그로스·리텐션 개선 경험
- 애자일(스크럼) 환경 경험`

const DEV_JOB = `[OO페이] 백엔드 개발자 채용

주요 업무
- 결제/정산 도메인의 백엔드 API 설계 및 개발
- 대용량 트래픽 환경에서의 성능 최적화
- MSA 기반 시스템 운영

자격 요건
- Java 또는 Kotlin, Spring 기반 서버 개발 경험
- RDBMS 및 JPA 활용 경험
- REST API 설계·구현 경험

우대 사항
- MSA·이벤트 스트리밍(Kafka) 경험
- 대용량 트래픽 처리 경험
- AWS 등 클라우드 운영 경험`

export const demoData: Record<string, DemoCase> = {
  // ───────── 기획 · 높음 — 필수 대부분 충족 (강점 위주) ─────────
  "기획-높음": {
    resume: {
      careers: [
        {
          company: "OO커머스",
          start: "2022-03",
          end: "현재",
          role: "서비스 기획자 (PM)",
          work: "신규 B2C 커머스 앱을 0에서 1로 기획해 런칭, 출시 6개월 만에 MAU 12만 달성. 요구사항 정의부터 PRD 작성까지 담당해 개발 재작업률 40% 감소. 핵심 지표(리텐션·전환율)를 직접 설계하고 퍼널을 데이터로 분석해 개선. 장바구니 이탈 개선 A/B 테스트를 설계·실행해 결제 전환율 8% 상승.",
        },
        {
          company: "OO핀테크",
          start: "2020-02",
          end: "2022-02",
          role: "프로덕트 매니저",
          work: "핀테크 앱의 송금·결제 플로우 개선을 담당. 사용자 인터뷰와 퍼널 데이터 분석으로 이탈 구간을 찾아 온보딩 전환율 15% 개선. PRD를 작성하고 개발·디자인과 협업해 분기당 3~4개 기능을 안정적으로 릴리즈.",
        },
        {
          company: "OO커뮤니티",
          start: "2018-06",
          end: "2020-01",
          role: "서비스 기획자",
          work: "B2C 커뮤니티 서비스의 신규 기능 기획과 요구사항 정의를 담당. 지표 대시보드를 처음 세팅해 핵심 지표(리텐션·활성화)를 정의하고, A/B 테스트를 도입해 데이터 기반 의사결정의 기초를 마련.",
        },
        {
          company: "OO에이전시",
          start: "2017-01",
          end: "2018-05",
          role: "웹·앱 서비스 기획",
          work: "다양한 클라이언트의 웹·앱 서비스 기획과 화면 설계(스토리보드)를 담당. 요구사항 정리부터 와이어프레임까지 맡아 기획 기본기를 다짐.",
        },
      ],
      skills:
        "서비스 기획, PRD 작성, 요구사항 정의, 데이터 분석(지표 설계·퍼널 분석), A/B 테스트, 사용자 리서치, 애자일(스크럼)",
      project: "사내 지표 대시보드 구축 주도 — 데이터 기반 의사결정 문화 정착에 기여",
      education: "OO대학교 경영학과 (2015–2019)",
      certificate: "SQLD(SQL 개발자), ADsP(데이터 분석 준전문가)",
    },
    jobPost: PM_JOB,
  },

  // ───────── 기획 · 보통 — 기본기·협업은 좋으나 데이터/실험 근거가 빔 ─────────
  "기획-보통": {
    resume: {
      careers: [
        {
          company: "OO스타트업",
          start: "2023-01",
          end: "현재",
          role: "서비스 기획자",
          work: "B2C 콘텐츠 앱의 기능 기획과 요구사항 정의를 담당. 화면 흐름과 정책을 정리해 개발·디자인에 전달하고 신규 기능 3건을 릴리즈. 기획서와 회의록을 명확히 정리해 팀 간 소통 비용을 줄임.",
        },
      ],
      skills: "서비스 기획, 요구사항 정의, 화면 설계, 사용자 피드백 분석",
      project: "",
      education: "OO대학교 미디어커뮤니케이션학과 (2016–2020)",
      certificate: "",
    },
    jobPost: PM_JOB,
  },

  // ───────── 기획 · 낮음 — 직무 방향(마케팅)이 공고와 어긋남 ─────────
  "기획-낮음": {
    resume: {
      careers: [
        {
          company: "OO에이전시",
          start: "2023-06",
          end: "현재",
          role: "마케팅 담당자",
          work: "SNS 콘텐츠 기획과 광고 집행을 담당. 인스타그램·블로그 채널을 운영하며 팔로워를 늘리고, 프로모션 이벤트를 기획·실행.",
        },
      ],
      skills: "콘텐츠 마케팅, SNS 운영, 광고 집행, 카피라이팅",
      project: "",
      education: "OO대학교 광고홍보학과 (2017–2021)",
      certificate: "",
    },
    jobPost: PM_JOB,
  },

  // ───────── 개발 · 높음 — 필수+우대(대용량·MSA·Kafka)까지 충족 ─────────
  "개발-높음": {
    resume: {
      careers: [
        {
          company: "OO커머스",
          start: "2022-03",
          end: "현재",
          role: "백엔드 개발자",
          work: "Java와 Spring Boot로 결제·주문 도메인 백엔드를 4년간 맡아 핵심 서비스를 안정적으로 운영. 피크 시 초당 3천 요청이 몰리는 API를 무중단으로 운영. Kafka로 주문 이벤트를 비동기 처리해 서비스 간 결합도를 크게 낮춤. Redis 캐시 도입과 쿼리 튜닝으로 핵심 API p99 지연을 60% 단축.",
        },
      ],
      skills: "Java, Spring Boot, JPA, MySQL, Redis, Kafka, Docker, Git",
      project: "재고 관리 시스템 MSA 전환 — 모놀리식을 서비스 단위로 분리해 배포 독립성을 확보",
      education: "OO대학교 컴퓨터공학과 (2014–2020)",
      certificate: "정보처리기사",
    },
    jobPost: DEV_JOB,
  },

  // ───────── 개발 · 보통 — Java/Spring 필수는 충족, 대용량·MSA 근거 약함 ─────────
  "개발-보통": {
    resume: {
      careers: [
        {
          company: "OO스타트업",
          start: "2024-01",
          end: "현재",
          role: "백엔드 개발자",
          work: "Java와 Spring Boot로 주문 서비스 API를 설계·구현. MySQL에서 N+1 문제를 없애고 인덱스를 손봐 주요 API 응답시간을 40% 개선. 리소스 중심 URL과 상태코드 규칙을 지켜 REST API를 구성. 코드 리뷰에 참여하며 품질을 챙김.",
        },
      ],
      skills: "Java, Spring Boot, JPA, MySQL, Git",
      project: "",
      education: "OO대학교 소프트웨어학과 (2018–2024)",
      certificate: "정보처리기사",
    },
    jobPost: DEV_JOB,
  },

  // ───────── 개발 · 낮음 — 기술 방향(프론트엔드)이 공고와 어긋남 ─────────
  "개발-낮음": {
    resume: {
      careers: [
        {
          company: "OO웹에이전시",
          start: "2023-05",
          end: "현재",
          role: "프론트엔드 개발자",
          work: "React로 웹사이트 UI를 구현하고 반응형 웹을 퍼블리싱. 디자인 시안을 화면으로 옮기고 간단한 API를 연동. 자료구조·네트워크 등 CS 기초를 꾸준히 학습.",
        },
      ],
      skills: "JavaScript, React, HTML, CSS, Figma",
      project: "",
      education: "OO전문대학 웹디자인과 (2020–2022)",
      certificate: "",
    },
    jobPost: DEV_JOB,
  },
}
