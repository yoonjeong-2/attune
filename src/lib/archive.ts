/*
 * 아카이브(분석 기록) 데이터 모델 + 더미 데이터.
 * 지금은 목록 화면 확인용 더미. 실제 저장/불러오기는 다음 단계에서 붙인다.
 */
import type { AnalysisResult, FitLevel } from "@/lib/analysis"
import type { CareerEntry, ResumeForm } from "@/lib/resume"

export interface ArchiveRecord {
  id: string
  /** 사용자 지정 제목 (예: "OO페이 · 프로덕트 기획자") */
  title: string
  level: FitLevel
  /** 분석 날짜 "YYYY.MM.DD" */
  date: string
  strengths: number
  weaknesses: number
  /** 연결된 데모 케이스 키(예: "기획-높음"). 있으면 카드 클릭 시 상세 화면으로. */
  demoKey?: string
  /** 세션 중 저장한 카드 — 결과+이력서를 직접 들고 있어(더미), 클릭 시 다시 fetch 없이 바로 보여준다.
   *  resume/job 은 상세에서 "보완해서 다시 분석"할 때 입력 프리필에 쓴다. */
  saved?: { result: AnalysisResult; careers: CareerEntry[]; resume?: ResumeForm; job?: string }
}

/** 목록 화면 확인용 더미. 빈 상태를 보려면 이 배열을 [] 로 바꾸면 된다. */
export const DUMMY_ARCHIVE: ArchiveRecord[] = [
  { id: "1", title: "OO페이 · 프로덕트 기획자", level: "높음", date: "2026.07.05", strengths: 6, weaknesses: 0, demoKey: "기획-높음" },
  { id: "2", title: "OO커머스 · 서비스 기획", level: "보통", date: "2026.06.28", strengths: 2, weaknesses: 3, demoKey: "기획-보통" },
  { id: "3", title: "OO뱅크 · 백엔드 개발자", level: "높음", date: "2026.06.20", strengths: 4, weaknesses: 0, demoKey: "개발-높음" },
  { id: "4", title: "OO에이전시 · 기획 직무 지원", level: "낮음", date: "2026.05.30", strengths: 1, weaknesses: 3, demoKey: "기획-낮음" },
]
